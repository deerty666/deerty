let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["وجبات رئيسية", "مشروبات", "حلويات", "مقبلات"],
    items: []
};

let cart = [];
let orderType = 'takeaway';
let deliveryFee = 15;

function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

// عرض القائمة
function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    menu.categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.className = 'category-title';
        catDiv.textContent = cat;
        container.appendChild(catDiv);

        const catItems = menu.items.filter(i => i.category === cat);
        catItems.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'item-btn';
            btn.textContent = `${item.name} — ${item.price} ريال`;
            btn.onclick = () => addToCart(item);
            container.appendChild(btn);
        });
    });
}

// إضافة إلى السلة
function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1, note: '' });
    }
    renderCart();
}

// عرض السلة
function renderCart() {
    const container = document.getElementById('cart');
    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <strong>${item.name} × ${item.qty}</strong> = ${itemTotal.toFixed(2)} ريال<br>
            <input type="text" placeholder="ملاحظة على الصنف" value="${item.note || ''}" 
                   onchange="cart[${index}].note = this.value" class="input" style="margin-top:8px;">
            <div style="margin-top:10px;">
                <button onclick="changeQty(${index},1)" style="padding:6px 14px;">+</button>
                <button onclick="changeQty(${index},-1)" style="padding:6px 14px;">−</button>
                <button onclick="removeItem(${index})" style="background:#e74c3c;color:white;padding:6px 14px;">حذف</button>
            </div>
        `;
        container.appendChild(div);
    });

    updateTotal();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty < 1) cart.splice(index, 1);
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}

function updateTotal() {
    let subtotal = 0;
    cart.forEach(item => subtotal += item.price * item.qty);

    if (orderType === 'delivery') {
        deliveryFee = parseFloat(document.getElementById('deliveryFee').value) || 0;
    } else {
        deliveryFee = 0;
    }

    const grand = subtotal + deliveryFee;
    document.getElementById('grandTotal').textContent = grand.toFixed(2) + " ريال";
}

function setOrderType(type) {
    orderType = type;
    document.getElementById('btn-takeaway').classList.toggle('active', type === 'takeaway');
    document.getElementById('btn-delivery').classList.toggle('active', type === 'delivery');
    document.getElementById('delivery-fee-section').style.display = (type === 'delivery') ? 'flex' : 'none';
    updateTotal();
}

// طباعة
function printReceipt() {
    window.print();
}

// إرسال واتساب
function sendToWhatsApp() {
    let phone = document.getElementById('custPhone').value.trim().replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '966' + phone.substring(1);
    if (!phone.startsWith('966')) phone = '966' + phone;

    if (phone.length < 12) return alert("أدخل رقم جوال صحيح");

    const name = document.getElementById('custName').value || 'عميل';
    const address = document.getElementById('custAddress').value || '-';
    const time = document.getElementById('custTime').value || '-';
    const typeText = orderType === 'delivery' ? 'توصيل' : 'استلام';

    let itemsText = cart.map(item => 
        `- ${item.name} × ${item.qty} = ${item.price*item.qty} ريال ${item.note ? '('+item.note+')' : ''}`
    ).join('\n');

    const message = `🌟 فاتورة سحايب ديرتي 🌟

فاتورة حجز مواقته

نوع الطلب: ${typeText}
العميل: ${name}
الجوال: ${phone}
العنوان: ${address}
الموعد: ${time}

الطلبات:
${itemsText}

رسوم التوصيل: ${deliveryFee} ريال
الإجمالي: ${document.getElementById('grandTotal').textContent}

شكراً لثقتكم 💙
رقم المطعم: 0112020203`;

    const url = `https://api.whatsapp.com/send?phone=\( {phone}&text= \){encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function clearCart() {
    if (confirm("مسح الفاتورة الحالية؟")) {
        cart = [];
        renderCart();
    }
}

// ==================== دوال نافذة الإدارة ====================
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'flex';
    renderAdminCategories();
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function renderAdminCategories() {
    // يمكن توسيعها لاحقاً
    const container = document.getElementById('adminCategories');
    container.innerHTML = '<p>سيتم إضافة خيارات التعديل والحذف قريباً</p>';
}

function addCategory() {
    const name = document.getElementById('newCatName').value.trim();
    if (!name) return alert("اكتب اسم القسم");
    if (menu.categories.includes(name)) return alert("القسم موجود");

    menu.categories.push(name);
    saveMenu();
    renderMenu();
    document.getElementById('newCatName').value = '';
    alert(`تم إضافة القسم: ${name}`);
}

function addItemFromAdmin() {
    const name = document.getElementById('newItemNameAdmin').value.trim();
    const price = parseFloat(document.getElementById('newItemPriceAdmin').value);
    const category = document.getElementById('adminCatSelect').value;

    if (!name || !price || !category) return alert("املأ جميع الحقول");

    menu.items.push({ id: Date.now(), name, price, category });
    saveMenu();
    renderMenu();
    document.getElementById('newItemNameAdmin').value = '';
    document.getElementById('newItemPriceAdmin').value = '';
    alert(`تم إضافة الصنف: ${name}`);
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
    setOrderType('takeaway'); // البداية بـ استلام
});
