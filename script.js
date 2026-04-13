let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["وجبات رئيسية", "مشروبات", "حلويات", "مقبلات"],
    items: [
        {id:1, name:"كبسة دجاج", price:45, category:"وجبات رئيسية"},
        {id:2, name:"عصير برتقال طازج", price:15, category:"مشروبات"},
        {id:3, name:"كنافة نابلسية", price:28, category:"حلويات"}
    ]
};

let cart = [];

function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

function renderMenu() {
    const container = document.getElementById('menuList');
    container.innerHTML = '<strong>الأقسام:</strong><br>';
    
    menu.categories.forEach(cat => {
        const div = document.createElement('div');
        div.style.margin = '8px 0';
        div.innerHTML = `<strong>${cat}</strong>`;
        container.appendChild(div);

        const catItems = menu.items.filter(item => item.category === cat);
        catItems.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = `${item.name} - ${item.price} ريال`;
            btn.style.display = 'block';
            btn.style.width = '100%';
            btn.style.margin = '4px 0';
            btn.style.padding = '8px';
            btn.onclick = () => addToCart(item);
            container.appendChild(btn);
        });
    });

    // تحديث قائمة الـ select لإضافة الأصناف
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
    if (!name) {
        alert('اكتب اسم القسم');
        return;
    }
    if (menu.categories.includes(name)) {
        alert('القسم موجود مسبقاً');
        return;
    }
    menu.categories.push(name);
    saveMenu();
    renderMenu();
    document.getElementById('newCat').value = '';
    alert(`تم إضافة القسم: ${name}`);
}

function addMenuItem() {
    const name = document.getElementById('newItemName').value.trim();
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const category = document.getElementById('catSelect').value;

    if (!name || !price || !category) {
        alert('املأ جميع الحقول');
        return;
    }

    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        category: category
    };

    menu.items.push(newItem);
    saveMenu();
    renderMenu();
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemPrice').value = '';
    alert(`تم إضافة الصنف: ${name}`);
}

function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
    } else {
        cart.push({...item, qty: 1, note: ''});
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
            <div><strong>${item.name}</strong> × ${item.qty}</div>
            <div>${itemTotal.toFixed(2)} ريال</div>
            <input type="text" placeholder="ملاحظة على الصنف" value="${item.note || ''}" 
                   onchange="updateNote(${index}, this.value)" style="width:100%; margin:5px 0;">
            <button onclick="changeQty(${index}, 1)">+</button>
            <button onclick="changeQty(${index}, -1)">−</button>
            <button onclick="removeFromCart(${index})" style="background:#dc3545; color:white;">حذف</button>
        `;
        container.appendChild(div);
    });

    document.getElementById('grandTotal').textContent = total.toFixed(2) + ' ريال';
}

function updateNote(index, note) {
    cart[index].note = note;
}

function changeQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty < 1) cart.splice(index, 1);
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function printReceipt() {
    window.print();
}

function sendToWhatsApp() {
    const name = document.getElementById('custName').value || 'عميل';
    const phone = document.getElementById('custPhone').value.replace(/\D/g,'');
    const address = document.getElementById('custAddress').value || '-';
    const time = document.getElementById('custTime').value || '-';

    let itemsText = cart.map(item => 
        `- ${item.name} × ${item.qty} = ${item.price * item.qty} ريال ${item.note ? '(' + item.note + ')' : ''}`
    ).join('\n');

    const message = `🌟 فاتورة سحايب ديرتي 🌟

فاتورة حجز مواقته

العميل: ${name}
الجوال: ${phone}
العنوان: ${address}
الموعد: ${time}

الطلب:
${itemsText}

الإجمالي: ${document.getElementById('grandTotal').textContent}

شكراً لثقتكم 💙
رقم المطعم: 0112020203`;

    if (phone.length > 8) {
        window.open(`https://wa.me/966\( {phone}?text= \){encodeURIComponent(message)}`, '_blank');
    } else {
        alert('أدخل رقم جوال العميل صحيح (بدون +966)');
    }
}

function clearAll() {
    if (confirm('مسح الفاتورة الحالية؟')) {
        cart = [];
        renderCart();
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custAddress').value = '';
        document.getElementById('custTime').value = '';
    }
}

// تحميل أول مرة
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleString('ar-SA');
});
