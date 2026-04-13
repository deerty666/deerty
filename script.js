/* --- الإعدادات الثابتة --- */
// ✅ تم تثبيت رابط تطبيق مطعم سحايب ديرتي هنا بصورة دائمة
const APP_QR_URL = "https://sahaib.page.link/download"; // استبدل هذا بالرابط الحقيقي الدائم لتطبيقك
const QR_SERVER_API = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";

/* --- إدارة البيانات (التخزين المحلي) --- */
let data = JSON.parse(localStorage.getItem("menu")) || [
    // بيانات افتراضية للتشغيل الأول
    {name: "فطور", items: [{name: "كبسة", price: 25}]},
    {name: "مشروبات", items: [{name: "بيبسي", price: 3}]}
];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let inv = parseInt(localStorage.getItem("inv")) || 1013;
let activeCat = 0;

/* --- دوال الحفظ --- */
function save(){ localStorage.setItem("menu", JSON.stringify(data)); }
function saveCart(){ localStorage.setItem("cart", JSON.stringify(cart)); }

/* --- التهيئة الأساسية وتشغيل النظام --- */
window.onload = function() {
    render();
    registerServiceWorker(); // تفعيل العمل بدون إنترنت
};

/* --- رسم الواجهة (Rendering) --- */
function render(){
    // تحديث بيانات الهيدر
    document.getElementById("inv").innerText = inv;
    
    // 1. رسم الأقسام
    let catsDiv = document.getElementById("cats");
    let select = document.getElementById("catSelect");
    catsDiv.innerHTML = ""; select.innerHTML = "";
    
    data.forEach((c, i) => {
        catsDiv.innerHTML += `
            <div class="cat-container">
                <div class="cat ${i===activeCat?'active':''}" onclick="changeCategory(${i})">${c.name}</div>
                <button class="edit-btn" onclick="editCat(${i})">📝</button>
            </div>`;
        select.innerHTML += `<option value="${i}">${c.name}</option>`;
    });

    // 2. تحديث الباركود الثابت
    updateQrCode();

    // 3. عرض أصناف القسم النشط ورسم السلة
    showItems();
    updateCart();
}

function changeCategory(index) {
    activeCat = index;
    render();
}

/* --- عرض أصناف القسم --- */
function showItems(){
    let div = document.getElementById("items"); div.innerHTML = "";
    if(!data[activeCat] || !data[activeCat].items) return;
    
    data[activeCat].items.forEach((it, idx) => {
        div.innerHTML += `
        <div class="item-container">
            <div class="item" onclick="addCart('${it.name}', ${it.price})">${it.name}<br>${it.price} ر.س</div>
            <button class="edit-btn" onclick="editItem(${activeCat}, ${idx})">📝</button>
            <button class="delete-btn" onclick="deleteItemFromMenu(${idx})">🗑️</button>
        </div>`;
    });
}

/* --- إدارة السلة (Cart Management) --- */
function addCart(name, price){
    // التحقق مما إذا كان الصنف موجوداً لتزيادة الكمية
    let existingItem = cart.find(it => it.name === name);
    if(existingItem) {
        existingItem.qty++;
    } else {
        cart.push({name, price, qty: 1, note: ""});
    }
    saveCart(); updateCart();
}

function changeQty(i, delta) {
    cart[i].qty += delta;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    saveCart(); updateCart();
}

function addNote(i){ 
    let n = prompt("أدخل ملاحظة لهذا الصنف:", cart[i].note); 
    if(n!==null) cart[i].note = n; 
    saveCart(); updateCart(); 
}

function removeItemFromCart(i){ 
    if(confirm("حذف الصنف من السلة؟")) {
        cart.splice(i,1); 
        saveCart(); updateCart(); 
    }
}

function clearCart(){ 
    if(confirm("هل أنت متأكد من بدء فاتورة جديدة ومسح السلة؟")){ 
        cart=[]; 
        saveCart(); updateCart(); 
    }
}

/* --- تحديث حسابات السلة والعرض --- */
function updateCart(){
    let div = document.getElementById("cart"); div.innerHTML = "";
    let subTotal = 0;
    
    cart.forEach((it, idx) => {
        let itemTotal = it.price * it.qty;
        subTotal += itemTotal;
        div.innerHTML += `
            <div class="line">
                <span class="no-print"><button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button></span>
                <span>${it.name} x${it.qty}</span>
                <span class="no-print"><button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button></span>
                <span class="dots"></span>
                <span>${itemTotal.toFixed(2)}</span>
            </div>
            ${it.note ? `<div class="note-line">📝 ${it.note}</div>` : ''}
            <div class="no-print cart-item-actions">
                <button onclick="addNote(${idx})" style="background:#8e44ad; color:white; border:none; border-radius:4px;">📝 ملاحظة</button>
                <button onclick="removeItemFromCart(${idx})" style="background:#c0392b; color:white; border:none; border-radius:4px;">❌ حذف</button>
            </div>`;
    });
    
    let total = subTotal;
    // إضافة رسوم التوصيل إذا تم تفعيله
    if(document.getElementById("delivery").checked) {
        let fee = parseFloat(document.getElementById("deliveryFee").value) || 0;
        total += fee;
    }
    
    document.getElementById("totalDisplay").innerText = total.toFixed(2);
}

/* --- إدارة الباركود الثابت --- */
function updateQrCode() {
    let container = document.getElementById("appQrContainer");
    container.innerHTML = ""; // مسح القديم
    
    // إنشاء عنصر صورة للباركود
    let qrImg = document.createElement("img");
    qrImg.style.width = "120px";
    qrImg.style.height = "120px";
    
    // رابط طلب الباركود
    qrImg.src = QR_SERVER_API + encodeURIComponent(APP_QR_URL);
    qrImg.alt = "الباركود الخاص بالتطبيق";
    
    container.appendChild(qrImg);
}

/* --- إدارة القائمة (Menu Admin) --- */
function addCat(){ 
    let n = document.getElementById("catName").value.trim(); 
    if(n){ data.push({name:n, items:[]}); save(); render(); document.getElementById("catName").value=""; }
}

function addItem(){ 
    let c = document.getElementById("catSelect").value;
    let n = document.getElementById("itemName").value.trim();
    let p = document.getElementById("itemPrice").value; 
    if(n && p){ data[c].items.push({name:n, price:parseFloat(p)}); save(); render(); document.getElementById("itemName").value=""; document.getElementById("itemPrice").value=""; }
}

function editCat(i){ 
    let n = prompt("الاسم الجديد للقسم:", data[i].name); 
    if(n){ data[i].name = n; save(); render(); }
}

function editItem(c, i){ 
    let it = data[c].items[i];
    let n = prompt("الاسم الجديد:", it.name); 
    let p = prompt("السعر الجديد:", it.price);
    if(n && p){ data[c].items[i] = {name:n, price:parseFloat(p)}; save(); render(); }
}

function deleteItemFromMenu(index) {
    if (confirm("هل أنت متأكد من حذف هذا الصنف نهائياً من القائمة؟")) {
        data[activeCat].items.splice(index, 1);
        save();
        render();
    }
}

function toggleDelivery(s){ 
    document.getElementById("deliveryInput").style.display = s ? "block" : "none"; 
    updateCart(); 
}

/* --- دوال الطباعة والواتساب --- */
function printInvoice(){ 
    window.print(); 
    // زيادة رقم الفاتورة بعد الطباعة
    inv++; 
    localStorage.setItem("inv", inv); 
    // إعادة رسم لتحديث الرقم على الشاشة (بدون تصفير السلة)
    document.getElementById("inv").innerText = inv;
}

function sendWhats(){
    let phoneInput = document.getElementById("cPhone").value.trim();
    if(!phoneInput) return alert("يرجى إدخال جوال العميل!");
    
    // تنظيف الرقم: إزالة الصفر الأول إذا وجد
    let phone = phoneInput;
    if(phone.startsWith("0")) phone = phone.substring(1);
    
    let msg = `*🧾 فاتورة حجز من مطعم سحايب ديرتي* 🧾%0A`;
    msg += `*رقم الفاتورة:* ${document.getElementById("inv").innerText}%0A`;
    msg += `------------------------------------------%0A`;
    
    cart.forEach(it => {
        let itemTotal = (it.price * it.qty).toFixed(2);
        msg += `• *${it.name}*%0A`;
        msg += `  الكمية: ${it.qty} × ${it.price} = *${itemTotal} ريال*%0A`;
        if (it.note) msg += `  📝 ملاحظة: ${it.note}%0A`;
    });
    
    msg += `------------------------------------------%0A`;
    
    let isDelivery = document.getElementById("delivery").checked;
    if(isDelivery) {
        let fee = document.getElementById("deliveryFee").value;
        msg += `*🚗 رسوم التوصيل:* ${fee} ريال%0A`;
    }
    msg += `*💰 الإجمالي النهائي:* *${document.getElementById("totalDisplay").innerText} ريال*%0A`;
    msg += `------------------------------------------%0A`;
    
    msg += `*👤 العميل:* ${document.getElementById("cName").value || "غير مسجل"}%0A`;
    if(isDelivery) {
        msg += `*📍 الموقع:* ${document.getElementById("cLoc").value || "غير محدد"}%0A`;
    }
    
    msg += `%0A*شكراً لتعاملكم معنا!* 💙%0A%0A`;
    msg += `📲 *اطلب أسرع وتابع طلباتك بكل سهولة!*%0A`;
    msg += `حمل تطبيقنا الآن من خلال الرابط التالي:%0A${APP_QR_URL}`;
    
    window.open(`https://wa.me/966${phone}?text=${msg}`);
}

/* --- تفعيل العمل بدون إنترنت (Service Worker) --- */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker تم تسجيله بنجاح! ✅'))
            .catch(err => console.error('فشل تسجيل Service Worker:', err));
    }
}
