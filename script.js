let cart = [];
const DELIVERY_FEE = 5.00;
const whatsappNumber = '966112020203'; // رقم المطعم (تأكد من الرقم)

document.addEventListener('DOMContentLoaded', () => {
    // 1. إدارة التنقل السفلي
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // إزالة التنشيط من الكل
            navItems.forEach(i => i.classList.remove('active-nav'));
            // تفعيل العنصر المختار
            item.classList.add('active-nav');
        });
    });

    // 2. إدارة أيقونات الفئات العلوية
    const categoryIconItems = document.querySelectorAll('.main-categories-scroll .category-icon-item');
    categoryIconItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // منع الانتقال المباشر وتطبيق التنشيط
            e.preventDefault();
            categoryIconItems.forEach(i => i.classList.remove('active-icon'));
            this.classList.add('active-icon');

            // التمرير إلى القسم المستهدف
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 3. تحديث العرض الأولي للسلة
    updateCartDisplay();
});


// ⭐️ دالة فتح نافذة خيارات الصنف ⭐️
function addToCart(buttonElement) {
    const itemElement = buttonElement.closest('.menu-item');
    const itemName = itemElement.getAttribute('data-name');
    const itemPrice = parseFloat(itemElement.getAttribute('data-price'));
    const itemCategory = itemElement.getAttribute('data-category');
    
    // تحديد الأصناف التي تحتاج خيارات: اللحوم والدجاج
    const requiresOptions = itemCategory === 'chicken' || itemCategory === 'meat';
    
    if (requiresOptions) {
        // إذا كان الصنف يحتاج خيارات (دجاج/لحم)
        const isTais = itemElement.hasAttribute('data-is-tais');

        // إعداد النافذة المنبثقة
        document.getElementById('option-item-name').textContent = itemName;
        document.getElementById('option-item-description').textContent = itemElement.querySelector('.description').textContent;
        document.getElementById('base-item-price').value = itemPrice;
        document.getElementById('base-item-name').value = itemName;
        
        // إخفاء/إظهار خيار الحجم (فقط الدجاج يحتاج نص/كامل، التيس له تقسيم مختلف)
        const sizeGroup = document.querySelector('.options-group:nth-child(2)'); // اختر الحجم
        if (isTais || itemName.includes('نفر لحم')) {
            sizeGroup.style.display = 'none';
        } else {
            sizeGroup.style.display = 'block';
            // إعادة ضبط الإذاعة إلى "نص" افتراضياً
            document.querySelector('input[name="size"][value="نص"]').checked = true;
        }

        // تحديث أسعار الأرز بناءً على الصنف (دجاج نص، دجاج كامل، لحم نفر، تيس)
        updateRicePrices(itemName);

        // ⭐️⭐️ هذا السطر الحاسم الذي يفتح النافذة ⭐️⭐️
        document.getElementById('item-options-overlay').classList.add('show');
        
        // تحديث السعر الإجمالي مباشرة عند الفتح
        updateOptionTotal();

    } else {
        // إذا كان الصنف بسيطاً (جانبية/مشروبات/حلويات)
        addItemToCart({
            name: itemName,
            price: itemPrice,
            quantity: 1,
            options: 'صنف بسيط'
        });
    }
}

// ⭐️ دالة تحديث أسعار الأرز في النافذة المنبثقة ⭐️
function updateRicePrices(itemName) {
    const isFullChicken = itemName.includes('كامل') && itemName.includes('دجاج');
    const isHalfChicken = itemName.includes('نص') && itemName.includes('دجاج');
    const isNafarMeat = itemName.includes('نفر لحم');
    const isTaisFull = itemName.includes('تيس مندي كامل');
    const isTaisHalf = itemName.includes('نص تيس مندي');
    const isTaisQuarter = itemName.includes('ربع تيس مندي');
    
    // استهداف جميع خيارات الأرز التي تحتاج تحديث السعر
    const riceOptions = document.querySelectorAll('input[name="rice"]');
    
    riceOptions.forEach(input => {
        let priceModifier = 0;
        
        if (input.value !== 'شعبي') { // لا تحديث للسعر الشعبي (مجاني)
            if (isFullChicken) {
                priceModifier = input.getAttribute('data-price-modifier-full') || 0;
            } else if (isHalfChicken) {
                priceModifier = input.getAttribute('data-price-modifier-half') || 0;
            } else if (isNafarMeat) {
                priceModifier = input.getAttribute('data-price-modifier-nafal') || 0;
            } else if (isTaisFull) {
                priceModifier = input.getAttribute('data-price-modifier-tais-full') || 0;
            } else if (isTaisHalf) {
                priceModifier = input.getAttribute('data-price-modifier-tais-half') || 0;
            } else if (isTaisQuarter) {
                priceModifier = input.getAttribute('data-price-modifier-tais-quarter') || 0;
            }
        }
        
        const priceSpan = input.closest('.option-label').querySelector('span');
        if (priceSpan) {
             // نستخدم parseFloat لضمان المقارنة الرقمية
             priceModifier = parseFloat(priceModifier);
             if (priceModifier > 0) {
                 priceSpan.textContent = `+ ${priceModifier.toFixed(2)} ريال`;
             } else {
                 priceSpan.textContent = 'إضافة مخصص'; // نص افتراضي أو مجاني إذا كان 0
             }
        }
    });
}

// ⭐️ دالة تحديث السعر الإجمالي في النافذة المنبثقة ⭐️
function updateOptionTotal() {
    let basePrice = parseFloat(document.getElementById('base-item-price').value);
    let finalPrice = basePrice;
    
    // 1. تعديل الحجم (فقط للدجاج)
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const sizeGroup = document.querySelector('.options-group:nth-child(2)'); // اختر الحجم
    
    if (sizeInput && sizeGroup.style.display !== 'none') {
         finalPrice += parseFloat(sizeInput.getAttribute('data-price-modifier')) || 0;
    }

    // 2. تعديل نوع الأرز
    const riceInput = document.querySelector('input[name="rice"]:checked');
    if (riceInput) {
        const itemName = document.getElementById('base-item-name').value;
        const isFullChicken = itemName.includes('كامل') && itemName.includes('دجاج');
        const isHalfChicken = itemName.includes('نص') && itemName.includes('دجاج');
        const isNafarMeat = itemName.includes('نفر لحم');
        const isTaisFull = itemName.includes('تيس مندي كامل');
        const isTaisHalf = itemName.includes('نص تيس مندي');
        const isTaisQuarter = itemName.includes('ربع تيس مندي');
        
        let ricePriceModifier = 0;
        
        if (riceInput.value !== 'شعبي') {
            if (isFullChicken) {
                ricePriceModifier = parseFloat(riceInput.getAttribute('data-price-modifier-full')) || 0;
            } else if (isHalfChicken) {
                ricePriceModifier = parseFloat(riceInput.getAttribute('data-price-modifier-half')) || 0;
            } else if (isNafarMeat) {
                ricePriceModifier = parseFloat(riceInput.getAttribute('data-price-modifier-nafal')) || 0;
            } else if (isTaisFull) {
                ricePriceModifier = parseFloat(riceInput.getAttribute('data-price-modifier-tais-full')) || 0;
            } else if (isTaisHalf) {
                ricePriceModifier = parseFloat(riceInput.getAttribute('data-price-modifier-tais-half')) || 0;
            } else if (isTaisQuarter) {
                ricePriceModifier = parseFloat(riceInput.getAttribute('data-price-modifier-tais-quarter')) || 0;
            }
        }
        
        finalPrice += ricePriceModifier;
    }
    
    // تحديث العرض
    document.getElementById('option-final-price').textContent = finalPrice.toFixed(2);
}

// ⭐️ دالة تأكيد الإضافة للسلة ⭐️
function confirmAddToCart() {
    const itemName = document.getElementById('base-item-name').value;
    const basePrice = parseFloat(document.getElementById('base-item-price').value);
    const finalPrice = parseFloat(document.getElementById('option-final-price').textContent);
    
    let optionsText = [];
    
    // 1. الحجم (فقط للدجاج)
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const sizeGroup = document.querySelector('.options-group:nth-child(2)'); // اختر الحجم
    
    if (sizeInput && sizeGroup.style.display !== 'none') {
        optionsText.push(`الحجم: ${sizeInput.value}`);
    } else if (itemName.includes('نفر لحم')) {
         optionsText.push(`الحجم: نفر`);
    } else if (itemName.includes('تيس')) {
         optionsText.push(`الحجم: ${itemName.split(' ')[0]} ${itemName.split(' ')[1]}`); // لتظهر (تيس كامل) أو (نص تيس)
    }


    // 2. نوع الأرز
    const riceInput = document.querySelector('input[name="rice"]:checked');
    if (riceInput) {
        optionsText.push(`نوع الأرز: ${riceInput.value}`);
    }
    
    addItemToCart({
        name: itemName,
        price: finalPrice, // نستخدم السعر النهائي المحسوب
        quantity: 1,
        options: optionsText.join(', ')
    });

    closeItemOptionsModal();
}

// ⭐️ دالة إضافة الصنف إلى مصفوفة السلة ⭐️
function addItemToCart(item) {
    // حاول العثور على نفس الصنف بنفس الخيارات في السلة
    const existingItem = cart.find(cartItem => 
        cartItem.name === item.name && cartItem.options === item.options
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(item);
    }
    
    updateCartDisplay();
}

// ⭐️ دالة إزالة صنف من السلة ⭐️
function removeItemFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// ⭐️ دالة تحديث كمية الصنف ⭐️
function updateItemQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeItemFromCart(index);
    } else {
        updateCartDisplay();
    }
}

// ⭐️ دالة تحديث عرض السلة ⭐️
function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartSubtotalPrice = document.getElementById('cart-subtotal-price');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartBadge = document.getElementById('cart-badge');
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
    
    cartItemsDiv.innerHTML = '';
    
    let subtotal = 0;
    let totalItems = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item-row');
        itemElement.innerHTML = `
            <div class="item-name-options">
                <span class="item-quantity">${item.quantity}x</span>
                <div class="item-name-options-details">
                    <span class="item-title">${item.name}</span>
                    <span class="item-options">${item.options}</span>
                </div>
            </div>
            <div class="item-price-controls">
                <span class="item-price">${itemTotal.toFixed(2)} ر.س</span>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateItemQuantity(${index}, 1)"><i class="fas fa-plus"></i></button>
                    <button class="quantity-btn" onclick="updateItemQuantity(${index}, -1)"><i class="fas fa-minus"></i></button>
                </div>
            </div>
        `;
        cartItemsDiv.appendChild(itemElement);
    });
    
    const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
    const isDelivery = document.getElementById('delivery-option').classList.contains('selected');
    const currentDeliveryFee = isDelivery ? DELIVERY_FEE : 0.00;
    
    deliveryFeeDisplay.textContent = `${currentDeliveryFee.toFixed(2)} ر.س`;
    
    const total = subtotal + currentDeliveryFee;
    
    cartSubtotalPrice.textContent = `${subtotal.toFixed(2)} ر.س`;
    cartTotalPrice.textContent = `${total.toFixed(2)} ر.س`;
    cartBadge.textContent = totalItems;
    
    // تفعيل زر الواتساب عند وجود أصناف
    if (totalItems > 0) {
        whatsappCheckoutBtn.disabled = false;
        whatsappCheckoutBtn.onclick = sendWhatsappMessage;
    } else {
        whatsappCheckoutBtn.disabled = true;
        whatsappCheckoutBtn.onclick = null;
        cartItemsDiv.innerHTML = '<p class="empty-cart-message">السلة فارغة. أضف بعض الوجبات الشهية!</p>';
    }
}


// ⭐️ دالة اختيار نوع الطلب ⭐️
function selectOrderType(type, button) {
    const deliveryBtn = document.getElementById('delivery-option');
    const pickupBtn = document.getElementById('pickup-option');
    const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
    
    // إزالة التحديد من الكل وتحديد الزر الحالي
    deliveryBtn.classList.remove('selected');
    pickupBtn.classList.remove('selected');
    button.classList.add('selected');
    
    // تحديث رسوم التوصيل والمجموع الكلي
    if (type === 'توصيل') {
        deliveryFeeDisplay.textContent = `${DELIVERY_FEE.toFixed(2)} ر.س`;
    } else {
        deliveryFeeDisplay.textContent = '0.00 ر.س';
    }
    
    updateCartDisplay();
}

// ⭐️ دالة إغلاق النوافذ المنبثقة ⭐️
function closeItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.remove('show');
    // إعادة ضبط الراديو إلى القيم الافتراضية عند الإغلاق
    document.querySelector('input[name="size"][value="نص"]').checked = true;
    document.querySelector('input[name="rice"][value="شعبي"]').checked = true;
}

function openCartModal() {
    document.getElementById('cart-overlay').classList.add('show');
    updateCartDisplay();
}

function closeCartModal() {
    document.getElementById('cart-overlay').classList.remove('show');
}

// ⭐️ دالة إرسال الطلب عبر الواتساب ⭐️
function sendWhatsappMessage() {
    const isDelivery = document.getElementById('delivery-option').classList.contains('selected');
    const orderType = isDelivery ? 'توصيل' : 'استلام من المطعم';
    const deliveryFee = isDelivery ? DELIVERY_FEE : 0;
    
    let message = `*طلب جديد* (${orderType}):\n\n`;
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        message += `${index + 1}. ${item.name} (${item.options})\n`;
        message += `   العدد: ${item.quantity} - السعر الإجمالي: ${itemTotal.toFixed(2)} ر.س\n`;
    });
    
    message += `\n--- ملخص الطلب ---\n`;
    message += `إجمالي الأصناف: ${subtotal.toFixed(2)} ر.س\n`;
    message += `رسوم ${orderType}: ${deliveryFee.toFixed(2)} ر.س\n`;
    message += `*المجموع الكلي: ${(subtotal + deliveryFee).toFixed(2)} ر.س*\n\n`;
    
    if (isDelivery) {
        message += `*الرجاء إرسال الموقع وتفاصيل العنوان:*`;
    } else {
        message += `*الرجاء تحديد موعد الاستلام:*`;
    }
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
