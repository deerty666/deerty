document.addEventListener('DOMContentLoaded', () => {
    
    // ---------------------- 1. منطق القائمة (Hamburger Menu) ----------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        menuToggle.classList.toggle('open');
    });

    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.classList.remove('open');
        });
    });

    // ---------------------- 2. منطق سلة المشتريات (Cart) ----------------------
    let cartItems = [];
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    const viewCartBtn = document.getElementById('view-cart-btn');

    // وظيفة تحديث عرض السلة
    function updateCartDisplay() {
        viewCartBtn.textContent = `عرض السلة (${cartItems.length})`;
    }

    // وظيفة إضافة الطلب إلى السلة
    addButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            
            // استخراج البيانات الأساسية
            const itemId = card.getAttribute('data-item-id');
            const itemTitle = card.querySelector('.item-title').textContent;
            let basePrice = parseInt(card.getAttribute('data-base-price'));
            
            let itemTotalPrice = basePrice;
            let itemDescription = itemTitle + " (رز شعبي)"; // الوصف الافتراضي

            // استخراج خيار الأرز الإضافي (الزر المحدد)
            const selectedRiceInput = card.querySelector(`input[name="rice-${itemId}"]:checked`);
            
            if (selectedRiceInput) {
                const addPrice = parseInt(selectedRiceInput.getAttribute('data-add-price'));
                const optionLabel = selectedRiceInput.previousElementSibling.previousElementSibling.textContent;
                
                itemTotalPrice = basePrice + addPrice;
                itemDescription = itemTitle + " (تغيير إلى " + optionLabel + ")";
            }

            // إضافة الطلب إلى المصفوفة
            cartItems.push({
                title: itemTitle,
                description: itemDescription,
                price: itemTotalPrice,
                quantity: 1 // يمكن تطويرها لاحقاً لإضافة كميات
            });

            alert(`تم إضافة ${itemTitle} إلى السلة!`);
            updateCartDisplay();
        });
    });


    // ---------------------- 3. منطق توليد رسالة واتساب ----------------------
    viewCartBtn.addEventListener('click', () => {
        if (cartItems.length === 0) {
            alert('السلة فارغة، يرجى إضافة بعض الوجبات أولاً.');
            return;
        }

        let orderDetails = "أهلاً، أود طلب الآتي من مطاعم ومطابخ سحايب ديرتي:\n\n";
        let total = 0;

        cartItems.forEach((item, index) => {
            orderDetails += `${index + 1}. ${item.description} - السعر: ${item.price} ريال\n`;
            total += item.price;
        });

        orderDetails += `\n*الإجمالي المطلوب: ${total} ريال*`;
        orderDetails += `\n\nيرجى تأكيد الطلب والموقع.`;

        // ترميز الرسالة لـ URL
        const encodedMessage = encodeURIComponent(orderDetails);
        
        // رقم الواتساب الخاص بك (يرجى تغييره)
        const whatsappNumber = '9665xxxxxxxx'; 

        // فتح رابط الواتساب (للجوال: يستخدم api.whatsapp.com، للويب: يستخدم web.whatsapp.com)
        const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
        
        window.open(whatsappLink, '_blank');
    });

});
