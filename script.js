let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["وجبات رئيسية", "مشروبات", "حلويات"],
    items: []
};

let cart = [];

function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

function renderMenu() {
    const container = document.getElementById('menuDisplay');
    container.innerHTML = '<h3>القائمة الحالية:</h3>';

    menu.categories.forEach(cat => {
        const catDiv = document.createElement('div');
        catDiv.style.margin = '10px 0';
        catDiv.innerHTML = `<strong>${cat}</strong>`;
        container.appendChild(catDiv);

        const catItems = menu.items.filter(i => i.category === cat);
        catItems.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = `${item.name} — ${item.price} ريال`;
            btn.style.display = 'block';
            btn.style.width = '100%';
            btn.style.margin = '4px 0';
            btn.style.padding = '10px';
            btn.onclick = () => addToCart(item);
            container.appendChild(btn);
        });
    });

    // تحديث الـ select
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
    const input = document.getElementById('newCat');
    const name = input.value.trim();
    
    if (!name) {
        alert("اكتب اسم القسم أولاً");
        return;
    }
    if (menu.categories.includes(name)) {
        alert("هذا القسم موجود مسبقاً");
        return;
    }

    menu.categories.push(name);
    saveMenu();
    renderMenu();
    input.value = '';
    alert(`تم إضافة القسم: ${name} بنجاح ✅`);
}

function addMenuItem() {
    const name = document.getElementById('newItemName').value.trim();
    const priceStr = document.getElementById('newItemPrice').value;
    const category = document.getElementById('catSelect').value;

    if (!name || !priceStr || !category) {
        alert("املأ اسم الصنف والسعر والقسم");
        return;
    }

    const price = parseFloat(priceStr);
    menu.items.push({
        id: Date.now(),
        name: name,
        price: price,
        category: category
    });

    saveMenu();
    renderMenu();
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemPrice').value = '';
    alert(`تم إضافة الصنف: ${name}`);
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
            <input type="text" placeholder="ملاحظة" value="${item.note}" 
                   onchange="cart[${index}].note = this.value" style="width:100%; margin-top:5px;">
            <button onclick="changeQty(${index},1)">+</button>
            <button onclick="changeQty(${index},-1)">−</button>
            <button onclick="removeItem(${index})" style="background:red;color:white;">حذف</button>
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
    const phone = document.getElementById('custPhone').value.trim().replace(/[^0-9]/g, '');
    if (phone.length < 9) {
        alert("أدخل رقم جوال صحيح");
        return;
    }
    // يمكنك توسيع الرسالة لاحقاً
    let msg = "فاتورة من سحايب ديرتي\nفاتورة حجز مواقته\n\n";
    cart.forEach(i => msg += `${i.name} × ${i.qty} = ${i.price*i.qty} ريال\n`);
    msg += `\nالإجمالي: ${document.getElementById('grandTotal').textContent} ريال\nرقم المطعم: 0112020203`;
    
    window.open(`https://wa.me/966\( {phone}?text= \){encodeURIComponent(msg)}`, '_blank');
}

function clearCart() {
    if (confirm("مسح السلة والفاتورة؟")) {
        cart = [];
        renderCart();
    }
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
});
