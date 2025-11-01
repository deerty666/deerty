// ===============================================
// الثوابت والمتغيرات الأساسية
// ===============================================
const RESTAURANT_NAME = "مطاعم سحايب ديرتي";
const WHATSAPP_NUMBER = "966536803598"; // تم تحديث رقم الواتساب هنا
const DELIVERY_FEE = 5; 

// الحالة الأساسية للسلة ونوع الطلب
let cart = [];
let currentOrderType = 'توصيل'; 

// ... (باقي كود JavaScript كما هو دون تغيير)

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


// ===============================================
// 1. وظائف فتح وإغلاق السلة (Modal)
// ===============================================

/**
 * يفتح نافذة السلة المنبثقة
 */
function openCartModal() {
    cartOverlay.classList.add('show');
    // لضمان أن التحديثات الأخيرة تظهر
    renderCart(); 
    updateTotal();
}

/**
 * يغلق نافذة السلة المنبثقة
 */
function closeCartModal() {
    cartOverlay.classList.remove('show');
}

// ===============================================
// 2. منطق السلة (الإضافة والكمية)
// ===============================================

/**
 * دالة إضافة صنف جديد إلى السلة
 * يتم استدعاؤها عبر زر "+ إضافة" في كل صنف بالقائمة
 */
function addToCart(button) {
    const itemElement = button.closest('.menu-item');
    const name = itemElement.getAttribute('data-name');
    const price = parseFloat(itemElement.getAttribute('data-price'));

    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCartBadge();
    updateTotal(); // لتحديث الإجمالي
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
// 3. وظائف عرض وتحديث واجهة المستخدم
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
    // 1. حساب الإجمالي الفرعي
    let subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalTotal = subTotal;
    let feeDisplay = 'مجاني';

    // 2. تطبيق رسوم التوصيل إذا كان الخيار "توصيل" والسلة ليست فارغة
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

    // تحديث التنسيق لزر التوصيل
    deliveryOptionBtn.classList.remove('selected');
    // تحديث التنسيق لزر الاستلام
    pickupOptionBtn.classList.remove('selected');

    // إضافة التنسيق للعنصر الذي تم النقر عليه
    button.classList.add('selected');

    // إعادة حساب الإجمالي
    updateTotal();
}

// ===============================================
// 4. دالة إرسال الطلب عبر الواتساب
// ===============================================

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
        orderDetails += `🔹 ${item.quantity} x ${item.name} (${item.price} ر.س) = ${itemTotal} ر.س\n`;
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
    
    // إغلاق النافذة عند الضغط خارج محتواها
    cartOverlay.addEventListener('click', (event) => {
        if (event.target === cartOverlay) {
            closeCartModal();
        }
    });
    
    // تهيئة الأزرار عند التحميل
    selectOrderType(currentOrderType, deliveryOptionBtn);
});
