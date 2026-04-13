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
