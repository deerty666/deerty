/* --- الإعدادات الثابتة --- */
const APP_QR_URL = "https://sahaib.page.link/download"; 
const QR_SERVER_API = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";

/* --- إدارة البيانات --- */
let data = JSON.parse(localStorage.getItem("menu")) || [
    {name: "فطور", items: [{name: "كبسة", price: 25}]},
    {name: "مشروبات", items: [{name: "بيبسي", price: 3}]}
];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let inv = parseInt(localStorage.getItem("inv")) || 1013;
let activeCat = 0;

function save(){ localStorage.setItem("menu", JSON.stringify(data)); }
function saveCart(){ localStorage.setItem("cart", JSON.stringify(cart)); }

window.onload = function() {
    render();
    registerServiceWorker(); 
};

/* --- رسم الواجهة --- */
function render(){
    document.getElementById("inv").innerText = inv;
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

    updateQrCode();
    showItems();
    updateCart();
}

function changeCategory(index) {
    activeCat = index;
    render();
}

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

/* --- إدارة السلة (التعديل المطلوب هنا) --- */
function updateCart(){
    let div = document.getElementById("cart"); div.innerHTML = "";
    let subTotal = 0;
    
    cart.forEach((it, idx) => {
        let itemTotal = it.price * it.qty;
        subTotal += itemTotal;
        
        // بناء الهيكل الجديد: (الاسم والكمية - نقاط مرنة - السعر)
        div.innerHTML += `
            <div class="cart-item-group">
                <div class="line">
                    <span class="item-name">${it.name} x${it.qty}</span>
                    <span class="leader-dots"></span>
                    <span class="item-price">${itemTotal.toFixed(2)}</span>
                </div>
                ${it.note ? `<div class="note-line">📝 ${it.note}</div>` : ''}
                
                <div class="no-print cart-item-actions">
                    <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
                    <button class="qty-btn" onclick="changeQty(${idx}, -1)">-</button>
                    <button onclick="addNote(${idx})" style="background:#8e44ad; color:white;">📝 ملاحظة</button>
                    <button onclick="removeItemFromCart(${idx})" style="background:#c0392b; color:white;">❌ حذف</button>
                </div>
            </div>`;
    });
    
    let total = subTotal;
    if(document.getElementById("delivery").checked) {
        total += parseFloat(document.getElementById("deliveryFee").value) || 0;
    }
    document.getElementById("totalDisplay").innerText = total.toFixed(2);
}

/* --- بقية الدوال --- */
function addCart(name, price){
    let existingItem = cart.find(it => it.name === name);
    if(existingItem) { existingItem.qty++; } 
    else { cart.push({name, price, qty: 1, note: ""}); }
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
    if(confirm("حذف الصنف من السلة؟")) { cart.splice(i,1); saveCart(); updateCart(); }
}

function clearCart(){ 
    if(confirm("بدء فاتورة جديدة؟")){ cart=[]; saveCart(); updateCart(); }
}

function updateQrCode() {
    let container = document.getElementById("appQrContainer");
    container.innerHTML = ""; 
    let qrImg = document.createElement("img");
    qrImg.style.width = "120px";
    qrImg.style.height = "120px";
    qrImg.src = QR_SERVER_API + encodeURIComponent(APP_QR_URL);
    container.appendChild(qrImg);
}

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
    if (confirm("حذف الصنف نهائياً؟")) { data[activeCat].items.splice(index, 1); save(); render(); }
}

function toggleDelivery(s){ 
    document.getElementById("deliveryInput").style.display = s ? "block" : "none"; 
    updateCart(); 
}

function printInvoice(){ 
    window.print(); 
    inv++; 
    localStorage.setItem("inv", inv); 
    document.getElementById("inv").innerText = inv;
}

function sendWhats(){
    let phoneInput = document.getElementById("cPhone").value.trim();
    if(!phoneInput) return alert("يرجى إدخال جوال العميل!");
    let phone = phoneInput.startsWith("0") ? phoneInput.substring(1) : phoneInput;
    let msg = `*🧾 فاتورة حجز من مطعم سحايب ديرتي*%0A*رقم الفاتورة:* ${inv}%0A------------------------------------------%0A`;
    cart.forEach(it => {
        msg += `• *${it.name}* (x${it.qty}) = ${(it.price * it.qty).toFixed(2)} ريال%0A${it.note ? `  📝 ملاحظة: ${it.note}%0A` : ''}`;
    });
    msg += `------------------------------------------%0A*الإجمالي:* *${document.getElementById("totalDisplay").innerText} ريال*%0A%0Aحمل تطبيقنا: ${APP_QR_URL}`;
    window.open(`https://wa.me/966${phone}?text=${msg}`);
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
    }
}
