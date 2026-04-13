let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["وجبات رئيسية", "مشروبات", "حلويات", "مقبلات"],
    items: []
};

let cart = [];

// حفظ القائمة
function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

// عرض القائمة مع ألوان جميلة
function renderMenu() {
    const container = document.getElementById('menuDisplay');
    container.innerHTML = '<h3>القائمة الحالية</h3>';

    menu.categories.forEach((cat, catIndex) => {
        // عنوان القسم بلون جذاب
        const catDiv = document.createElement('div');
        catDiv.className = 'category-title';
        catDiv.textContent = cat;
        container.appendChild(catDiv);

        // الأصناف داخل القسم
        const catItems = menu.items.filter(i => i.category === cat);
        
        catItems.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'item-btn';   // ← هذا هو التعديل المهم للألوان
            btn.textContent = `${item.name} — ${item.price} ريال`;
            btn.onclick = () => addToCart(item);
            container.appendChild(btn);
        });
    });

    // تحديث القائمة المنسدلة لإضافة الأصناف
    const select = document.getElementById('catSelect');
    select.innerHTML = '';
    menu.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

// إضافة قسم جديد
function addCategory() {
    const name = document.getElementById('newCat').value.trim();
    if (!name) return alert("❌ اكتب اسم القسم أولاً");
    if (menu.categories.includes(name)) return alert("❌ هذا القسم موجود مسبقاً");

    menu.categories.push(name);
    saveMenu();
    renderMenu();
    document.getElementById('newCat').value = '';
    alert(`✅ تم إضافة القسم: ${name}`);
}

// إضافة صنف جديد
function addMenuItem() {
    const name = document.getElementById('newItemName').value.trim();
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const category = document.getElementById('catSelect').value;

    if (!name || !price || !category) {
        return alert("❌ يرجى ملء جميع الحقول");
    }

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
    alert(`✅ تم إضافة الصنف: ${name}`);
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

// عرض السلة
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
            <strong>${item.name} × ${item.qty}</strong> = ${itemTotal.toFixed(2)} ريال<br>
            <input type="text" placeholder="ملاحظة على الصنف (مثل: بدون بصل)" 
                   value="${item.note || ''}" 
                   onchange="cart[${index}].note = this.value"
                   style="width:100%; margin:8px 0; padding:8px; border-radius:6px; border:1px solid #ddd;">
            <div style="margin-top:8px;">
                <button onclick="changeQty(${index}, 1)" style="padding:6px 12px;">+</button>
                <button onclick="changeQty(${index}, -1)" style="padding:6px 12px;">−</button>
                <button onclick="removeItem(${index})" style="background:#e74c3c; color:white; padding:6px 12px; margin-right:8px;">حذف</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('grandTotal').textContent = total.toFixed(2) + " ريال";
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
        `- ${item.name} × ${item.qty} = ${item.price * item.qty} ريال ${item.note ? '(' + item.note + ')' : ''}`
    ).join('\n');

    const message = `🌟 فاتورة من سحايب ديرتي 🌟

فاتورة حجز مواقته

العميل: ${name}
الجوال: ${phone}
العنوان: ${address}
الموعد: ${time}

الطلبات:
${itemsText}

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

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    document.getElementById('currentDate').textContent = new Date().toLocaleString('ar-SA');
});
