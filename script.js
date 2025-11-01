Const cart = []; 
// بما أن زر التوصيل محدد افتراضياً في HTML، نبدأ بالرسوم 5 ريال
const DELIVERY_FEE = 5; 
let orderType = 'توصيل'; 
let currentDeliveryFee = DELIVERY_FEE; 

// --- وظائف نافذة السلة ---

function openCartModal() {
    document.getElementById('cart-overlay').classList.add('show');
    updateCartDisplay(); 
}

function closeCartModal() {
    document.getElementById('cart-overlay').classList.remove('show');
}

// --- وظيفة اختيار نوع الطلب (المنطق الأساسي للـ 5 ريال) ---

function selectOrderType(type, buttonElement) {
    // إزالة التحديد من جميع الأزرار
    document.getElementById('delivery-option').classList.remove('selected');
    document.getElementById('pickup-option').classList.remove('selected');

    // وضع التحديد على الزر الذي تم النقر عليه
    buttonElement.classList.add('selected');

    orderType = type;
    
    // منطق رسوم التوصيل: 5 ريال للتوصيل، وصفر للاستلام
    if (orderType === 'توصيل') {
        currentDeliveryFee = DELIVERY_FEE;
    } else { // استلام من المطعم
        currentDeliveryFee = 0;
    }
    
    updateCartDisplay(); // إعادة حساب وتحديث الإجماليات
}

// --- وظائف إضافة وحذف الأصناف (مبسطة) ---

function addToCart(buttonElement) {
    // يتم تجاوز نافذة التخصيص مؤقتاً وإضافة الصنف الأساسي
    const menuItemDiv = buttonElement.closest('.menu-item');
    const name = menuItemDiv.dataset.name;
    let price = parseFloat(menuItemDiv.dataset.price);

    // معالجة الخصومات يدوياً (كما تم تحديدها في HTML)
    if (menuItemDiv.dataset.discount === '15' && name === 'نفر لحم حاشي مكموت') {
        price = 50; 
    } else if (menuItemDiv.dataset.discount === '15' && name === 'نفر لحم هرفي برمه مع المرق') {
         price = 68;
    }
    
    // إضافة الصنف بكمية 1 
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // إضافة وصف مبسط للخيارات حتى يتم تطويرها
        cart.push({ name: name, price: price, quantity: 1, options: 'الخيار الافتراضي: نص/شعبي' }); 
    }
    
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// --- تحديث عرض السلة والإجماليات ---

function updateCartDisplay() {
    const cartList = document.getElementById('cart-items'); 
    const mobileBadge = document.getElementById('cart-badge'); 
    const whatsappBtn = document.getElementById('whatsapp-checkout-btn'); 

    const subtotalElement = document.getElementById('cart-subtotal-price'); 
    const deliveryFeeElement = document.getElementById('delivery-fee-display'); 
    const grandTotalElement = document.getElementById('cart-total-price'); 

    let subtotal = 0; 
    let itemCount = 0; 
    
    cartList.innerHTML = ''; 

    if (cart.length === 0) {
        // إذا كانت السلة فارغة
        cartList.innerHTML = '<p class="empty-cart-message">السلة فارغة حالياً. ابدأ بإضافة أصناف!</p>';
        subtotalElement.textContent = '0 ريال';
        deliveryFeeElement.textContent = 'مجاني'; 
        grandTotalElement.textContent = '0 ريال';
        mobileBadge.textContent = '0';
        whatsappBtn.setAttribute('disabled', 'disabled');
        
    } else {
        whatsappBtn.removeAttribute('disabled'); 

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal; 
            itemCount += item.quantity; 

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item-entry');
            itemDiv.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name} (x${item.quantity})</span>
                    <span class="item-options">${item.options}</span>
                    <span class="item-subtotal">${itemTotal.toFixed(2)} ر.س</span>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">حذف</button>
            `;
            cartList.appendChild(itemDiv);
        });

        const grandTotal = subtotal + currentDeliveryFee; // الحساب الكلي

        // تحديث قيم العرض الجديدة
        subtotalElement.textContent = subtotal.toFixed(2) + ' ريال';
        
        if (currentDeliveryFee > 0) {
             deliveryFeeElement.textContent = currentDeliveryFee.toFixed(2) + ' ريال';
        } else {
             deliveryFeeElement.textContent = 'مجاني'; 
        }

        grandTotalElement.textContent = grandTotal.toFixed(2) + ' ريال';
        mobileBadge.textContent = itemCount; 
        
        // تحديث زر الواتساب
        updateWhatsAppLink(grandTotal); 
    }
}

// --- منطق الواتساب (محدث برقم التواصل الجديد) ---
function updateWhatsAppLink(grandTotal) {
    const whatsappBtn = document.getElementById('whatsapp-checkout-btn');
    
    let message = `أهلاً، أود طلب الأصناف التالية من مطاعم سحايب ديرتي:\n\n`;
    message += `*نوع الطلب:* ${orderType}\n\n`; 
    
    let subtotal = 0; 

    // بناء نص الرسالة
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        message += `* ${item.name} (${item.options}) - الكمية: ${item.quantity} - السعر: ${itemTotal.toFixed(2)} ر.س\n`;
    });
    
    message += `\n--- تفاصيل الطلب ---\n`;
    message += `*مجموع الأصناف:* ${subtotal.toFixed(2)} ر.س\n`;
    
    if (currentDeliveryFee > 0) {
        message += `*رسوم التوصيل:* ${currentDeliveryFee.toFixed(2)} ر.س\n`;
    }
    
    message += `*الإجمالي الكلي للدفع: ${grandTotal.toFixed(2)} ر.س*`;

    whatsappBtn.textContent = `تأكيد الطلب (${orderType}) وإرساله عبر الواتساب`;
    
    // ***********************************************
    // * تم تحديث رقم الواتساب إلى 966112020203 هنا *
    // ***********************************************
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '966112020203'; 
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // ربط الزر بالرابط
    whatsappBtn.onclick = function() {
        window.open(whatsappLink, '_blank');
    };
}

// وظائف مساعدة فارغة مؤقتاً لتجنب الأخطاء
function closeItemOptionsModal() {
    document.getElementById('item-options-overlay').style.display = 'none';
}
function updateOptionTotal() {}
function confirmAddToCart() {}


// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateCartDisplay);
