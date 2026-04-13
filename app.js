// 1. تحميل البيانات من المستودع أو إنشاء بيانات فارغة
let db = JSON.parse(localStorage.getItem('deerty_db')) || { categories: [], products: [], cart: [] };

function saveToStorage() {
    localStorage.setItem('deerty_db', JSON.stringify(db));
}

// 2. إدارة الأقسام
function addCategory() {
    const input = document.getElementById('catInput');
    const name = input.value.trim();
    if (name) {
        db.categories.push({ id: Date.now().toString(), name: name });
        input.value = '';
        saveToStorage();
        renderAll();
    }
}

function deleteCategory(id) {
    if (confirm("هل تريد حذف هذا القسم؟")) {
        db.categories = db.categories.filter(c => c.id !== id);
        db.products = db.products.filter(p => p.catId !== id);
        saveToStorage();
        renderAll();
    }
}

// 3. إدارة الأصناف
function addProduct() {
    const name = document.getElementById('prodNameInput').value;
    const price = document.getElementById('prodPriceInput').value;
    const catId = document.getElementById('prodCatSelect').value;

    if (name && price && catId) {
        db.products.push({ id: Date.now().toString(), name, price: parseFloat(price), catId });
        document.getElementById('prodNameInput').value = '';
        document.getElementById('prodPriceInput').value = '';
        saveToStorage();
        renderAll();
    }
}

// 4. السلة والحساب
function addToCart(prod) {
    db.cart.push(prod);
    renderCart();
}

function renderCart() {
    const cartDiv = document.getElementById('cartItems');
    const totalSpan = document.getElementById('totalDisplay');
    cartDiv.innerHTML = '';
    let total = 0;

    db.cart.forEach((item, index) => {
        total += item.price;
        cartDiv.innerHTML += `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>${item.price.toFixed(2)} ر.س</span>
            </div>`;
    });
    totalSpan.innerText = total.toFixed(2);
}

// 5. تحديث الشاشة بالكامل
function renderAll() {
    const catNav = document.getElementById('categoriesNav');
    const catManager = document.getElementById('categoriesManager');
    const catSelect = document.getElementById('prodCatSelect');
    const prodGrid = document.getElementById('productsGrid');

    catNav.innerHTML = ''; catManager.innerHTML = ''; catSelect.innerHTML = ''; prodGrid.innerHTML = '';

    db.categories.forEach(cat => {
        // إضافة لتبويب الأقسام
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.innerText = cat.name;
        btn.onclick = () => renderProducts(cat.id);
        catNav.appendChild(btn);

        // إضافة للقائمة المنسدلة
        catSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;

        // إضافة للوحة الحذف
        catManager.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #ddd;">
                <span>${cat.name}</span>
                <button onclick="deleteCategory('${cat.id}')" style="color:red; border:none; background:none; cursor:pointer;">❌</button>
            </div>`;
    });

    renderProducts();
    renderCart();
}

function renderProducts(filterId = null) {
    const prodGrid = document.getElementById('productsGrid');
    prodGrid.innerHTML = '';
    
    const list = filterId ? db.products.filter(p => p.catId === filterId) : db.products;

    list.forEach(p => {
        prodGrid.innerHTML += `
            <div class="prod-card" onclick='addToCart(${JSON.stringify(p)})'>
                <strong>${p.name}</strong>
                <p>${p.price} ر.س</p>
            </div>`;
    });
}

// تشغيل النظام عند الفتح
renderAll();
