let db = JSON.parse(localStorage.getItem('deerty_db')) || { categories: [], products: [] };

function saveToStorage() {
    localStorage.setItem('deerty_db', JSON.stringify(db));
}

// إدارة الأقسام
function addCategory() {
    const input = document.getElementById('catInput');
    if (input.value.trim()) {
        db.categories.push({ id: Date.now().toString(), name: input.value });
        input.value = '';
        saveToStorage();
        renderAll();
    }
}

function deleteCategory(index) {
    if (confirm("حذف القسم؟")) {
        db.categories.splice(index, 1);
        saveToStorage();
        renderAll();
    }
}

// إدارة الأصناف
function addProduct() {
    const name = document.getElementById('prodNameInput').value;
    const price = document.getElementById('prodPriceInput').value;
    const catId = document.getElementById('prodCatSelect').value;

    if (name && price && catId) {
        db.products.push({ name, price, catId });
        saveToStorage();
        renderAll();
    }
}

// تحديث الشاشة
function renderAll() {
    const catNav = document.getElementById('categoriesNav');
    const catManager = document.getElementById('categoriesManager');
    const catSelect = document.getElementById('prodCatSelect');

    catNav.innerHTML = ''; catManager.innerHTML = ''; catSelect.innerHTML = '';

    db.categories.forEach((cat, index) => {
        catNav.innerHTML += `<button class="cat-btn">${cat.name}</button>`;
        catSelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        catManager.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:5px;">
                <span>${cat.name}</span>
                <button onclick="deleteCategory(${index})" style="color:red; border:none; cursor:pointer;">❌</button>
            </div>`;
    });
}

renderAll();
