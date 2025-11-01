// ===============================================
// الثوابت والمتغيرات الأساسية
// ===============================================
const RESTAURANT_NAME = "مطاعم سحايب ديرتي";
const WHATSAPP_NUMBER = "966536803598"; // الرقم المحدث
const DELIVERY_FEE = 5; 

// الحالة الأساسية للسلة ونوع الطلب
let cart = [];
let currentOrderType = 'توصيل'; 

// أسعار ترقية الحجم (من نصف إلى كامل)
// المضغوط، الزربيان، المقلوبة: (50 - 25 = 25)
const FULL_SIZE_MODIFIER_BASE = 25; 
// الشواية، المظبي، المندي، المدفون: (46 - 24 = 22)
const FULL_SIZE_MODIFIER_OTHER = 22; 

// ===============================================
// عناصر واجهة المستخدم (IDs)
// ===============================================
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartSubtotalPriceElement = document.getElementById('cart-subtotal-price');
const deliveryFeeDisplayElement = document.getElementById('delivery-fee-display');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
const deliveryOptionBtn = document.getElementById('delivery-option');
const pickupOptionBtn = document.getElementById('pickup-option');

// عناصر نافذة الخيارات الجديدة
const itemOptionsOverlay = document.getElementById('item-options-overlay');
const optionItemNameDisplay = document.getElementById('option-item-name');
const optionItemDescription = document.getElementById('option-item-description');
const baseItemPriceInput = document.getElementById('base-item-price');
const baseItemNameInput = document.getElementById('base-item-name');
const optionFinalPriceDisplay = document.getElementById('option-final-price');
const confirmAddToCartBtn = document.getElementById('confirm-add-to-cart-btn');

// ===============================================
// 1. وظائف فتح وإغلاق السلة والخيارات
// ===============================================

/**
 * يفتح نافذة السلة المنبثقة
 */
function openCartModal() {
    cartOverlay.classList.add('show');
    renderCart(); 
    updateTotal();
}

/**
 * يغلق نافذة السلة المنبثقة
 */
function closeCartModal() {
    cartOverlay.classList.remove('show');
}

/**
 * يغلق نافذة خيارات الصنف المنبثقة
 */
function closeItemOptionsModal() {
    itemOptionsOverlay.classList.remove('show');
}

// ===============================================
// 2. منطق السلة (الإضافة والكمية)
// ===============================================

/**
 * دالة إضافة صنف جديد (تم تعديلها لفتح الخيارات)
 * يتم استدعاؤها عبر زر "+ إضافة" في كل صنف بالقائمة
 */
function addToCart(button) {
    const itemElement = button.closest('.menu-item');
    const name = itemElement.getAttribute('data-name');
    const price = parseFloat(itemElement.getAttribute('data-price'));
    const descriptionElement = itemElement.querySelector('.description');
    const description = descriptionElement ? descriptionElement.textContent : '';

    // الأصناف التي تحتاج خيارات (الدجاج)
    const chickenItems = ["دجاج شواية", "دجاج مظبي", "دجاج مندي", "دجاج مدفون", "دجاج مضغوط", "دجاج زربيان", "دجاج مقلوبة"];
    
    if (chickenItems.includes(name)) {
        // إذا كان الصنف من الدجاج، افتح نافذة الخيارات
        openItemOptionsModal(name, price, description);
    } else {
        // إذا كان الصنف عادياً (مقبلات، مشروبات...) أضف مباشرة
        addItemToCart(name, price, 1, '');
    }
}

/**
 * دالة فعلية لإضافة الصنف إلى مصفوفة السلة
 */
function addItemToCart(name, price, quantity, options = '') {
    // بناء اسم فريد للصنف مع خياراته
    const finalName = options ? `${name} (${options})` : name;
    
    // البحث عن صنف مماثل تماماً (بنفس الخيارات)
    const existingItem = cart.find(item => item.name === finalName);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        // تخزين السعر النهائي المحسوب
        cart.push({ name: finalName, price, quantity }); 
    }

    updateCartBadge();
    updateTotal();
    renderCart();
}

/**
 * دالة لتحديث كمية صنف معين في السلة
 */
function updateQuantity(name, change) {
    const itemIndex = cart.findIndex(item => item.name === name);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            // حذف الصنف إذا وصلت الكمية إلى صفر أو أقل
            cart.splice(itemIndex, 1);
        }
    }

    renderCart(); // إعادة عرض محتويات السلة في النافذة المنبثقة
    updateCartBadge();
    updateTotal();
}

/**
 * دالة لإزالة صنف بالكامل
 */
function removeItem(name) {
    const itemIndex = cart.findIndex(item => item.name === name);
    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
    }
    renderCart();
    updateCartBadge();
    updateTotal();
}

// ===============================================
// 3. منطق نافذة الخيارات
// ===============================================

/**
 * يفتح نافذة الخيارات ويعيد تعيينها
 */
function openItemOptionsModal(name, price, description) {
    // 1. إعادة تعيين الخيارات إلى الافتراضي (نص + شعبي)
    document.querySelectorAll('input[name="size"]').forEach(radio => radio.checked = radio.value === 'نص');
    document.querySelectorAll('input[name="rice"]').forEach(radio => radio.checked = radio.value === 'شعبي');

    // 2. تحديث المعلومات الأساسية في النافذة
    optionItemNameDisplay.textContent = name;
    optionItemDescription.textContent = description;
    baseItemPriceInput.value = price;
    baseItemNameInput.value = name;
    
    // 3. تحديث أسعار الحجم بناءً على نوع الدجاج
    // (للتفريق بين المضغوط/الزربيان/المقلوبة و باقي الأصناف)
    const isBaseItem = ["دجاج مضغوط", "دجاج زربيان", "دجاج مقلوبة"].includes(name);
    const fullModifier = isBaseItem ? FULL_SIZE_MODIFIER_BASE : FULL_SIZE_MODIFIER_OTHER;
    
    const halfPriceDisplay = document.getElementById('size-half-price');
    const fullModifierDisplay = document.getElementById('size-full-modifier');
    const fullSizeRadio = document.querySelector('input[name="size"][value="كامل"]');
    
    // تحديث سعر النصف والسعر الإضافي للحبة الكاملة
    halfPriceDisplay.textContent = price; // السعر الأساسي هو سعر النصف
    fullModifierDisplay.textContent = fullModifier;
    fullSizeRadio.setAttribute('data-price-modifier', fullModifier);

    // 4. تحديث الإجمالي الأولي وتفعيل الزر
    updateOptionTotal();
    confirmAddToCartBtn.disabled = false;
    
    // 5. إظهار النافذة
    itemOptionsOverlay.classList.add('show');
}

/**
 * تحديث السعر النهائي في نافذة الخيارات عند تغيير الاختيارات
 */
function updateOptionTotal() {
    const basePrice = parseFloat(baseItemPriceInput.value);
    const selectedSizeRadio = document.querySelector('input[name="size"]:checked');
    const selectedRiceRadio = document.querySelector('input[name="rice"]:checked');
    
    let currentTotal = basePrice;
    let optionsText = [];
    
    // 1. حساب إضافة الحجم (نص/كامل)
    const sizeModifier = parseFloat(selectedSizeRadio.getAttribute('data-price-modifier')) || 0;
    currentTotal += sizeModifier;
    optionsText.push(selectedSizeRadio.value);

    // 2. حساب إضافة الرز
    let riceModifier = 0;
    const isFull = selectedSizeRadio.value === 'كامل';
    
    // استخدام الإضافة المناسبة بناءً على الحجم (نص أو كامل)
    if (isFull) {
        riceModifier = parseFloat(selectedRiceRadio.getAttribute('data-price-modifier-full')) || 0;
    } else { // نص
        riceModifier = parseFloat(selectedRiceRadio.getAttribute('data-price-modifier-half')) || 0;
    }
    currentTotal += riceModifier;
    optionsText.push(selectedRiceRadio.value);

    // 3. عرض الإجمالي النهائي
    optionFinalPriceDisplay.textContent = currentTotal;
    
    // حفظ السعر النهائي و الخيارات في زر التأكيد
    confirmAddToCartBtn.setAttribute('data-final-price', currentTotal);
    confirmAddToCartBtn.setAttribute('data-options', optionsText.join(' - '));
}

/**
 * تأكيد الإضافة للسلة من نافذة الخيارات
 */
function confirmAddToCart() {
    const name = baseItemNameInput.value;
    const finalPrice = parseFloat(confirmAddToCartBtn.getAttribute('data-final-price'));
    const options = confirmAddToCartBtn.getAttribute('data-options');

    if (finalPrice && name) {
        // إضافة الصنف بالسعر النهائي المحسوب والخيارات المحددة
        addItemToCart(name, finalPrice, 1, options); 
        closeItemOptionsModal();
    }
}


// ===============================================
// 4. وظائف عرض وتحديث واجهة المستخدم
// ===============================================

/**
 * دالة لتحديث شارة عدد الأصناف في شريط التنقل السفلي
 */
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
}

/**
 * دالة عرض محتوى السلة في واجهة المستخدم المنبثقة
 */
function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #999;">السلة فارغة حالياً.</p>';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item-entry');
        
        cartItemDiv.innerHTML = `
            <div>${item.name}</div>
            <div class="item-quantity">
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
                <span style="font-weight: bold;">${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
            </div>
            <div class="item-subtotal">${itemTotal} ر.س</div>
            <button class="remove-btn" onclick="removeItem('${item.name}')"><i class="fas fa-trash"></i></button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });
}

/**
 * دالة حساب وتحديث الإجمالي (تشمل رسوم التوصيل)
 */
function updateTotal() {
    // 1. حساب الإجمالي الفرعي (يستخدم الأسعار النهائية المخزنة في السلة)
    let subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalTotal = subTotal;
    let feeDisplay = 'مجاني';

    // 2. تطبيق رسوم التوصيل
    if (currentOrderType === 'توصيل' && subTotal > 0) {
        finalTotal += DELIVERY_FEE;
        feeDisplay = `${DELIVERY_FEE} ريال`;
    } else if (currentOrderType === 'استلام من المطعم' || subTotal === 0) {
        feeDisplay = 'مجاني';
    }

    // 3. تحديث عناصر العرض في واجهة المستخدم
    cartSubtotalPriceElement.textContent = `${subTotal} ريال`;
    deliveryFeeDisplayElement.textContent = feeDisplay;
    cartTotalPriceElement.textContent = `${finalTotal} ريال`;
    
    // 4. تفعيل/تعطيل زر الواتساب
    whatsappCheckoutBtn.disabled = subTotal === 0;
}

/**
 * دالة لتحديد طريقة الطلب (توصيل/استلام) وتحديث الستايل والإجمالي
 */
function selectOrderType(type, button) {
    currentOrderType = type;
    deliveryOptionBtn.classList.remove('selected');
    pickupOptionBtn.classList.remove('selected');
    button.classList.add('selected');
    updateTotal();
}

/**
 * دالة توليد رسالة واتساب وفتح رابط الإرسال
 */
function sendWhatsAppOrder() {
    if (cart.length === 0) return;

    let orderDetails = `*طلب جديد من ${RESTAURANT_NAME}* 🧑‍🍳\n\n`;
    orderDetails += `*نوع الطلب:* ${currentOrderType}\n\n`;
    orderDetails += `*تفاصيل الطلبات:*\n`;
    
    let subTotal = 0;
    
    // بناء قائمة الأصناف
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        // يتم إرسال اسم الصنف والخيارات (مثال: دجاج شواية (كامل - بشاور))
        orderDetails += `🔹 ${item.quantity} x ${item.name} = ${itemTotal} ر.س\n`; 
        subTotal += itemTotal;
    });

    let finalTotal = subTotal;
    
    // تضمين تفاصيل رسوم التوصيل في الرسالة
    if (currentOrderType === 'توصيل') {
        finalTotal += DELIVERY_FEE;
        orderDetails += `\n*الإجمالي الفرعي (الطلبات):* ${subTotal} ريال\n`;
        orderDetails += `*رسوم التوصيل:* ${DELIVERY_FEE} ريال\n`;
    }
    
    orderDetails += `\n*الإجمالي المطلوب:* ${finalTotal} ريال\n\n`;
    orderDetails += `يرجى تزويدنا بالعنوان لتوصيل الطلب.\nشكراً لكم.`;

    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// ===============================================
// 5. التهيئة الأولية
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // إخفاء الشارة إذا كانت السلة فارغة عند التحميل
    updateCartBadge(); 
    
    // إغلاق نافذة السلة عند الضغط خارجها
    cartOverlay.addEventListener('click', (event) => {
        if (event.target === cartOverlay) {
            closeCartModal();
        }
    });

    // إغلاق نافذة الخيارات عند الضغط خارجها
    itemOptionsOverlay.addEventListener('click', (event) => {
        if (event.target === itemOptionsOverlay) {
            closeItemOptionsModal();
        }
    });
    
    // تعيين خيار التوصيل كافتراضي عند التحميل
    selectOrderType(currentOrderType, deliveryOptionBtn);
});
