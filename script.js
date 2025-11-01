const cart = []; // المصفوفة التي تخزن جميع أصناف الطلب

// --- وظائف خاصة بنافذة السلة المنبثقة ---

function showCartOverlay(event) {
    // نوقف الانتقال التلقائي للرابط (#)
    if (event) {
        event.preventDefault(); 
    }
    document.getElementById('cart-overlay').classList.add('show');
}

function hideCartOverlay() {
    document.getElementById('cart-overlay').classList.remove('show');
}

// ------------------------------------

function addToCart(buttonElement) {
    // 1. قراءة البيانات من عنصر القائمة الأب
    const menuItemDiv = buttonElement.closest('.menu-item');
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

    // 3. تحديث واجهة السلة (النافذة المنبثقة والشارة السفلية)
    updateCartDisplay();
}

// دالة لتحديث عرض السلة في النافذة المنبثقة
function updateCartDisplay() {
    const cartList = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total');
    const mobileBadge = document.getElementById('mobile-cart-badge'); // شارة السلة السفلية
    const whatsappBtn = document.getElementById('checkout-whatsapp-btn');
    
    let total = 0;
    let itemCount = 0; 
    
    // مسح المحتوى القديم بالكامل قبل التحديث
    cartList.innerHTML = ''; 

    if (cart.length === 0) {
        // عرض رسالة "السلة فارغة" وتعطيل زر الواتساب
        cartList.innerHTML = '<p class="empty-cart-message">السلة فارغة حالياً. ابدأ بإضافة أصناف!</p>';
        cartTotalElement.textContent = '0.00';
        whatsappBtn.setAttribute('disabled', 'disabled');
        whatsappBtn.removeAttribute('href');
        mobileBadge.textContent = '0';
    } else {
        // تفعيل زر الواتساب
        whatsappBtn.removeAttribute('disabled');

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal; // إضافة إلى المجموع الكلي
            itemCount += item.quantity; // تجميع العدد الكلي للأصناف

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

        // تحديث عرض المجموع الكلي والشارة السفلية
        cartTotalElement.textContent = total.toFixed(2);
        mobileBadge.textContent = itemCount; 
        
        // تحديث رابط الواتساب برسالة الطلب الجديدة
        updateWhatsAppLink();
    }
}

// دالة لحذف صنف من السلة
function removeFromCart(index) {
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

// دالة التمرير التلقائي للأقسام عند الضغط على الزر العلوي
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // نستخدم سلوك "smooth" للانتقال السلس
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// عند تحميل الصفحة لأول مرة، نتأكد من عرض السلة فارغة
document.addEventListener('DOMContentLoaded', updateCartDisplay);
