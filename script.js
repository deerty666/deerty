// ملف script.js (النسخة المصححة والمحدثة)

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
    
    currentDeliveryFee = (orderType === 'توصيل') ? DELIVERY_FEE : 0;
    
    updateCartDisplay(); 
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
    
    // تحديث رابط الواتساب عند تحديث السلة
    updateWhatsAppLink(subtotal, total);
}

function updateWhatsAppLink(subtotal, total) {
    const phone = '+966112020203'; // رقم المطعم
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


// --- وظائف إضافة وحذف الأصناف ---

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

    // منطق فتح نافذة الخيارات (للدجاج، النفر، واللحوم الكبيرة)
    if (category === 'chicken' || (category === 'meat' && name.includes('نفر لحم')) || isTais) {
        currentItem = { name, price, element: menuItemDiv };
        
        // تمرير البيانات إلى النافذة المنبثقة
        document.getElementById('base-item-price').value = price;
        document.getElementById('base-item-name').value = name;
        document.getElementById('option-item-name').innerText = name;
        
        // إظهار أو إخفاء خيارات الحجم: نخفيها للتيس والنفر لأن حجمه ثابت
        const sizeGroup = document.querySelector('#item-options-overlay .options-group:nth-child(1)');
        if (isTais || name.includes('نفر لحم')) {
             sizeGroup.style.display = 'none';
        } else {
             sizeGroup.style.display = 'block';
        }

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

// --- وظائف نافذة الخيارات (منطق التسعير المعقد والمحدث) ---

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
    
    // تحديد حالة الصنف (نستخدم currentItem.element للوصول لـ data-attributes)
    const isTaisItem = (currentItem.element && currentItem.element.dataset.isTais === 'true');
    const isNafarItem = itemName.includes('نفر لحم');

    // ⭐️ 1. تحديد حجم الصنف (المصدر الرئيسي)
    let sizeText = sizeInput ? sizeInput.value : 'نص'; 
    
    // ⭐️ منطق التيس/النفر: تجاوز اختيار الحجم بالقوة لأن الصنف حجمه ثابت
    if (isTaisItem) {
        if (itemName.includes('كامل')) {
            sizeText = 'كامل';
        } else if (itemName.includes('نص')) {
            sizeText = 'نص';
        } else if (itemName.includes('ربع')) {
            sizeText = 'ربع';
        } else {
             // افتراض أن التيس كامل إذا لم يحدد الحجم في الاسم
             sizeText = 'كامل'; 
        }
    } else if (isNafarItem) {
        sizeText = 'نفر'; // حجم مخصص للنفر
    }
    
    // 2. تطبيق تعديل الحجم للدجاج فقط
    if (!isTaisItem && !isNafarItem && sizeInput) {
        finalPrice = basePrice + parseFloat(sizeInput.dataset.priceModifier || 0);
    }
    
    // 3. تحديث مؤشرات أسعار الأرز في الواجهة
    document.querySelectorAll('.rice-beshawer-price, .rice-mandi-price, .rice-mathloutha-price').forEach(el => {
        let priceToDisplay = 0;
        
        if (isTaisItem) {
            if (sizeText === 'كامل') priceToDisplay = parseFloat(document.querySelector('input[name="rice"][value="بشاور"]').dataset.priceModifierTaisFull || 0);
            else if (sizeText === 'نص') priceToDisplay = parseFloat(document.querySelector('input[name="rice"][value="بشاور"]').dataset.priceModifierTaisHalf || 0);
            else if (sizeText === 'ربع') priceToDisplay = parseFloat(document.querySelector('input[name="rice"][value="بشاور"]').dataset.priceModifierTaisQuarter || 0);
            
            el.textContent = `إضافة ${priceToDisplay}`;
        } else if (isNafarItem) {
             priceToDisplay = parseFloat(document.querySelector('input[name="rice"][value="بشاور"]').dataset.priceModifierNafal || 0);
             el.textContent = `إضافة ${priceToDisplay}`; 
        } else {
             // الدجاج
             priceToDisplay = sizeText === 'نص' 
                 ? parseFloat(document.querySelector('input[name="rice"][value="بشاور"]').dataset.priceModifierHalf || 0)
                 : parseFloat(document.querySelector('input[name="rice"][value="بشاور"]').dataset.priceModifierFull || 0);
             el.textContent = `إضافة ${priceToDisplay}`; 
        }
    });


    // 4. تحديد نوع الرز وإضافة سعر التعديل (المنطق النهائي)
    if(riceInput && riceInput.value !== 'شعبي') {
        if (isTaisItem) {
            // ⭐️ المنطق الخاص بالتيس (50/25/13 ريال)
            if (sizeText === 'كامل') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisFull || 0); 
            } else if (sizeText === 'نص') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisHalf || 0); 
            } else if (sizeText === 'ربع') {
                 finalPrice += parseFloat(riceInput.dataset.priceModifierTaisQuarter || 0); 
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

    // 5. تحديث العرض
    document.getElementById('option-final-price').innerText = finalPrice.toFixed(2);
}

function confirmAddToCart() {
    const name = document.getElementById('base-item-name').value;
    const price = parseFloat(document.getElementById('option-final-price').innerText);
    
    // استخلاص خيار الرز
    const rice = document.querySelector('input[name="rice"]:checked') ? document.querySelector('input[name="rice"]:checked').value : 'غير محدد';
    
    // تحديد الحجم بشكل صحيح للعرض
    const isTaisItem = (currentItem.element && currentItem.element.dataset.isTais === 'true');
    const isNafarItem = name.includes('نفر لحم');
    
    let sizeText = '';

    if (isTaisItem || isNafarItem) {
        // نأخذ الحجم من اسم الصنف نفسه
        if (name.includes('كامل')) sizeText = 'كامل';
        else if (name.includes('نص')) sizeText = 'نص';
        else if (name.includes('ربع')) sizeText = 'ربع';
        else if (name.includes('نفر')) sizeText = 'نفر';
        else sizeText = 'غير محدد'; 
    } else {
        // الدجاج (نص/كامل)
        sizeText = document.querySelector('input[name="size"]:checked') ? document.querySelector('input[name="size"]:checked').value : 'غير محدد';
    }

    const optionsText = `${sizeText} / رز ${rice}`;

    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

document.addEventListener('DOMContentLoaded', updateCartDisplay);
