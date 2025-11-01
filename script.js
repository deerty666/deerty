// ملف script.js (النسخة النهائية والموثوقة)

const cart = []; 
const DELIVERY_FEE = 5; 
let orderType = 'توصيل'; 
let currentDeliveryFee = DELIVERY_FEE; 
let currentItem = {}; 

// 🛑 دالة الإضافة: تم التحقق من سلامتها 🛑
function addToCart(buttonElement) {
    const menuItemDiv = buttonElement.closest('.menu-item');
    
    // فحص سلامة البيانات الحاسم لمنع التعطل
    if (!menuItemDiv || !menuItemDiv.dataset.name || !menuItemDiv.dataset.price || !menuItemDiv.dataset.category) {
        console.error("Critical Error: Missing .menu-item container or data attributes (name, price, category).");
        return; 
    }

    const name = menuItemDiv.dataset.name;
    let price = parseFloat(menuItemDiv.dataset.price);
    const category = menuItemDiv.dataset.category; 
    
    const isTais = menuItemDiv.dataset.isTais === 'true'; 

    // منطق فتح نافذة الخيارات (الدجاج، اللحم النفر، التيس)
    if (category === 'chicken' || (category === 'meat' && name.includes('نفر لحم')) || isTais) {
        currentItem = { name, price, element: menuItemDiv };
        
        document.getElementById('base-item-price').value = price;
        document.getElementById('base-item-name').value = name;
        document.getElementById('option-item-name').innerText = name;
        
        const sizeGroup = document.querySelector('#item-options-overlay .options-group:nth-child(1)');
        if (isTais || name.includes('نفر لحم') || !name.includes('دجاج')) { 
             sizeGroup.style.display = 'none';
        } else {
             sizeGroup.style.display = 'block';
        }

        const defaultSize = document.querySelector('input[name="size"][value="نص"]');
        if (defaultSize) defaultSize.checked = true;
        
        const defaultRice = document.querySelector('input[name="rice"][value="شعبي"]');
        if (defaultRice) defaultRice.checked = true;

        const descriptionElement = menuItemDiv.querySelector('.description');
        const description = descriptionElement ? descriptionElement.textContent : '';
        document.getElementById('option-item-description').textContent = description;
        
        updateOptionTotal();
        
        openItemOptionsModal();
        return; 
    }
    
    // إضافة صنف عادي (لا يحتاج خيارات)
    const optionsText = 'لا توجد خيارات';
    const existingItem = cart.find(item => item.name === name && item.options === optionsText);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, quantity: 1, options: optionsText }); 
    }
    
    updateCartDisplay();
}

// ------------------- وظائف السلة -------------------

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

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">السلة فارغة حالياً.</p>';
        document.getElementById('whatsapp-checkout-btn').disabled = true;
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            itemDiv.innerHTML = `
                <div class="item-info">
                    <p class="item-name">${item.name}</p>
                    <p class="item-options">${item.options}</p>
                </div>
                <div class="item-quantity-control">
                    <button onclick="changeItemQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeItemQuantity(${index}, 1)">+</button>
                </div>
                <p class="item-price">${itemTotal.toFixed(2)} ر.س</p>
                <button class="remove-item-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
        document.getElementById('whatsapp-checkout-btn').disabled = false;
    }

    const total = subtotal + currentDeliveryFee;
    
    document.getElementById('cart-badge').innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.getElementById('cart-subtotal-price').innerText = `${subtotal.toFixed(2)} ريال`;
    document.getElementById('delivery-fee-display').innerText = currentDeliveryFee > 0 ? `${currentDeliveryFee.toFixed(2)} ريال` : 'مجاني';
    document.getElementById('cart-total-price').innerText = `${total.toFixed(2)} ريال`;
    
    updateWhatsAppLink(subtotal, total);
}

function updateWhatsAppLink(subtotal, total) {
    const phone = '+966112020203'; 
    let message = `*طلب جديد من متجر سحايب ديرتي:*\n\n`;
    message += `*نوع الطلب:* ${orderType}\n\n`;
    message += `*الأصناف:*\n`;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `  ${index + 1}. ${item.name} (${item.options}) - ${item.quantity} x ${item.price.toFixed(2)} = ${itemTotal.toFixed(2)} ر.س\n`;
    });

    message += `\n-----------------------\n`;
    message += `*مجموع الأصناف:* ${subtotal.toFixed(2)} ر.س\n`;
    message += `*رسوم التوصيل:* ${currentDeliveryFee.toFixed(2)} ر.س\n`;
    message += `*المجموع الإجمالي:* ${total.toFixed(2)} ر.س\n\n`;
    message += `*يرجى تأكيد الطلب وتحديد الموقع (إذا كان توصيل).*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    document.getElementById('whatsapp-checkout-btn').onclick = () => window.open(whatsappUrl, '_blank');
}

function selectOrderType(type, buttonElement) {
    document.getElementById('delivery-option').classList.remove('selected');
    document.getElementById('pickup-option').classList.remove('selected');
    buttonElement.classList.add('selected');

    orderType = type;
    currentDeliveryFee = (orderType === 'توصيل') ? DELIVERY_FEE : 0;
    
    updateCartDisplay(); 
}

// ------------------- وظائف النوافذ المنبثقة -------------------

function openCartModal() {
    document.getElementById('cart-overlay').classList.add('show');
    updateCartDisplay(); 
}

function closeCartModal() {
    document.getElementById('cart-overlay').classList.remove('show');
}

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
    
    const isTaisItem = (currentItem.element && currentItem.element.dataset.isTais === 'true');
    const isNafarItem = itemName.includes('نفر لحم');

    let sizeText = sizeInput ? sizeInput.value : 'نص'; 
    
    if (isTaisItem) {
        if (itemName.includes('كامل')) { sizeText = 'كامل'; } 
        else if (itemName.includes('نص')) { sizeText = 'نص'; } 
        else if (itemName.includes('ربع')) { sizeText = 'ربع'; } 
        else { sizeText = 'كامل'; } 
    } else if (isNafarItem) {
        sizeText = 'نفر'; 
    }
    
    if (!isTaisItem && !isNafarItem && sizeInput) {
        finalPrice = basePrice + parseFloat(sizeInput.dataset.priceModifier || 0);
    }
    
    document.querySelectorAll('.rice-beshawer-price, .rice-mandi-price, .rice-mathloutha-price').forEach(el => {
        let priceToDisplay = 0;
        const riceOption = el.classList.contains('rice-beshawer-price') ? 'بشاور' : el.classList.contains('rice-mandi-price') ? 'مندي' : 'مثلوثه';
        const input = document.querySelector(`input[name="rice"][value="${riceOption}"]`);

        if (isTaisItem) {
            if (sizeText === 'كامل') priceToDisplay = parseFloat(input.dataset.priceModifierTaisFull || 0);
            else if (sizeText === 'نص') priceToDisplay = parseFloat(input.dataset.priceModifierTaisHalf || 0);
            else if (sizeText === 'ربع') priceToDisplay = parseFloat(input.dataset.priceModifierTaisQuarter || 0);
        } else if (isNafarItem) {
             priceToDisplay = parseFloat(input.dataset.priceModifierNafal || 0);
        } else {
             priceToDisplay = sizeText === 'نص' 
                 ? parseFloat(input.dataset.priceModifierHalf || 0)
                 : parseFloat(input.dataset.priceModifierFull || 0);
        }
        el.textContent = `إضافة ${priceToDisplay}`;
    });


    if(riceInput && riceInput.value !== 'شعبي') {
        if (isTaisItem) {
            if (sizeText === 'كامل') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisFull || 0); 
            } else if (sizeText === 'نص') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisHalf || 0); 
            } else if (sizeText === 'ربع') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisQuarter || 0); 
            }
        } else if (isNafarItem) {
             finalPrice += parseFloat(riceInput.dataset.priceModifierNafal || 0);
        } else if(sizeText === 'نص') { 
            finalPrice += parseFloat(riceInput.dataset.priceModifierHalf || 0);
        } else if (sizeText === 'كامل') {
            finalPrice += parseFloat(riceInput.dataset.priceModifierFull || 0);
        }
    }

    document.getElementById('option-final-price').innerText = finalPrice.toFixed(2);
}

function confirmAddToCart() {
    const name = document.getElementById('base-item-name').value;
    const price = parseFloat(document.getElementById('option-final-price').innerText);
    
    const rice = document.querySelector('input[name="rice"]:checked') ? document.querySelector('input[name="rice"]:checked').value : 'غير محدد';
    
    const isTaisItem = (currentItem.element && currentItem.element.dataset.isTais === 'true');
    const isNafarItem = name.includes('نفر لحم');
    
    let sizeText = '';

    if (isTaisItem || isNafarItem) {
        if (name.includes('كامل')) sizeText = 'كامل';
        else if (name.includes('نص')) sizeText = 'نص';
        else if (name.includes('ربع')) sizeText = 'ربع';
        else if (name.includes('نفر')) sizeText = 'نفر';
        else sizeText = 'غير محدد'; 
    } else {
        sizeText = document.querySelector('input[name="size"]:checked') ? document.querySelector('input[name="size"]:checked').value : 'غير محدد';
    }

    const optionsText = `${sizeText} / رز ${rice}`;

    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

document.addEventListener('DOMContentLoaded', updateCartDisplay);
