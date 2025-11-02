document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------- 1. الثوابت والمتغيرات ----------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    let cartItems = []; // مصفوفة السلة
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    
    // عناصر الـ Modal
    const cartModal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
    const finalTotalDisplay = document.getElementById('final-total-display');
    const emptyCartMessage = document.querySelector('.empty-cart-message');

    const WHATSAPP_NUMBER = '966536803598'; // <<==== مهم: ضع رقم الواتساب الخاص بك هنا
    const DELIVERY_FEE = 5;


    // ---------------------- 2. منطق القائمة (Hamburger Menu) ----------------------
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        menuToggle.classList.toggle('open');
    });

    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.classList.remove('open');
        });
    });


    // ---------------------- 3. منطق السلة (Cart Logic) ----------------------

    // الدالة المسؤولة عن تحديث الرقم في زر السلة
    function updateCartDisplay() {
        const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        viewCartBtn.textContent = `عرض السلة (${totalItems})`;
    }
    
    updateCartDisplay(); 

    // وظيفة إضافة الطلب إلى السلة (محدثة لتدعم الكميات)
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            
            // استخراج البيانات الأساسية
            const itemTitle = card.querySelector('.item-title').textContent;
            let basePrice = parseInt(card.getAttribute('data-base-price'));
            let itemTotalPrice = basePrice;
            let itemDescription = itemTitle; 
            const itemId = card.getAttribute('data-item-id'); 
            const radioGroupName = card.querySelector('input[type="radio"]') ? card.querySelector('input[type="radio"]').name : null;
            let selectedOptionValue = 'basic'; 

            if (radioGroupName) {
                const selectedRiceInput = card.querySelector(`input[name="${radioGroupName}"]:checked`);
                
                if (selectedRiceInput) {
                    const addPrice = parseInt(selectedRiceInput.getAttribute('data-add-price'));
                    const optionLabel = selectedRiceInput.previousElementSibling.previousElementSibling.textContent;
                    
                    itemTotalPrice = basePrice + addPrice;
                    itemDescription = itemTitle + " (تغيير الأرز إلى " + optionLabel + ")";
                    selectedOptionValue = selectedRiceInput.value;
                } else {
                     itemDescription = itemTitle + " (رز شعبي)";
                }
            } else {
                itemDescription = itemTitle;
            }

            // المنطق الجديد: البحث عن الوجبة في السلة وزيادة الكمية
            const existingItem = cartItems.find(item => 
                item.id === itemId && item.option === selectedOptionValue
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cartItems.push({
                    id: itemId,
                    title: itemTitle,
                    description: itemDescription,
                    price: itemTotalPrice,
                    quantity: 1,
                    option: selectedOptionValue 
                });
            }
            
            updateCartDisplay(); 
        });
    });

    // ---------------------- 4. منطق عرض السلة (Modal Rendering) ----------------------

    // وظيفة إعادة رسم محتويات السلة في النافذة المنبثقة
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        
        if (cartItems.length === 0) {
            emptyCartMessage.style.display = 'block';
            document.querySelector('.cart-summary').style.display = 'none';
            sendOrderBtn.style.display = 'none';
            updateTotals(0, 'pickup'); // تحديث الإجمالي للصفر
            return;
        }

        emptyCartMessage.style.display = 'none';
        document.querySelector('.cart-summary').style.display = 'block';
        sendOrderBtn.style.display = 'block';

        let subtotal = 0;

        cartItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            
            const totalItemPrice = item.price * item.quantity;
            subtotal += totalItemPrice;
            
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <strong>${item.title}</strong>
                    <span>${item.description.replace(item.title, '').trim()}</span>
                </div>
                <div class="quantity-control" data-index="${index}">
                    <button class="quantity-btn decrease-qty">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn increase-qty">+</button>
                </div>
                <div class="item-price">
                    ${totalItemPrice} ريال
                </div>
            `;
            
            cartItemsContainer.appendChild(itemElement);
        });
        
        // ربط أحداث الكمية بعد رسم العناصر
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });

        // تحديث الإجماليات بعد الرسم
        const selectedOrderType = document.querySelector('input[name="order-method-modal"]:checked').value;
        updateTotals(subtotal, selectedOrderType);
    }
    
    // وظيفة تحديث الإجماليات
    function updateTotals(subtotal, orderType) {
        let deliveryFee = 0;
        if (orderType === 'delivery') {
            deliveryFee = DELIVERY_FEE;
            deliveryFeeDisplay.textContent = `${DELIVERY_FEE} ريال`;
            document.getElementById('delivery-fee-display').parentNode.style.fontWeight = 'bold';
        } else {
            deliveryFeeDisplay.textContent = `٠ ريال`;
            document.getElementById('delivery-fee-display').parentNode.style.fontWeight = 'normal';
        }

        const finalTotal = subtotal + deliveryFee;
        subtotalDisplay.textContent = `${subtotal} ريال`;
        finalTotalDisplay.textContent = `${finalTotal} ريال`;
    }

    // وظيفة للتحكم بالكميات (+ / -)
    function handleQuantityChange(e) {
        const button = e.target;
        const index = button.closest('.quantity-control').getAttribute('data-index');
        const item = cartItems[index];

        if (button.classList.contains('increase-qty')) {
            item.quantity += 1;
        } else if (button.classList.contains('decrease-qty')) {
            item.quantity -= 1;
            
            if (item.quantity <= 0) {
                // إزالة العنصر إذا وصلت الكمية إلى صفر
                cartItems.splice(index, 1);
            }
        }
        
        renderCartItems(); // إعادة رسم السلة
        updateCartDisplay(); // تحديث عداد الزر الرئيسي
    }
    
    // ربط تغيير خيار التوصيل/الاستلام بتحديث الإجمالي
    document.querySelectorAll('input[name="order-method-modal"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
            updateTotals(subtotal, radio.value);
        });
    });

    // ---------------------- 5. منطق فتح وإغلاق النافذة ----------------------

    viewCartBtn.addEventListener('click', () => {
        renderCartItems(); // تأكد من تحديث محتويات السلة
        cartModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // إغلاق النافذة عند الضغط خارجها
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // ---------------------- 6. منطق توليد رسالة واتساب ----------------------
    
    sendOrderBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            alert('السلة فارغة. لا يمكن إرسال طلب!');
            return;
        }
        
        const selectedOption = document.querySelector('input[name="order-method-modal"]:checked');
        const orderType = selectedOption.value;
        
        let deliveryCost = 0;
        let subtotal = 0;
        let orderDetails = "أهلاً، أود طلب الآتي من مطاعم ومطابخ سحايب ديرتي:\n\n";
        
        // 1. حساب إجمالي الطلبات (الآن مع الكميات)
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            orderDetails += `*${index + 1}.* (${item.quantity}x) ${item.description} - الإجمالي: ${itemTotal} ريال\n`;
            subtotal += itemTotal;
        });

        orderDetails += `\n----------------------------------\n`;
        orderDetails += `*إجمالي سعر الوجبات: ${subtotal} ريال*\n`;

        // 2. تطبيق رسوم التوصيل
        if (orderType === 'delivery') {
            deliveryCost = DELIVERY_FEE;
            orderDetails += `*رسوم التوصيل: ٥ ريال*\n`;
            orderDetails += `\n*المطلوب:* توصيل\n`;
            orderDetails += `*الرجاء إرسال الموقع:\n\n*`;
        } else {
            orderDetails += `*رسوم الاستلام: ٠ ريال*\n`;
            orderDetails += `\n*المطلوب:* استلام من المطعم\n`;
        }
        
        // 3. عرض الإجمالي النهائي
        const finalTotal = subtotal + deliveryCost;
        orderDetails += `*الإجمالي النهائي المطلوب: ${finalTotal} ريال*`;

        orderDetails += `\n----------------------------------\n`;
        
        const encodedMessage = encodeURIComponent(orderDetails);
        
        if (WHATSAPP_NUMBER === '9665xxxxxxxx') {
             alert('يرجى تحديث رقم الواتساب الخاص بك في ملف script.js (المتغير WHATSAPP_NUMBER) لكي يعمل الإرسال بشكل صحيح.');
             return;
        }

        const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
        
        window.open(whatsappLink, '_blank');
        
        // إغلاق السلة بعد الإرسال (اختياري)
        cartModal.style.display = 'none';
    });

});
