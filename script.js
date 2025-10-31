const cart = []; // المصفوفة التي تخزن جميع أصناف الطلب

function addToCart(buttonElement) {
    // 1. قراءة البيانات من عنصر القائمة الأب
    const menuItemDiv = buttonElement.parentElement;
    const name = menuItemDiv.dataset.name;
    const price = parseFloat(menuItemDiv.dataset.price);

    // 2. التحقق من وجود الصنف مسبقاً في السلة
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        // إذا كان موجوداً، نزيد الكمية فقط
        existingItem.quantity += 1;
    } else {
        // إذا لم يكن موجوداً، نضيفه كعنصر جديد
        const newItem = {
            name: name,
            price: price,
            quantity: 1
        };
        cart.push(newItem);
    }

    // 3. تحديث واجهة السلة في HTML ورابط الواتساب
    updateCartDisplay();
}

// دالة لتحديث عرض السلة في الشريط الجانبي (HTML)
function updateCartDisplay() {
    const cartList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    let total = 0;
    
    // مسح المحتوى القديم بالكامل قبل التحديث
    cartList.innerHTML = ''; 

    if (cart.length === 0) {
        // عرض رسالة "السلة فارغة" وتعطيل زر الواتساب
        cartList.innerHTML = '<p class="empty-cart-message">السلة فارغة حالياً. ابدأ بإضافة أصناف!</p>';
        cartTotalElement.textContent = '0.00';
        document.getElementById('checkout-whatsapp-btn').setAttribute('disabled', 'disabled');
        document.getElementById('checkout-whatsapp-btn').removeAttribute('href');
    } else {
        // تفعيل زر الواتساب
        document.getElementById('checkout-whatsapp-btn').removeAttribute('disabled');

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal; // إضافة إلى المجموع الكلي

            // إنشاء عنصر (Div) لكل صنف في السلة
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item-entry');
            itemDiv.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty"> (x${item.quantity})</span>
                    <span class="item-subtotal">${itemTotal.toFixed(2)} ر.س</span>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${index})">حذف</button>
            `;
            cartList.appendChild(itemDiv);
        });

        // تحديث عرض المجموع الكلي
        cartTotalElement.textContent = total.toFixed(2);
        
        // تحديث رابط الواتساب برسالة الطلب الجديدة
        updateWhatsAppLink();
    }
}

// دالة لحذف صنف من السلة (يتم استدعاؤها من زر "حذف")
function removeFromCart(index) {
    // .splice(index, 1) يحذف عنصراً واحداً بدءاً من الموقع المحدد
    cart.splice(index, 1);
    updateCartDisplay();
}

// دالة لإنشاء رسالة ورابط الواتساب
function updateWhatsAppLink() {
    const whatsappBtn = document.getElementById('checkout-whatsapp-btn');
    let message = "أهلاً، أود طلب الأصناف التالية من مطاعم سحايب ديرتي:\n\n";
    let total = 0;

    // بناء نص الرسالة بناءً على محتوى السلة
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `* ${item.name} (الكمية: ${item.quantity}) - السعر: ${itemTotal.toFixed(2)} ر.س\n`;
    });
    
    message += `\n*الإجمالي الكلي للطلب: ${total.toFixed(2)} ر.س*`;

    // ترميز الرسالة للغة URL (مهم جداً لتظهر الرسالة بشكل صحيح في واتساب)
    const encodedMessage = encodeURIComponent(message);
    
    // رقم التواصل المذكور في قائمتك (920010988) مع رمز الدولة (966)
    const phoneNumber = '966920010988'; 
    
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // وضع الرابط الجديد في زر الإرسال
    whatsappBtn.setAttribute('href', whatsappLink);
}

// عند تحميل الصفحة لأول مرة، نتأكد من عرض السلة فارغة
document.addEventListener('DOMContentLoaded', updateCartDisplay);
