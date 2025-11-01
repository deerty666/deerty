// ملف script.js

const cart = []; 
// ثابت رسوم التوصيل: 5 ريال
const DELIVERY_FEE = 5; 
// نوع الطلب الافتراضي هو 'توصيل' لأن الزر محدد في HTML
let orderType = 'توصيل'; 
let currentDeliveryFee = DELIVERY_FEE; 
let currentItem = {}; // للاستخدام في نافذة الخيارات

// --- وظائف نافذة السلة ---

function openCartModal() {
    // استخدام classList.add('show') للتناسق مع CSS
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

// --- وظائف إضافة وحذف الأصناف ---

function addToCart(buttonElement) {
    const menuItemDiv = buttonElement.closest('.menu-item');
    const name = menuItemDiv.dataset.name;
    let price = parseFloat(menuItemDiv.dataset.price);

    // معالجة الخصومات يدوياً (كما تم تحديدها في HTML)
    if (menuItemDiv.dataset.discount === '15' && name === 'نفر لحم حاشي مكموت') {
        price = 50; 
    } else if (menuItemDiv.dataset.discount === '15' && name === 'نفر لحم هرفي برمه مع المرق') {
         price = 68;
    }

    // منطق الفتح لخيارات الدجاج واللحوم
    if (menuItemDiv.closest('#chicken') || menuItemDiv.closest('#meats')) {
        currentItem = { name, price, element: menuItemDiv };
        // تحديث قيم النافذة المنبثقة قبل عرضها
        document.getElementById('base-item-price').value = price;
        document.getElementById('base-item-name').value = name;
        document.getElementById('option-item-name').innerText = name;

        // تحديث قيمة السعر في زر الإضافة بناءً على السعر الأساسي
        document.getElementById('option-final-price').innerText = price;
        document.getElementById('confirm-add-to-cart-btn').disabled = false;
        
        // تحديث وصف الصنف بناءً على الـ HTML
        const description = menuItemDiv.querySelector('.description').textContent;
        document.getElementById('option-item-description').textContent = description;

        openItemOptionsModal();
        return; // توقف هنا وانتظر تأكيد الخيارات
    }
    
    // إضافة صنف عادي بكمية 1 
    const existingItem = cart.find(item => item.name === name && item.options === 'لا توجد خيارات');

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1, options: 'لا توجد خيارات' }); 
    }
    
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// دالة تحديث كمية الصنف
function changeItemQuantity(index, delta) {
    const item = cart[index];
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartDisplay();
    }
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
        subtotalElement.textContent = '0.00 ريال';
        deliveryFeeElement.textContent = 'مجاني'; 
        grandTotalElement.textContent = '0.00 ريال';
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
                    <span class="item-name">${item.name}</span>
                    <span class="item-options">${item.options}</span>
                    <div class="item-quantity">
                        <button onclick="changeItemQuantity(${index}, 1)">+</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeItemQuantity(${index}, -1)">-</button>
                    </div>
                </div>
                <span class="item-subtotal">${itemTotal.toFixed(2)} ر.س</span>
            `;
            cartList.appendChild(itemDiv);
        });

        const grandTotal = subtotal + currentDeliveryFee; // الحساب الكلي

        // تحديث قيم العرض الجديدة
        subtotalElement.textContent = subtotal.toFixed(2) + ' ريال';
        
        // عرض رسوم التوصيل أو "مجاني"
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
    
    // تم تحديث رقم الواتساب إلى 966112020203
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '966112020203'; 
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // ربط الزر بالرابط
    whatsappBtn.onclick = function() {
        window.open(whatsappLink, '_blank');
    };
}

// --- وظائف نافذة الخيارات ---

function openItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.add('show');
    updateOptionTotal(); // لضمان عرض السعر الافتراضي
}

function closeItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.remove('show');
}

function updateOptionTotal() {
    const basePrice = parseFloat(document.getElementById('base-item-price').value);
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const riceInput = document.querySelector('input[name="rice"]:checked');
    
    let finalPrice = basePrice;
    let sizeText = '';
    let riceText = '';

    // 1. تحديد الحجم وتعديل السعر
    if(sizeInput) {
        sizeText = sizeInput.value;
        const sizeModifier = parseFloat(sizeInput.dataset.priceModifier || 0);
        finalPrice = basePrice + sizeModifier;
        
        // تحديث وصف السعر في خيارات الرز ليتناسب مع الحجم
        document.querySelectorAll('.rice-beshawer-price').forEach(el => {
            el.textContent = sizeText === 'نص' ? 'إضافة 1' : 'إضافة 4';
        });
        document.querySelectorAll('.rice-mandi-price').forEach(el => {
            el.textContent = sizeText === 'نص' ? 'إضافة 1' : 'إضافة 4';
        });
    }

    // 2. تحديد نوع الرز وإضافة سعر التعديل
    if(riceInput) {
        riceText = riceInput.value;
        if(sizeText === 'نص') {
            finalPrice += parseFloat(riceInput.dataset.priceModifierHalf || 0);
        } else if (sizeText === 'كامل') {
            finalPrice += parseFloat(riceInput.dataset.priceModifierFull || 0);
        }
    }

    // 3. تحديث العرض
    document.getElementById('option-final-price').innerText = finalPrice.toFixed(2);
}

function confirmAddToCart() {
    const name = document.getElementById('base-item-name').value;
    const price = parseFloat(document.getElementById('option-final-price').innerText);
    const size = document.querySelector('input[name="size"]:checked').value;
    const rice = document.querySelector('input[name="rice"]:checked').value;
    
    const optionsText = `${size} / رز ${rice}`;

    // إضافة صنف جديد بخياراته
    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateCartDisplay);
