let cart = [];
const DELIVERY_FEE = 5.00;
const whatsappNumber = '966112020203'; // رقم المطعم (تأكد من الرقم)

document.addEventListener('DOMContentLoaded', () => {
    // 1. إدارة التنقل السفلي
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active-nav'));
            item.classList.add('active-nav');
        });
    });

    // 2. إدارة أيقونات الفئات العلوية
    const categoryIconItems = document.querySelectorAll('.main-categories-scroll .category-icon-item');
    categoryIconItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            categoryIconItems.forEach(i => i.classList.remove('active-icon'));
            this.classList.add('active-icon');

            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 3. تحديث العرض الأولي للسلة
    updateCartDisplay();
});


// ⭐️ دالة فتح نافذة خيارات الصنف ⭐️
function addToCart(buttonElement) {
    // 🛑 التحقق الحاسم: هل العنصر موجود؟ 🛑
    const overlay = document.getElementById('item-options-overlay');
    if (!overlay) {
        alert("خطأ حاسم: لم يتم العثور على النافذة المنبثقة! تأكد من وجود ID='item-options-overlay' في ملف index.html");
        console.error("Critical Error: Modal element not found with ID 'item-options-overlay'");
        return; // توقف التنفيذ إذا لم يتم العثور على العنصر
    }

    const itemElement = buttonElement.closest('.menu-item');
    const itemName = itemElement.getAttribute('data-name');
    const itemPrice = parseFloat(itemElement.getAttribute('data-price'));
    const itemCategory = itemElement.getAttribute('data-category');
    
    // تحديد الأصناف التي تحتاج خيارات: اللحوم والدجاج
    const requiresOptions = itemCategory === 'chicken' || itemCategory === 'meat';
    
    if (requiresOptions) {
        const isTais = itemElement.hasAttribute('data-is-tais');

        // إعداد النافذة المنبثقة
        document.getElementById('option-item-name').textContent = itemName;
        document.getElementById('option-item-description').textContent = itemElement.querySelector('.description').textContent;
        document.getElementById('base-item-price').value = itemPrice;
        document.getElementById('base-item-name').value = itemName;
        
        // إخفاء/إظهار خيار الحجم
        const sizeGroup = document.querySelector('.options-group:nth-child(2)'); 
        if (isTais || itemName.includes('نفر لحم')) {
            sizeGroup.style.display = 'none';
        } else {
            sizeGroup.style.display = 'block';
            document.querySelector('input[name="size"][value="نص"]').checked = true;
        }

        updateRicePrices(itemName);

        // ⭐️⭐️ السطر الذي يفتح النافذة ⭐️⭐️
        overlay.classList.add('show');
        
        updateOptionTotal();

    } else {
        // إذا كان الصنف بسيطاً
        addItemToCart({
            name: itemName,
            price: itemPrice,
            quantity: 1,
            options: 'صنف بسيط'
        });
    }
}

// ... (بقية الدوال تبقى كما هي: updateRicePrices, updateOptionTotal, confirmAddToCart, addItemToCart, etc.)
// لضمان التشغيل الصحيح، استخدم الكود الكامل لملف script.js الذي أرسلته سابقاً، مع استبدال دالة addToCart فقط بهذا الإصدار الجديد.

// *************************************************************
// باقي الدوال (مثل updateRicePrices, updateOptionTotal, confirmAddToCart, etc.)
// يجب أن تبقى كما هي في ملف script.js الذي أرسلته مسبقاً
// *************************************************************
function updateRicePrices(itemName) { /* ... */ }
function updateOptionTotal() { /* ... */ }
function confirmAddToCart() { /* ... */ }
function addItemToCart(item) { /* ... */ }
function removeItemFromCart(index) { /* ... */ }
function updateItemQuantity(index, change) { /* ... */ }
function updateCartDisplay() { /* ... */ }
function selectOrderType(type, button) { /* ... */ }
function closeItemOptionsModal() { 
    document.getElementById('item-options-overlay').classList.remove('show');
    document.querySelector('input[name="size"][value="نص"]').checked = true;
    document.querySelector('input[name="rice"][value="شعبي"]').checked = true;
}
function openCartModal() { /* ... */ }
function closeCartModal() { /* ... */ }
function sendWhatsappMessage() { /* ... */ }
