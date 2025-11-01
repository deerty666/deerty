// ملف script.js (محدث ليتعامل مع تسعير التيس حسب اسم الصنف)

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
    
    currentDeliveryFee = (orderType === 'توصيل') ? DELIVERY_FEE : 0;
    
    updateCartDisplay(); 
}

// --- وظائف إضافة وحذف الأصناف (لم تتغير) ---

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

// ... (باقي دوال updateCartDisplay و updateWhatsAppLink لم تتغير) ...

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
        if (itemName.includes('نص')) {
            sizeText = 'نص';
        } else if (itemName.includes('ربع')) {
            sizeText = 'ربع';
        } else {
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
             el.textContent = 'إضافة مخصص'; // يترك كلمة مخصص حتى يتم احتسابه في الخطوة التالية
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
        sizeText = name.substring(name.lastIndexOf(' ') + 1); // يستخرج الحجم من اسم الصنف
        if (sizeText.includes('نفر')) sizeText = 'نفر';
        else if (sizeText.includes('كامل')) sizeText = 'كامل';
        else if (sizeText.includes('نص')) sizeText = 'نص';
        else if (sizeText.includes('ربع')) sizeText = 'ربع';
    } else {
        sizeText = document.querySelector('input[name="size"]:checked') ? document.querySelector('input[name="size"]:checked').value : 'غير محدد';
    }

    const optionsText = `${sizeText} / رز ${rice}`;

    cart.push({ name: name, price: price, quantity: 1, options: optionsText });
    
    updateCartDisplay();
    closeItemOptionsModal();
}

document.addEventListener('DOMContentLoaded', updateCartDisplay);
