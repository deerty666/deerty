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

// عرض القائمة في اليمين - تصميم مربعات ملونة
function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    menu.categories.forEach((cat, catIndex) => {
        // عنوان القسم
        const catDiv = document.createElement('div');
        catDiv.className = 'category-box';
        catDiv.innerHTML = `<strong>${cat}</strong>`;
        container.appendChild(catDiv);

        // حاوية الأصناف (مربعات)
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'items-grid';

        const catItems = menu.items.filter(i => i.category === cat);
        
        catItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.style.backgroundColor = getRandomColor(catIndex);
            card.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price} ر.س</div>
            `;
            card.onclick = () => addToCart(item);
            itemsContainer.appendChild(card);
        });

        container.appendChild(itemsContainer);
    });
}

// ألوان مختلفة لكل قسم
function getRandomColor(index) {
    const colors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
        '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd',
        '#00d2d3', '#ff9f43'
    ];
    return colors[index % colors.length];
}

// إضافة صنف إلى السلة (كل مرة سطر جديد)
function addToCart(item) {
    cart.push({ 
        ...item, 
        qty: 1, 
        note: '' 
    });
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
            <strong>${item.name} × ${item.qty}</strong> = ${itemTotal} ر.س<br>
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
    document.getElementById('grandTotal').textContent = (subtotal + deliveryFee).toFixed(2) + " ر.س";
}

function setOrderType(type) {
    orderType = type;
    document.getElementById('btn-takeaway').classList.toggle('active', type === 'takeaway');
    document.getElementById('btn-delivery').classList.toggle('active', type === 'delivery');
    document.getElementById('delivery-fee-section').style.display = (type === 'delivery') ? 'flex' : 'none';
    updateTotal();
}

// طباعة فقط الفاتورة
function printReceipt() {
    const printContent = document.getElementById('printArea').innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
        <div style="width:80mm; margin:0 auto; padding:10px; font-family:Arial; direction:rtl; text-align:right;">
            ${printContent}
        </div>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
}

// رسالة الواتساب بالشكل المطلوب
function sendToWhatsApp() {
    let phone = document.getElementById('custPhone').value.trim().replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '966' + phone.substring(1);
    if (!phone.startsWith('966')) phone = '966' + phone;

    if (phone.length < 12) {
        return alert("❌ أدخل رقم جوال سعودي صحيح\nمثال: 0501234567");
    }

    const customerName = document.getElementById('custName').value || 'عميل';
    const address = document.getElementById('custAddress').value || 'غير محدد';
    const time = document.getElementById('custTime').value 
        ? new Date(document.getElementById('custTime').value).toLocaleString('ar-SA') 
        : 'غير محدد';
    const typeText = orderType === 'delivery' ? 'توصيل' : 'استلام';

    let itemsText = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        itemsText += `• \( {item.name} (x \){item.qty}) = ${itemTotal} ر.س\n`;
        if (item.note) itemsText += `  ملاحظة: ${item.note}\n`;
    });

    const message = `*حجز مؤقت - سحايب ديرتي*

${itemsText}
*اسم العميل:* ${customerName}
*رقم الجوال:* ${phone}
*نوع الطلب:* ${typeText}
*الموعد:* ${time}
*الموقع:* ${address}

*الإجمالي:* ${document.getElementById('grandTotal').textContent}

ندعوك لتثبيت تطبيقنا لطلب أسهل وأسرع:
https://deerty666.github.io/deerty/`;

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
        div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:#f8f9fa;padding:10px;margin:6px 0;border-radius:8px;';
        div.innerHTML = `
            <span>${cat}</span>
            <button onclick="deleteCategory('${cat}')" style="background:#e74c3c;color:white;padding:6px 12px;border:none;border-radius:5px;">حذف</button>
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
    if (!confirm(`حذف القسم "${catName}" وكل أصنافه؟`)) return;
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

    if (!name || !price || !cat) return alert("املأ جميع الحقول");

    menu.items.push({ id: Date.now(), name, price, category: cat });
    saveMenu();
    renderMenu();
    document.getElementById('newItemNameAdmin').value = '';
    document.getElementById('newItemPriceAdmin').value = '';
    alert(`✅ تم إضافة الصنف: ${name}`);
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
    setOrderType('takeaway');
});
