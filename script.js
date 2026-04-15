let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["وجبات رئيسية", "مشروبات", "حلويات", "مقبلات"],
    items: []
};

let cart = [];
let orderType = 'takeaway';
let deliveryFee = 15;
let openCategory = null;

function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

// عرض القائمة مع Accordion ومربعات ملونة
function renderMenu() {
    const container = document.getElementById('menuContainer');
    container.innerHTML = '';

    menu.categories.forEach((cat, index) => {
        const isOpen = openCategory === cat;

        const catBox = document.createElement('div');
        catBox.className = 'category-box';
        catBox.innerHTML = `
            <div class="category-header" onclick="toggleCategory('${cat}')">
                <strong>${cat}</strong>
                <span class="arrow">${isOpen ? '▲' : '▼'}</span>
            </div>
        `;

        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'items-grid';
        itemsContainer.style.display = isOpen ? 'grid' : 'none';

        const catItems = menu.items.filter(i => i.category === cat);
        catItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.style.backgroundColor = getRandomColor(index);
            card.innerHTML = `
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price} ر.س</div>
            `;
            card.onclick = () => addToCart(item);
            itemsContainer.appendChild(card);
        });

        catBox.appendChild(itemsContainer);
        container.appendChild(catBox);
    });
}

function getRandomColor(index) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    return colors[index % colors.length];
}

function toggleCategory(cat) {
    openCategory = (openCategory === cat) ? null : cat;
    renderMenu();
}

// إضافة إلى السلة
function addToCart(item) {
    cart.push({ ...item, qty: 1, note: '' });
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
            <input type="text" placeholder="ملاحظة" value="${item.note || ''}" 
                   onchange="cart[${index}].note = this.value" style="width:100%; margin:8px 0; padding:8px;">
            <button onclick="changeQty(${index},1)">+</button>
            <button onclick="changeQty(${index},-1)">−</button>
            <button onclick="removeItem(${index})" style="background:#e74c3c;color:white;">حذف</button>
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

// طباعة محسنة ومضغوطة جداً (النسخة النهائية)
function printReceipt() {
    let html = `
        <div style="width:80mm; margin:0 auto; padding:2mm 3mm 4mm 3mm; font-family:Arial,sans-serif; font-size:13.8px; line-height:1.4; direction:rtl; text-align:right;">
            
            <!-- رأس الفاتورة -->
            <div style="text-align:center; margin-bottom:6px;">
                <img src="logo.png" style="width:95px; height:auto; margin-bottom:5px;">
                <h2 style="margin:3px 0; font-size:17px;">سحايب ديرتي</h2>
                <div style="border:2px solid #000; padding:5px; margin:6px 0; font-weight:bold; font-size:14.5px;">
                    فاتورة حجز مواقته
                </div>
                <p style="margin:3px 0;"><strong>0112020203</strong></p>
                <p style="margin:2px 0; font-size:12px;">${new Date().toLocaleString('ar-SA')}</p>
            </div>

            <!-- معلومات العميل -->
            <div style="font-size:12.8px; margin-bottom:8px;">
                <strong>العميل:</strong> ${document.getElementById('custName').value || 'عميل'}<br>
                <strong>الجوال:</strong> ${document.getElementById('custPhone').value || '-'}<br>
                <strong>الموعد:</strong> ${document.getElementById('custTime').value ? new Date(document.getElementById('custTime').value).toLocaleString('ar-SA') : 'غير محدد'}<br>
                <strong>الموقع:</strong> ${document.getElementById('custAddress').value || 'غير محدد'}
            </div>
            <hr style="border:1px dashed #000; margin:7px 0;">
    `;

    // الأصناف
    cart.forEach(item => {
        const total = item.price * item.qty;
        html += `
            <div style="margin:5px 0;">
                <strong>${item.name}</strong> × ${item.qty} = ${total} ر.س
                ${item.note ? `<br><small>ملاحظة: ${item.note}</small>` : ''}
            </div>
        `;
    });

    html += `
            <hr style="border:2px solid #000; margin:10px 0 6px 0;">
            <div style="font-size:16px; font-weight:bold; text-align:center;">
                الإجمالي: ${document.getElementById('grandTotal').textContent}
            </div>
            <div style="text-align:center; margin-top:10px; font-size:11px;">
                شكراً لثقتكم 💙
            </div>
        </div>
    `;

    const original = document.body.innerHTML;
    document.body.innerHTML = html;
    window.print();
    document.body.innerHTML = original;
    setTimeout(() => window.location.reload(), 700);
}

// رسالة الواتساب
function sendToWhatsApp() {
    let phone = document.getElementById('custPhone').value.trim().replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '966' + phone.substring(1);
    if (!phone.startsWith('966')) phone = '966' + phone;

    if (phone.length < 12) return alert("❌ أدخل رقم جوال سعودي صحيح");

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

    window.open(`https://wa.me/\( {phone}?text= \){encodeURIComponent(message)}`, '_blank');
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
        div.style.cssText = 'background:#f8f9fa;padding:12px;margin:8px 0;border-radius:8px;';
        div.innerHTML = `
            <strong>${cat}</strong>
            <button onclick="deleteCategory('${cat}')" style="float:left;background:#e74c3c;color:white;padding:5px 10px;border:none;border-radius:5px;margin-left:10px;">حذف القسم</button>
        `;
        container.appendChild(div);

        const catItems = menu.items.filter(i => i.category === cat);
        catItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display:flex;justify-content:space-between;align-items:center;background:white;padding:10px;margin:5px 0;border-radius:6px;border:1px solid #ddd;';
            itemDiv.innerHTML = `
                <span>${item.name} - ${item.price} ر.س</span>
                <div>
                    <button onclick="editItem(${item.id})" style="background:#f39c12;color:white;padding:4px 8px;border:none;border-radius:4px;margin-left:5px;">تعديل</button>
                    <button onclick="deleteItem(${item.id})" style="background:#e74c3c;color:white;padding:4px 8px;border:none;border-radius:4px;">حذف</button>
                </div>
            `;
            container.appendChild(itemDiv);
        });
    });
}

function addCategory() {
    const name = document.getElementById('newCatName').value.trim();
    if (!name) return alert("اكتب اسم القسم");
    if (menu.categories.includes(name)) return alert("القسم موجود");
    menu.categories.push(name);
    saveMenu();
    renderMenu();
    renderAdminCategories();
    renderAdminSelect();
    document.getElementById('newCatName').value = '';
}

function deleteCategory(catName) {
    if (!confirm(`حذف القسم "${catName}"؟`)) return;
    menu.items = menu.items.filter(i => i.category !== catName);
    menu.categories = menu.categories.filter(c => c !== catName);
    saveMenu();
    renderMenu();
    renderAdminCategories();
    renderAdminSelect();
}

function editItem(itemId) {
    const item = menu.items.find(i => i.id === itemId);
    if (!item) return;
    const newName = prompt("الاسم الجديد:", item.name);
    const newPrice = parseFloat(prompt("السعر الجديد:", item.price));
    if (newName && !isNaN(newPrice)) {
        item.name = newName;
        item.price = newPrice;
        saveMenu();
        renderMenu();
        renderAdminCategories();
    }
}

function deleteItem(itemId) {
    if (!confirm("حذف هذا الصنف؟")) return;
    menu.items = menu.items.filter(i => i.id !== itemId);
    saveMenu();
    renderMenu();
    renderAdminCategories();
}

function addItemFromAdmin() {
    const name = document.getElementById('newItemNameAdmin').value.trim();
    const price = parseFloat(document.getElementById('newItemPriceAdmin').value);
    const cat = document.getElementById('adminCatSelect').value;
    if (!name || !price || !cat) return alert("املأ جميع الحقول");
    menu.items.push({ id: Date.now(), name, price, category: cat });
    saveMenu();
    renderMenu();
    renderAdminCategories();
    document.getElementById('newItemNameAdmin').value = '';
    document.getElementById('newItemPriceAdmin').value = '';
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
    setOrderType('takeaway');
});
