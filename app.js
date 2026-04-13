// app.js
// التأكد من وجود مستودع بيانات عند أول تشغيل
let db = JSON.parse(localStorage.getItem('restaurant_db')) || {
    categories: [{ name: "العامة", id: 1 }],
    products: []
};

function saveToStorage() {
    localStorage.setItem('restaurant_db', JSON.stringify(db));
}

// سنقوم بإضافة وظائف الإضافة والحذف هنا خطوة بخطوة
function renderCategories() {
    const manager = document.getElementById('categoriesManager');
    manager.innerHTML = ''; // تنظيف القائمة قبل العرض

    db.categories.forEach((cat, index) => {
        manager.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;">
                <span>${cat.name}</span>
                <button onclick="deleteCategory(${index})" style="color:red; border:none; background:none; cursor:pointer;">❌</button>
            </div>
        `;
    });
    function addCategory() {
    const input = document.getElementById('catInput');
    const catName = input.value.trim();

    if (catName) {
        db.categories.push({
            id: Date.now(),
            name: catName
        });
        saveToStorage();
        input.value = '';
        renderCategories(); // تحديث القائمة فوراً
    }
        // تشغيل العرض الأولي
renderCategories();

}

}
// وظيفة حذف قسم من المستودع
function deleteCategory(index) {
    if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
        // 1. إزالة القسم من القائمة
        db.categories.splice(index, 1);
        
        // 2. تحديث المستودع الدائم
        saveToStorage();
        
        // 3. إعادة عرض القائمة المحدثة
        renderCategories();
    }
}

