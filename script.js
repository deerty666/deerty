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

// عرض القائمة الرئيسية (في اليمين)
function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    menu.categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.style.cssText = 'background:#3498db;color:white;padding:10px;border-radius:8px;margin:10px 0;font-weight:bold;';
        catDiv.textContent = cat;
        container.appendChild(catDiv);

        const catItems = menu.items.filter(i => i.category === cat);
        catItems.forEach(item => {
            const btn = document.createElement('button');
            btn.style.cssText = 'display:block;width:100%;padding:14px;margin:6px 0;border:none;border-radius:10px;background:#f8f9fa;border:1px solid #3498db;';
            btn.textContent = `${item.name} — ${item.price} ريال`;
            btn.onclick = () => addToCart(item);
            container.appendChild(btn);
        });
    });
}

// إضافة صنف إلى السلة
function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1, note: '' });
    }
    renderCart();
}

// عرض السلة (في اليسار)
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
            <strong>${item.name} × ${item.qty}</strong> = ${itemTotal} ريال<br>
            <input type="text" placeholder="ملاحظة على الصنف" value="${item.note || ''}" 
                   onchange="cart[${index}].note = this.value" style="width:100%; margin:8px 0; padding:8px;">
            <button onclick="changeQty(${index}, 1)">+</button>
            <button onclick="changeQty(${index}, -1)">−</button>
            <button onclick="removeItem(${index})" style="background:#e74c3c; color:white;">حذف</button>
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
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    deliveryFee = (orderType === 'delivery') ? parseFloat(document.getElementById('deliveryFee').value) || 0 : 0;
    document.getElementById('grandTotal').textContent = (subtotal + deliveryFee).toFixed(2) + " ريال";
}

function setOrderType(type) {
    orderType = type;
    document.getElementById('btn-takeaway').classList.toggle('active', type === 'takeaway');
    document.getElementById('btn-delivery').classList.toggle('active', type === 'delivery');
    document.getElementById('delivery-fee-section').style.display = (type === 'delivery') ? 'flex' : 'none';
    updateTotal();
}

function printReceipt() {
    window.print();
}

// دالة إرسال الواتساب (مصححة)
function sendToWhatsApp() {
    let phone = document.getElementById('custPhone').value.trim().replace(/\D/g, '');
    
    if (phone.startsWith('0')) phone = '966' + phone.substring(1);
    if (!phone.startsWith('966')) phone = '966' + phone;

    if (phone.length < 12) {
        return alert("❌ أدخل رقم جوال سعودي صحيح\nمثال: 0501234567");
    }

    const name = document.getElementById('custName').value || 'عميل';
    const address = document.getElementById('custAddress').value || '-';
    const time = document.getElementById('custTime').value || '-';
    const typeText = orderType === 'delivery' ? 'توصيل' : 'استلام';

    let itemsText = cart.map(item => 
        `- ${item.name} × ${item.qty} = ${item.price * item.qty} ريال ${item.note ? '(' + item.note + ')' : ''}`
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

// ====================== نافذة الإدارة ======================
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'flex';
    renderAdminCategories();
    renderAdminSelect();
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function renderAdminSelect() {
    const select = document.getElementById('adminCatSelect');
    select.innerHTML = '';
    menu.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function renderAdminCategories() {
    const container = document.getElementById('adminCategoriesList');
    container.innerHTML = '';

    menu.categories.forEach(cat => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#f8f9fa; padding:10px; margin:6px 0; border-radius:8px;';
        div.innerHTML = `
            <span>${cat}</span>
            <button onclick="deleteCategory('${cat}')" style="background:#e74c3c; color:white; padding:6px 12px; border:none; border-radius:5px;">حذف</button>
        `;
        container.appendChild(div);
    });
}

function addCategory() {
    const name = document.getElementById('newCatName').value.trim();
    if (!name) return alert("اكتب اسم القسم");
    if (menu.categories.includes(name)) return alert("القسم موجود مسبقاً");

    menu.categories.push(name);
    saveMenu();
    renderMenu();
    renderAdminCategories();
    renderAdminSelect();
    document.getElementById('newCatName').value = '';
    alert(`✅ تم إضافة القسم: ${name}`);
}

function deleteCategory(catName) {
    if (!confirm(`هل أنت متأكد من حذف القسم "${catName}" وجميع أصنافه؟`)) return;

    menu.items = menu.items.filter(item => item.category !== catName);
    menu.categories = menu.categories.filter(c => c !== catName);
    saveMenu();
    renderMenu();
    renderAdminCategories();
    renderAdminSelect();
}

function addItemFromAdmin() {
    const name = document.getElementById('newItemNameAdmin').value.trim();
    const price = parseFloat(document.getElementById('newItemPriceAdmin').value);
    const cat = document.getElementById('adminCatSelect').value;

    if (!name || !price || !cat) return alert("يرجى ملء جميع الحقول");

    menu.items.push({ id: Date.now(), name, price, category: cat });
    saveMenu();
    renderMenu();
    document.getElementById('newItemNameAdmin').value = '';
    document.getElementById('newItemPriceAdmin').value = '';
    alert(`✅ تم إضافة الصنف: ${name}`);
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
    setOrderType('takeaway');
});
