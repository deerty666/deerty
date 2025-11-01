// ملف script.js

const cart = []; 
// ثابت رسوم التوصيل: 5 ريال
const DELIVERY_FEE = 5; 
// نوع الطلب الافتراضي هو 'توصيل' لأن الزر محدد في HTML
let orderType = 'توصيل'; 
let currentDeliveryFee = DELIVERY_FEE; 
let currentItem = {}; // للاستخدام في نافذة الخيارات

// --- وظائف نافذة السلة (لم تتغير) ---

function openCartModal() {
    document.getElementById('cart-overlay').classList.add('show');
    updateCartDisplay(); 
}

function closeCartModal() {
    document.getElementById('cart-overlay').classList.remove('show');
}

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

// --- وظائف إضافة وحذف الأصناف (تم التعديل) ---

function addToCart(buttonElement) {
    const menuItemDiv = buttonElement.closest('.menu-item');
    const name = menuItemDiv.dataset.name;
    let price = parseFloat(menuItemDiv.dataset.price);
    const category = menuItemDiv.dataset.category; // لإضافة تصنيف لتحديد فتح المودال

    // منطق الفتح لخيارات الدجاج واللحوم
    // يتم فتح الخيارات فقط إذا كانت الأصناف من تصنيف 'chicken' أو 'meat' (نفر لحم مندي)
    if (category === 'chicken' || (category === 'meat' && name === 'نفر لحم مندي')) {
        currentItem = { name, price, element: menuItemDiv };
        // تحديث قيم النافذة المنبثقة قبل عرضها
        document.getElementById('base-item-price').value = price;
        document.getElementById('base-item-name').value = name;
        document.getElementById('option-item-name').innerText = name;

        // تحديث قيمة السعر في زر الإضافة بناءً على السعر الأساسي
        document.getElementById('option-final-price').innerText = price.toFixed(2);
        document.getElementById('confirm-add-to-cart-btn').disabled = false;
        
        // تحديث وصف الصنف بناءً على الـ HTML
        const descriptionElement = menuItemDiv.querySelector('.description');
        const description = descriptionElement ? descriptionElement.textContent : '';
        document.getElementById('option-item-description').textContent = description;
        
        // إعادة تعيين خيارات الحجم والرز إلى الوضع الافتراضي عند الفتح
        document.querySelector('input[name="size"][value="نص"]').checked = true;
        document.querySelector('input[name="rice"][value="شعبي"]').checked = true;


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


// --- تحديث عرض السلة والإجماليات (لم تتغير) ---

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

// --- منطق الواتساب (لم يتغير) ---
function updateWhatsAppLink(grandTotal) {
    const whatsappBtn = document.getElementById('whatsapp-checkout-btn');
    
    let message = `أهلاً، أود طلب الأصناف التالية من مطاعم سحايب ديرتي:\n\n`;
    message += `*نوع الطلب:* ${orderType}\n\n`; 
    
    let subtotal = 0; 

    // بناء نص الرسالة
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        // تعديل format الرسالة لتكون أوضح
        message += `* ${item.name} (${item.options}) - الكمية: ${item.quantity} - السعر: ${itemTotal.toFixed(2)} ر.س\n`;
    });
    
    message += `\n--- تفاصيل الطلب ---\n`;
    message += `*مجموع الأصناف:* ${subtotal.toFixed(2)} ر.س\n`;
    
    if (currentDeliveryFee > 0) {
        message += `*رسوم التوصيل:* ${currentDeliveryFee.toFixed(2)} ر.س\n`;
    }
    
    message += `*الإجمالي الكلي للدفع: ${grandTotal.toFixed(2)} ر.س*`;

    whatsappBtn.textContent = `تأكيد الطلب (${orderType}) وإرساله عبر الواتساب`;
    
    // رقم الواتساب المحدث: 966112020203
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '966112020203'; 
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // ربط الزر بالرابط
    whatsappBtn.onclick = function() {
        window.open(whatsappLink, '_blank');
    };
}

// --- وظائف نافذة الخيارات (تم التعديل) ---

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
    
    // 1. تحديد الحجم وتعديل السعر
    if(sizeInput) {
        sizeText = sizeInput.value;
        // نستخدم basePrice + sizeModifier مباشرة لتطبيق التعديل على السعر الأصلي
        finalPrice = basePrice + parseFloat(sizeInput.dataset.priceModifier || 0);
        
        // تحديث وصف السعر في خيارات الرز ليتناسب مع الحجم
        document.querySelectorAll('.rice-beshawer-price').forEach(el => {
            el.textContent = sizeText === 'نص' ? 'إضافة 1' : 'إضافة 4';
        });
        document.querySelectorAll('.rice-mandi-price').forEach(el => {
            el.textContent = sizeText === 'نص' ? 'إضافة 1' : 'إضافة 4';
        });
        // NEW: تحديث سعر المثلوثه
        document.querySelectorAll('.rice-mathloutha-price').forEach(el => {
            el.textContent = sizeText === 'نص' ? 'إضافة 1' : 'إضافة 4';
        });
    }

    // 2. تحديد نوع الرز وإضافة سعر التعديل
    if(riceInput) {
        if(sizeText === 'نص') {
            // يستخدم سعر النص (data-price-modifier-half) الذي تم تحديده بـ 1 ريال
            finalPrice += parseFloat(riceInput.dataset.priceModifierHalf || 0);
        } else if (sizeText === 'كامل') {
            // يستخدم سعر الكامل (data-price-modifier-full) الذي تم تحديده بـ 4 ريال
            finalPrice += parseFloat(riceInput.dataset.priceModifierFull || 0);
        }
    }

    // 3. تحديث العرض
    document.getElementById('option-final-price').innerText = finalPrice.toFixed(2);
}

function confirmAddToCart() {
    const name = document.getElementById('base-item-name').value;
    const price = parseFloat(document.getElementById('option-final-price').innerText);
    // التأكد من وجود قيمة محددة قبل محاولة قراءتها
    const size = document.querySelector('input[name="size"]:checked') ? document.querySelector('input[name="size"]:checked').value : 'غير محدد';
    const rice = document.querySelector('input[name="rice"]:checked') ? document.querySelector('input[name="rice"]:checked').value : 'غير محدد';
    
    const optionsText = `${size} / رز ${rice}`;

    // إضافة صنف جديد بخياراته
    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', updateCartDisplay);
