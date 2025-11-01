const cart = []; // المصفوفة التي تخزن جميع أصناف الطلب
let orderType = ''; // لتخزين نوع الطلب: 'توصيل' أو 'استلام'

// --- وظائف خاصة بنافذة السلة المنبثقة ---

function showCartOverlay(event) {
    if (event) {
        event.preventDefault(); 
    }
    document.getElementById('cart-overlay').classList.add('show');
}

function hideCartOverlay() {
    document.getElementById('cart-overlay').classList.remove('show');
}

// --- وظائف اختيار نوع الطلب ---

function resetCheckoutButtons() {
    // مسح التحديد من كلا الزرين وإخفاء زر الواتساب
    document.getElementById('delivery-btn').classList.remove('selected');
    document.getElementById('pickup-btn').classList.remove('selected');
    document.getElementById('checkout-whatsapp-btn').classList.add('hidden');
    orderType = '';
}

function selectDelivery() {
    resetCheckoutButtons();
    document.getElementById('delivery-btn').classList.add('selected');
    document.getElementById('checkout-whatsapp-btn').classList.remove('hidden');
    orderType = 'توصيل';
    updateWhatsAppLink();
}

function selectPickup() {
    resetCheckoutButtons();
    document.getElementById('pickup-btn').classList.add('selected');
    document.getElementById('checkout-whatsapp-btn').classList.remove('hidden');
    orderType = 'استلام من المطعم';
    updateWhatsAppLink();
}

// ------------------------------------

function addToCart(buttonElement) {
    const menuItemDiv = buttonElement.closest('.menu-item');
    const name = menuItemDiv.dataset.name;
    const price = parseFloat(menuItemDiv.dataset.price);

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const newItem = {
            name: name,
            price: price,
            quantity: 1
        };
        cart.push(newItem);
    }
    // إعادة تعيين خيار الدفع عند إضافة صنف جديد
    resetCheckoutButtons(); 
    updateCartDisplay();
}

// دالة لتحديث عرض السلة في النافذة المنبثقة
function updateCartDisplay() {
    const cartList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const mobileBadge = document.getElementById('mobile-cart-badge'); 
    
    // الأزرار الجديدة
    const deliveryBtn = document.getElementById('delivery-btn');
    const pickupBtn = document.getElementById('pickup-btn');
    const whatsappBtn = document.getElementById('checkout-whatsapp-btn');
    
    let total = 0;
    let itemCount = 0; 
    
    cartList.innerHTML = ''; 

    if (cart.length === 0) {
        // إذا كانت السلة فارغة: تعطيل جميع أزرار الدفع
        cartList.innerHTML = '<p class="empty-cart-message">السلة فارغة حالياً. ابدأ بإضافة أصناف!</p>';
        cartTotalElement.textContent = '0.00';
        mobileBadge.textContent = '0';
        
        deliveryBtn.setAttribute('disabled', 'disabled');
        pickupBtn.setAttribute('disabled', 'disabled');
        whatsappBtn.setAttribute('disabled', 'disabled');
        whatsappBtn.classList.add('hidden'); // تأكد من إخفائه
        resetCheckoutButtons(); // مسح أي تحديد سابق
        
    } else {
        // إذا كانت السلة مملوءة: تفعيل أزرار التوصيل والاستلام
        deliveryBtn.removeAttribute('disabled');
        pickupBtn.removeAttribute('disabled');
        whatsappBtn.removeAttribute('disabled'); // تفعيل الواتساب (إذا كان مرئياً)

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal; 
            itemCount += item.quantity; 

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item-entry');
            itemDiv.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty"> (x${item.quantity})</span>
                    <span class="item-subtotal">${itemTotal.toFixed(2)} ر.س</span>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">حذف</button>
            `;
            cartList.appendChild(itemDiv);
        });

        cartTotalElement.textContent = total.toFixed(2);
        mobileBadge.textContent = itemCount; 
        
        // إذا كان نوع الطلب محدداً مسبقاً، نحدث رابط الواتساب
        if (orderType) {
             updateWhatsAppLink();
             whatsappBtn.classList.remove('hidden');
        } else {
             whatsappBtn.classList.add('hidden'); // إبقائه مخفياً حتى يتم التحديد
        }
    }
}

// دالة لحذف صنف من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    resetCheckoutButtons(); // إعادة تعيين خيار الدفع عند الحذف
    updateCartDisplay();
}

// دالة لإنشاء رسالة ورابط الواتساب
function updateWhatsAppLink() {
    const whatsappBtn = document.getElementById('checkout-whatsapp-btn');
    
    let message = `أهلاً، أود طلب الأصناف التالية من مطاعم سحايب ديرتي:\n\n`;
    message += `*نوع الطلب:* ${orderType}\n\n`; // إضافة نوع الطلب
    
    let total = 0;

    // بناء نص الرسالة بناءً على محتوى السلة
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `* ${item.name} (الكمية: ${item.quantity}) - السعر: ${itemTotal.toFixed(2)} ر.س\n`;
    });
    
    message += `\n*الإجمالي الكلي للطلب: ${total.toFixed(2)} ر.س*`;

    // تحديث نص زر الواتساب بناءً على نوع الطلب
    whatsappBtn.textContent = `إرسال طلب (${orderType}) عبر واتساب`;
    
    // ترميز الرسالة للغة URL
    const encodedMessage = encodeURIComponent(message);
    
    const phoneNumber = '966536803598'; 
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    whatsappBtn.setAttribute('href', whatsappLink);
}

// دالة التمرير التلقائي للأقسام عند الضغط على الزر العلوي
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // نستخدم سلوك "smooth" للانتقال السلس
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// عند تحميل الصفحة لأول مرة، نتأكد من عرض السلة فارغة
document.addEventListener('DOMContentLoaded', updateCartDisplay);
