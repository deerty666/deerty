let cart = [];
let menu = JSON.parse(localStorage.getItem('menu')) || {
    categories: ["مشروبات", "وجبات رئيسية", "حلويات"],
    items: [
        {id:1, name:"كبسة دجاج", price:45, cat:"وجبات رئيسية"},
        {id:2, name:"عصير برتقال", price:12, cat:"مشروبات"},
        {id:3, name:"كنافة", price:25, cat:"حلويات"}
    ]
};

function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

function renderCategories() {
    // يمكن توسيعها لاحقاً
}

function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
    } else {
        cart.push({...item, qty:1, note:""});
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cartItems');
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="item-name">${item.name} × ${item.qty}</div>
            <div>${item.price * item.qty} ريال</div>
            <input type="text" class="note" placeholder="ملاحظة (بدون بصل...)" 
                   value="${item.note || ''}" 
                   onchange="updateNote(${index}, this.value)">
            <button onclick="changeQty(${index}, -1)">−</button>
            <button onclick="changeQty(${index}, 1)">+</button>
            <button onclick="removeFromCart(${index})">حذف</button>
        `;
        container.appendChild(div);
        total += item.price * item.qty;
    });

    document.getElementById('grandTotal').textContent = total.toFixed(2);
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
    const phone = document.getElementById('custPhone').value.replace('+', '');
    const address = document.getElementById('custAddress').value || '-';
    const time = document.getElementById('custTime').value || '-';
    let itemsText = '';
    
    cart.forEach(item => {
        itemsText += `- ${item.name} × ${item.qty} = ${item.price * item.qty} ريال`;
        if (item.note) itemsText += ` (${item.note})`;
        itemsText += '\n';
    });

    const message = `🌟 فاتورة من سحايب ديرتي 🌟

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

    if (phone) {
        window.open(`https://wa.me/\( {phone}?text= \){encodeURIComponent(message)}`, '_blank');
    } else {
        alert('أدخل رقم جوال العميل أولاً');
    }
}

function clearAll() {
    if (confirm('حذف الفاتورة الحالية؟')) {
        cart = [];
        renderCart();
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custAddress').value = '';
        document.getElementById('custTime').value = '';
    }
}

// تحديث التاريخ
document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleString('ar-SA');
    
    // يمكنك إضافة أزرار لإضافة الأصناف من القائمة هنا
    // مثال بسيط: أضف أصناف افتراضية إلى السلة
});
