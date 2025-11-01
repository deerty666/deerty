// ملف script.js

const cart = []; 
const DELIVERY_FEE = 5; 
let orderType = 'توصيل'; 
let currentDeliveryFee = DELIVERY_FEE; 
let currentItem = {}; 

// --- وظائف نافذة السلة ---

function openCartModal() {
    document.getElementById('cart-overlay').classList.add('show');
    updateCartDisplay(); 
}

function closeCartModal() {
    document.getElementById('cart-overlay').classList.remove('show');
}

function selectOrderType(type, buttonElement) {
    document.getElementById('delivery-option').classList.remove('selected');
    document.getElementById('pickup-option').classList.remove('selected');
    buttonElement.classList.add('selected');

    orderType = type;
    
    // تحديد رسوم التوصيل
    currentDeliveryFee = (orderType === 'توصيل') ? DELIVERY_FEE : 0;
    
    updateCartDisplay(); 
}

// --- وظائف إضافة وحذف الأصناف (مصححة) ---

function addToCart(buttonElement) {
    const menuItemDiv = buttonElement.closest('.menu-item');
    
    // 🛑🛑🛑 فحص سلامة البيانات الحاسم 🛑🛑🛑
    // إذا لم يعثر على العنصر أو الخصائص الأساسية، يتوقف لتجنب التعطل
    if (!menuItemDiv || !menuItemDiv.dataset.name || !menuItemDiv.dataset.price || !menuItemDiv.dataset.category) {
        console.error("Critical Error: Missing .menu-item container or data attributes (name, price, category).");
        // يمكن إزالة Alert بعد التأكد من عمل الكود
        // alert("عفواً، بيانات الصنف مفقودة. يرجى مراجعة index.html"); 
        return; 
    }

    const name = menuItemDiv.dataset.name;
    let price = parseFloat(menuItemDiv.dataset.price);
    const category = menuItemDiv.dataset.category; 
    
    // خاصية لتمييز اللحوم الكبيرة
    const isTais = menuItemDiv.dataset.isTais === 'true'; 

    // منطق فتح نافذة الخيارات
    if (category === 'chicken' || (category === 'meat' && name === 'نفر لحم مندي') || isTais) {
        currentItem = { name, price, element: menuItemDiv };
        
        // تمرير البيانات إلى النافذة المنبثقة
        document.getElementById('base-item-price').value = price;
        document.getElementById('base-item-name').value = name;
        document.getElementById('option-item-name').innerText = name;
        
        // إعادة تعيين الخيارات للوضع الافتراضي عند الفتح
        const defaultSize = document.querySelector('input[name="size"][value="نص"]');
        if (defaultSize) defaultSize.checked = true;
        
        const defaultRice = document.querySelector('input[name="rice"][value="شعبي"]');
        if (defaultRice) defaultRice.checked = true;

        const descriptionElement = menuItemDiv.querySelector('.description');
        const description = descriptionElement ? descriptionElement.textContent : '';
        document.getElementById('option-item-description').textContent = description;
        
        // تحديث المجموع الفوري قبل الفتح
        updateOptionTotal();
        
        openItemOptionsModal();
        return; 
    }
    
    // إضافة صنف عادي (لا يحتاج خيارات)
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

function changeItemQuantity(index, delta) {
    const item = cart[index];
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartDisplay();
    }
}

// --- تحديث عرض السلة والإجماليات (لم يتغير) ---
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

        const grandTotal = subtotal + currentDeliveryFee;

        subtotalElement.textContent = subtotal.toFixed(2) + ' ريال';
        
        if (currentDeliveryFee > 0) {
             deliveryFeeElement.textContent = currentDeliveryFee.toFixed(2) + ' ريال';
        } else {
             deliveryFeeElement.textContent = 'مجاني'; 
        }

        grandTotalElement.textContent = grandTotal.toFixed(2) + ' ريال';
        mobileBadge.textContent = itemCount; 
        
        updateWhatsAppLink(grandTotal); 
    }
}

// --- منطق الواتساب (لم يتغير) ---
function updateWhatsAppLink(grandTotal) {
    const whatsappBtn = document.getElementById('whatsapp-checkout-btn');
    
    let message = `أهلاً، أود طلب الأصناف التالية من مطاعم سحايب ديرتي:\n\n`;
    message += `*نوع الطلب:* ${orderType}\n\n`; 
    
    let subtotal = 0; 

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
    
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '966112020203'; 
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    whatsappBtn.onclick = function() {
        window.open(whatsappLink, '_blank');
    };
}

// --- وظائف نافذة الخيارات (التعديل الرئيسي لمنطق التسعير) ---

function openItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.add('show');
}

function closeItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.remove('show');
}

function updateOptionTotal() {
    const basePrice = parseFloat(document.getElementById('base-item-price').value || 0);
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const riceInput = document.querySelector('input[name="rice"]:checked');
    
    const itemName = document.getElementById('base-item-name').value;
    
    let finalPrice = basePrice;
    let sizeText = sizeInput ? sizeInput.value : 'نص'; // افتراضي نص

    // تحديد حالة الصنف
    const isTaisItem = (currentItem.element && currentItem.element.dataset.isTais === 'true');
    const isNafarItem = itemName === 'نفر لحم مندي';

    // 1. تحديد الحجم وتعديل السعر الأساسي
    if(sizeInput) {
        // نستخدم priceModifier لتطبيق تعديل الحجم (نص/كامل/ربع)
        finalPrice = basePrice + parseFloat(sizeInput.dataset.priceModifier || 0);
    }
    
    // 2. تحديث مؤشرات أسعار الأرز في الواجهة
    document.querySelectorAll('.rice-beshawer-price, .rice-mandi-price, .rice-mathloutha-price').forEach(el => {
        if (isTaisItem) {
             el.textContent = 'إضافة مخصص'; // نعتمد على المنطق أدناه لتحديد قيمة 50/25/13
        } else if (isNafarItem) {
             el.textContent = 'إضافة 5'; 
        } else {
             // الدجاج
             const halfPrice = parseFloat(riceInput.dataset.priceModifierHalf || 0);
             const fullPrice = parseFloat(riceInput.dataset.priceModifierFull || 0);
             el.textContent = sizeText === 'نص' ? `إضافة ${halfPrice}` : `إضافة ${fullPrice}`; 
        }
    });


    // 3. تحديد نوع الرز وإضافة سعر التعديل (المنطق الجديد)
    if(riceInput) {
        if (isTaisItem) {
            // ⭐️ المنطق الخاص بالتيس (50/25/13 ريال)
            if (sizeText === 'كامل') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisFull || 0); // 50
            } else if (sizeText === 'نص') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisHalf || 0); // 25
            } else if (sizeText === 'ربع') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisQuarter || 0); // 13
            }
        } else if (isNafarItem) {
             // منطق خاص للنفر (5 ريال)
             finalPrice += parseFloat(riceInput.dataset.priceModifierNafal || 0);
        } else if(sizeText === 'نص') { 
            // سعر نص حبة الدجاج (1 ريال)
            finalPrice += parseFloat(riceInput.dataset.priceModifierHalf || 0);
        } else if (sizeText === 'كامل') {
            // سعر كامل حبة الدجاج (4 ريال)
            finalPrice += parseFloat(riceInput.dataset.priceModifierFull || 0);
        }
    }

    // 4. تحديث العرض
    document.getElementById('option-final-price').innerText = finalPrice.toFixed(2);
}

function confirmAddToCart() {
    const name = document.getElementById('base-item-name').value;
    const price = parseFloat(document.getElementById('option-final-price').innerText);
    const size = document.querySelector('input[name="size"]:checked') ? document.querySelector('input[name="size"]:checked').value : 'غير محدد';
    const rice = document.querySelector('input[name="rice"]:checked') ? document.querySelector('input[name="rice"]:checked').value : 'غير محدد';
    
    const optionsText = `${size} / رز ${rice}`;

    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

document.addEventListener('DOMContentLoaded', updateCartDisplay);
