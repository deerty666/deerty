// اسم المطعم ورقم الواتساب
const RESTAURANT_NAME = "مطاعم سحايب ديرتي";
const WHATSAPP_NUMBER = "966536803598"; 

// رسوم التوصيل الثابتة (التعديل الأول: تعريف الرسوم)
const DELIVERY_FEE = 5; 

// السلة: سيتم تخزين الأصناف المضافة هنا
let cart = [];

// العناصر الرئيسية في الصفحة
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const checkoutButton = document.getElementById('checkout-btn');


/**
 * دالة إضافة صنف جديد إلى السلة
 * @param {HTMLElement} button - زر "إضافة" الذي تم الضغط عليه
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

    renderCart();
    updateTotal();
}

/**
 * دالة لتحديث كمية صنف معين في السلة
 * @param {string} name - اسم الصنف
 * @param {number} change - مقدار التغيير (+1 للزيادة، -1 للنقصان)
 */
function updateQuantity(name, change) {
    const itemIndex = cart.findIndex(item => item.name === name);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;

        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }

    renderCart();
    updateTotal();
}


/**
 * دالة عرض محتوى السلة في واجهة المستخدم
 */
function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً.</p>';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        
        cartItemDiv.innerHTML = `
            <span>${item.name}</span>
            <div class="item-quantity">
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
            </div>
            <span>${itemTotal} ريال</span>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });
}

/**
 * دالة حساب وتحديث الإجمالي (التعديل الثاني)
 */
function updateTotal() {
    // الإجمالي الفرعي (بدون رسوم التوصيل)
    let subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalTotal = subTotal;
    
    // تحديد نوع الطلب من أزرار الراديو
    const orderType = document.querySelector('input[name="order-type"]:checked').value;

    // إضافة رسوم التوصيل إذا كان الخيار "توصيل"
    if (orderType === 'توصيل' && subTotal > 0) {
        finalTotal += DELIVERY_FEE;
    }
    
    // تحديث قيمة الإجمالي المعروضة
    cartTotalPriceElement.textContent = `${finalTotal} ريال`;
    
    // تفعيل/تعطيل زر "إرسال الطلب" بناءً على حالة السلة
    checkoutButton.disabled = subTotal === 0;
}

/**
 * دالة توليد رسالة واتساب وفتح رابط الإرسال (التعديل الثالث)
 */
function sendWhatsAppOrder() {
    if (cart.length === 0) return;

    const orderType = document.querySelector('input[name="order-type"]:checked').value;
    let orderDetails = `*طلب جديد من ${RESTAURANT_NAME}* 🧑‍🍳\n\n`;
    orderDetails += `*نوع الطلب:* ${orderType}\n\n`;
    orderDetails += `*تفاصيل الطلبات:*\n`;
    
    let subTotal = 0;
    
    // بناء قائمة الأصناف وحساب الإجمالي الفرعي
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        orderDetails += `🔹 ${item.quantity} x ${item.name} (${item.price} ر.س) = ${itemTotal} ر.س\n`;
        subTotal += itemTotal;
    });

    let finalTotal = subTotal;
    
    // تضمين تفاصيل رسوم التوصيل في الرسالة إذا كانت توصيل
    if (orderType === 'توصيل') {
        finalTotal += DELIVERY_FEE;
        orderDetails += `\n*الإجمالي الفرعي (الطلبات):* ${subTotal} ريال\n`;
        orderDetails += `*رسوم التوصيل:* ${DELIVERY_FEE} ريال\n`;
    }
    
    orderDetails += `\n*الإجمالي المطلوب:* ${finalTotal} ريال\n\n`;
    orderDetails += `يرجى تأكيد الطلب. شكراً لكم.`;

    // تحويل الرسالة إلى صيغة URL آمنة للواتساب
    const encodedMessage = encodeURIComponent(orderDetails);
    
    // بناء رابط الواتساب (لفتح المحادثة)
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // فتح الرابط في نافذة جديدة
    window.open(whatsappUrl, '_blank');
}

// تهيئة: عند تحميل الصفحة، تأكد من عرض السلة وإجماليها
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateTotal();
    
    // (التعديل الرابع: إضافة مستمع لتحديث الإجمالي عند تغيير خيار التوصيل/الاستلام)
    const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateTotal);
    });
});
