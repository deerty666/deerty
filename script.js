// ملف script.js

const cart = []; 
const DELIVERY_FEE = 5; 
let orderType = 'توصيل'; 
let currentDeliveryFee = DELIVERY_FEE; 
let currentItem = {}; 


// --- وظائف نافذة السلة (لم تتغير) ---

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
    
    if (orderType === 'توصيل') {
        currentDeliveryFee = DELIVERY_FEE;
    } else { 
        currentDeliveryFee = 0;
    }
    
    updateCartDisplay(); 
}

// --- وظائف إضافة وحذف الأصناف (لم تتغير) ---

function addToCart(buttonElement) {
    const menuItemDiv = buttonElement.closest('.menu-item');
    const name = menuItemDiv.dataset.name;
    let price = parseFloat(menuItemDiv.dataset.price);
    const category = menuItemDiv.dataset.category; 

    // منطق الفتح لخيارات الدجاج ونفر اللحم
    if (category === 'chicken' || (category === 'meat' && name === 'نفر لحم مندي')) {
        currentItem = { name, price, element: menuItemDiv };
        document.getElementById('base-item-price').value = price;
        document.getElementById('base-item-name').value = name;
        document.getElementById('option-item-name').innerText = name;
        document.getElementById('option-final-price').innerText = price.toFixed(2);
        document.getElementById('confirm-add-to-cart-btn').disabled = false;
        
        const descriptionElement = menuItemDiv.querySelector('.description');
        const description = descriptionElement ? descriptionElement.textContent : '';
        document.getElementById('option-item-description').textContent = description;
        
        document.querySelector('input[name="size"][value="نص"]').checked = true;
        document.querySelector('input[name="rice"][value="شعبي"]').checked = true;

        openItemOptionsModal();
        return; 
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

// --- وظائف نافذة الخيارات (تم التعديل الأخير) ---

function openItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.add('show');
    updateOptionTotal(); 
}

function closeItemOptionsModal() {
    document.getElementById('item-options-overlay').classList.remove('show');
}

function updateOptionTotal() {
    const basePrice = parseFloat(document.getElementById('base-item-price').value);
    const sizeInput = document.querySelector('input[name="size"]:checked');
    const riceInput = document.querySelector('input[name="rice"]:checked');
    
    // NEW: قراءة اسم الصنف للتمييز بين الدجاج واللحم
    const itemName = document.getElementById('base-item-name').value; 
    
    let finalPrice = basePrice;
    let sizeText = '';
    
    // 1. تحديد الحجم وتعديل السعر الأساسي (للدجاج)
    if(sizeInput) {
        sizeText = sizeInput.value;
        finalPrice = basePrice + parseFloat(sizeInput.dataset.priceModifier || 0);
        
        // تحديث نص العرض في خيارات الأرز بناءً على الصنف (دجاج أو نفر لحم)
        document.querySelectorAll('.rice-beshawer-price, .rice-mandi-price, .rice-mathloutha-price').forEach(el => {
            if (itemName === 'نفر لحم مندي') {
                 el.textContent = 'إضافة 5'; // ثابت للنفر
            } else {
                 el.textContent = sizeText === 'نص' ? 'إضافة 1' : 'إضافة 4'; // للدجاج
            }
        });
    }

    // 2. تحديد نوع الرز وإضافة سعر التعديل (المنطق النهائي)
    if(riceInput) {
        if (itemName === 'نفر لحم مندي') {
             // منطق خاص لنفر اللحم (5 ريال)
             finalPrice += parseFloat(riceInput.dataset.priceModifierNafal || 0);
        } else if(sizeText === 'نص') { 
            // منطق نص حبة دجاج (1 ريال)
            finalPrice += parseFloat(riceInput.dataset.priceModifierHalf || 0);
        } else if (sizeText === 'كامل') {
            // منطق كامل حبة دجاج (4 ريال)
            finalPrice += parseFloat(riceInput.dataset.priceModifierFull || 0);
        }
    }

    // 3. تحديث العرض
    document.getElementById('option-final-price').innerText = finalPrice.toFixed(2);
}

function confirmAddToCart() {
    const name = document.getElementById('base-item-name').value;
    const price = parseFloat(document.getElementById('option-final-price').innerText);
    const size = document.querySelector('input[name="size"]:checked') ? document.querySelector('input[name="size"]:checked').value : 'غير محدد';
    const rice = document.querySelector('input[name="rice"]:checked') ? document.querySelector('input[name="rice"]:checked').value : 'غير محدد';
    
    // إذا كان الصنف "نفر لحم"، لا نذكر الحجم (نص/كامل)
    const optionsText = name === 'نفر لحم مندي' ? `رز ${rice}` : `${size} / رز ${rice}`;

    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

document.addEventListener('DOMContentLoaded', updateCartDisplay);
