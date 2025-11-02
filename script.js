document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------- 1. منطق القائمة (Hamburger Menu) ----------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

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

    // ---------------------- 2. منطق سلة المشتريات (Cart) ----------------------
    let cartItems = [];
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');
    const WHATSAPP_NUMBER = '9665xxxxxxxx'; // <<==== مهم: ضع رقم الواتساب الخاص بك هنا

    // **الدالة المسؤولة عن تحديث الرقم في زر السلة**
    function updateCartDisplay() {
        viewCartBtn.textContent = `عرض السلة (${cartItems.length})`;
    }
    
    // **NEW/FIX: تحديث العداد عند تحميل الصفحة (سيكون 0)**
    updateCartDisplay(); 

    // وظيفة إضافة الطلب إلى السلة
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            
            // استخراج البيانات الأساسية
            const itemTitle = card.querySelector('.item-title').textContent;
            let basePrice = parseInt(card.getAttribute('data-base-price'));
            let itemTotalPrice = basePrice;
            let itemDescription = itemTitle; 

            // محاولة البحث عن خيارات (Inputs)
            const radioGroupName = card.querySelector('input[type="radio"]') ? card.querySelector('input[type="radio"]').name : null;
            
            if (radioGroupName) {
                const selectedRiceInput = card.querySelector(`input[name="${radioGroupName}"]:checked`);
                
                if (selectedRiceInput) {
                    const addPrice = parseInt(selectedRiceInput.getAttribute('data-add-price'));
                    const optionLabel = selectedRiceInput.previousElementSibling.previousElementSibling.textContent;
                    
                    itemTotalPrice = basePrice + addPrice;
                    itemDescription = itemTitle + " (إضافة " + optionLabel + ")";
                } else {
                     // إذا لم يتم اختيار أي خيار، نفترض الخيار الأساسي (رز شعبي)
                     itemDescription = itemTitle + " (رز شعبي)";
                }
            } else {
                itemDescription = itemTitle;
            }

            // إضافة الطلب إلى المصفوفة
            cartItems.push({
                title: itemTitle,
                description: itemDescription,
                price: itemTotalPrice,
                quantity: 1
            });

            alert(`✅ تم إضافة ${itemTitle} إلى السلة!`);
            // **NEW/FIX: تحديث العداد بعد كل عملية إضافة**
            updateCartDisplay(); 
        });
    });


    // ---------------------- 3. منطق توليد رسالة واتساب ----------------------
    viewCartBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            alert('السلة فارغة، يرجى إضافة بعض الوجبات أولاً.');
            return;
        }

        let orderDetails = "أهلاً، أود طلب الآتي من مطاعم ومطابخ سحايب ديرتي:\n\n";
        let total = 0;

        cartItems.forEach((item, index) => {
            orderDetails += `*${index + 1}.* ${item.description} - السعر: ${item.price} ريال\n`;
            total += item.price;
        });

        orderDetails += `\n*الإجمالي المطلوب: ${total} ريال*`;
        orderDetails += `\n\nيرجى تأكيد الطلب والموقع.`;

        const encodedMessage = encodeURIComponent(orderDetails);
        
        if (WHATSAPP_NUMBER === '9665xxxxxxxx') {
             alert('يرجى تحديث رقم الواتساب الخاص بك في ملف script.js (المتغير WHATSAPP_NUMBER) لكي يعمل الإرسال بشكل صحيح.');
             return;
        }

        const whatsappLink = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
        
        window.open(whatsappLink, '_blank');
    });

});
