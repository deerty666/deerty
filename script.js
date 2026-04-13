let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["وجبات رئيسية", "مشروبات", "حلويات", "مقبلات"],
    items: []
};

let cart = [];

function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

function renderMenu() {
    const container = document.getElementById('menuDisplay');
    container.innerHTML = '<h3>القائمة:</h3>';

    menu.categories.forEach(cat => {
        const div = document.createElement('div');
        div.style.margin = '12px 0 6px';
        div.innerHTML = `<strong>${cat}</strong>`;
        container.appendChild(div);

        const catItems = menu.items.filter(i => i.category === cat);
        catItems.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = `${item.name} - ${item.price} ريال`;
            btn.style.cssText = 'display:block; width:100%; margin:4px 0; padding:10px; background:#f0f0f0;';
            btn.onclick = () => addToCart(item);
            container.appendChild(btn);
        });
    });

    // تحديث القائمة المنسدلة
    const select = document.getElementById('catSelect');
    select.innerHTML = '';
    menu.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function addCategory() {
    const name = document.getElementById('newCat').value.trim();
    if (!name) return alert("اكتب اسم القسم");
    if (menu.categories.includes(name)) return alert("القسم موجود مسبقاً");

    menu.categories.push(name);
    saveMenu();
    renderMenu();
    document.getElementById('newCat').value = '';
    alert(`✅ تم إضافة القسم: ${name}`);
}

function addMenuItem() {
    const name = document.getElementById('newItemName').value.trim();
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const category = document.getElementById('catSelect').value;

    if (!name || !price || !category) return alert("املأ جميع الحقول");

    menu.items.push({ id: Date.now(), name, price, category });
    saveMenu();
    renderMenu();
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemPrice').value = '';
    alert(`✅ تم إضافة الصنف: ${name}`);
}

function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1, note: '' });
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <strong>${item.name} × ${item.qty}</strong> = ${itemTotal} ريال<br>
            <input type="text" placeholder="ملاحظة على الصنف" value="${item.note}" 
                   onchange="cart[${index}].note = this.value" style="width:100%; margin:6px 0; padding:6px;">
            <button onclick="changeQty(${index}, 1)">+</button>
            <button onclick="changeQty(${index}, -1)">−</button>
            <button onclick="removeItem(${index})" style="background:#dc3545; color:white; margin-right:5px;">حذف</button>
        `;
        container.appendChild(div);
    });

    document.getElementById('grandTotal').textContent = total.toFixed(2);
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

function printReceipt() {
    window.print();
}

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

    let itemsText = cart.map(item => 
        `- ${item.name} × ${item.qty} = ${item.price * item.qty} ريال ${item.note ? '('+item.note+')' : ''}`
    ).join('\n');

    const message = `🌟 فاتورة سحايب ديرتي 🌟

فاتورة حجز مواقته

العميل: ${name}
الجوال: ${phone}
العنوان: ${address}
الموعد: ${time}

الطلبات:
${itemsText}

الإجمالي: ${document.getElementById('grandTotal').textContent} ريال

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

// تشغيل البرنامج
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
});
