// ⭐️ دالة فتح نافذة خيارات الصنف ⭐️
function addToCart(buttonElement) {
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

        // ⭐️⭐️ هذا هو السطر الحاسم الذي يفتح النافذة (بتطبيق كلاس 'show') ⭐️⭐️
        document.getElementById('item-options-overlay').classList.add('show');
        
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
