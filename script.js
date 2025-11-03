// =====================================================================
// PWA Logic - تسجيل عامل الخدمة (Service Worker) ورسالة التثبيت
// =====================================================================

// المسار الصحيح لـ GitHub Pages: يجب إضافة اسم المستودع (/Deerty/)
const BASE_PATH = '/Deerty/'; 
let deferredPrompt;
const pwaInstallPrompt = document.getElementById('pwa-install-prompt');
const installBtn = document.getElementById('install-btn');
const dismissInstallBtn = document.getElementById('dismiss-install-btn');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // تسجيل عامل الخدمة باستخدام المسار الصحيح: /Deerty/sw.js
    navigator.serviceWorker.register(BASE_PATH + 'sw.js') 
      .then((registration) => {
        console.log('ServiceWorker registered successfully. Scope: ', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

// اعتراض حدث "beforeinstallprompt" لإظهار رسالتنا المخصصة
window.addEventListener('beforeinstallprompt', (e) => {
  // منع ظهور الرسالة الافتراضية للمتصفح (لتظهر رسالتنا المخصصة)
  e.preventDefault();
  // حفظ الحدث ليتم تفعيله لاحقاً عند الضغط على زر التثبيت
  deferredPrompt = e;
  // إظهار الرسالة المنبثقة المخصصة
  pwaInstallPrompt.style.display = 'flex';
});

// التعامل مع ضغطة زر التثبيت
installBtn.addEventListener('click', () => {
  pwaInstallPrompt.style.display = 'none'; // إخفاء الرسالة
  if (deferredPrompt) {
    // إطلاق الحدث المحفوظ سابقاً
    deferredPrompt.prompt();
    // الانتظار لمعرفة ما إذا كان المستخدم قد قبل أو رفض
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
});

// التعامل مع زر إلغاء/إغلاق الرسالة
dismissInstallBtn.addEventListener('click', () => {
    pwaInstallPrompt.style.display = 'none';
});

// =====================================================================
// Splash Screen Logic
// =====================================================================
const splashScreen = document.getElementById('splash-screen');
setTimeout(() => {
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 500); // يتطابق مع مدة الانتقال في CSS
}, 3000); // 3 ثواني عرض

// =====================================================================
// Menu Navigation and Toggle Logic
// =====================================================================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// إغلاق قائمة التنقل عند اختيار رابط
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});


// =====================================================================
// CART LOGIC - منطق سلة المشتريات (الذي قمنا ببنائه سابقاً)
// =====================================================================

let cart = [];
const cartModal = document.getElementById('cart-modal');
const viewCartBtn = document.getElementById('view-cart-btn');
const closeBtn = document.querySelector('.close-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const subtotalDisplay = document.getElementById('subtotal-display');
const deliveryFeeDisplay = document.getElementById('delivery-fee-display');
const finalTotalDisplay = document.getElementById('final-total-display');
const sendOrderBtn = document.getElementById('send-order-btn');
const orderMethodRadios = document.querySelectorAll('input[name="order-method-modal"]');
const whatsappNumber = '9665xxxxxxxx'; // 🚨 تأكد من تغيير هذا الرقم لرقمك

function saveCart() {
    localStorage.setItem('menuCart', JSON.stringify(cart));
}

function loadCart() {
    const storedCart = localStorage.getItem('menuCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    updateCartDisplay();
}

function getItemDetails(card) {
    const id = card.getAttribute('data-item-id');
    const title = card.querySelector('.item-title').textContent;
    const basePrice = parseFloat(card.getAttribute('data-base-price'));
    let selectedOptions = [];
    let extraPrice = 0;

    // 1. خيارات مجموعة (Main Options Group) - مثال حبة شواية (D01)
    const mainOptionsGroup = card.querySelector('.main-options-group');
    if (mainOptionsGroup) {
        const selectedMainOption = mainOptionsGroup.querySelector('input:checked');
        if (selectedMainOption) {
            const optionCard = selectedMainOption.closest('.option-card');
            const optionPrice = parseFloat(optionCard.getAttribute('data-option-price')) || 0;
            const optionName = selectedMainOption.nextElementSibling.textContent.trim();
            
            selectedOptions.push(`نوع الأرز: ${optionName}`);
            // هنا لا نضيف سعر الأرز لأنه تم احتسابه كـ فرق في السعر
            // (بما أن الرز الشعبي هو السعر الأساسي)
            extraPrice += optionPrice;
        } else {
             // إجبار المستخدم على اختيار نوع الأرز في وجبات الدجاج الكاملة
             alert('الرجاء اختيار نوع الأرز قبل الإضافة.');
             return null; 
        }
    }
    
    // 2. خيارات بسيطة (Options Group) - مثال نص حبة شواية
    const simpleOptionsGroup = card.querySelector('.options-group');
    if (simpleOptionsGroup) {
        const selectedSimpleOption = simpleOptionsGroup.querySelector('input:checked');
        if (selectedSimpleOption) {
            const optionName = selectedSimpleOption.closest('.option').querySelector('label').textContent.trim();
            const price = parseFloat(selectedSimpleOption.getAttribute('data-add-price'));
            
            selectedOptions.push(`تغيير الأرز إلى: ${optionName} (+${price} ريال)`);
            extraPrice += price;
        }
    }

    // 3. الأطباق الجانبية البسيطة
    if (card.classList.contains('simple-item') && !mainOptionsGroup && !simpleOptionsGroup) {
        // لا يوجد خيارات إضافية، فقط السعر الأساسي
    }

    const finalPrice = basePrice + extraPrice;

    return {
        id,
        title,
        basePrice,
        extraPrice,
        finalPrice,
        options: selectedOptions,
        quantity: 1 // يتم إضافته كعنصر جديد دائماً
    };
}


function addToCart(item) {
    // التحقق من وجود خيارات (إذا كانت مطلوبة) قبل الإضافة
    if (!item) return; 

    // إضافة العنصر إلى السلة
    cart.push(item);
    
    saveCart();
    updateCartDisplay();
    
    // إظهار رسالة تأكيد قصيرة
    viewCartBtn.textContent = `تم إضافة ${item.title}`;
    setTimeout(() => {
        updateCartBtnText();
    }, 1500);
}

function updateCartBtnText() {
    viewCartBtn.textContent = `عرض السلة (${cart.length})`;
}

function removeItemFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartDisplay();
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.finalPrice, 0);
    const orderMethod = document.querySelector('input[name="order-method-modal"]:checked')?.value || 'delivery';
    const deliveryFee = orderMethod === 'delivery' ? 5 : 0;
    const finalTotal = subtotal + deliveryFee;

    return { subtotal, deliveryFee, finalTotal, orderMethod };
}

function updateCartDisplay() {
    const { subtotal, deliveryFee, finalTotal, orderMethod } = calculateTotals();

    // تحديث زر "عرض السلة"
    updateCartBtnText();

    // تحديث المحتوى داخل المودال
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">سلتك فارغة حالياً. أضف بعض الوجبات اللذيذة!</p>';
        sendOrderBtn.disabled = true;
    } else {
        sendOrderBtn.disabled = false;
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item');
            
            let optionsHtml = item.options.length > 0 ? 
                `<small class="item-options">${item.options.join(', ')}</small>` : '';

            itemDiv.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.title}</span>
                    ${optionsHtml}
                </div>
                <span class="item-price">${item.finalPrice} ريال</span>
                <button class="remove-item" data-index="${index}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        // إضافة مستمعي الحذف
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                removeItemFromCart(index);
            });
        });
    }

    // تحديث ملخص السلة
    subtotalDisplay.textContent = `${subtotal.toFixed(0)} ريال`;
    deliveryFeeDisplay.textContent = `${deliveryFee.toFixed(0)} ريال`;
    finalTotalDisplay.textContent = `${finalTotal.toFixed(0)} ريال`;
    
    // تحديث حالة أزرار الراديو للتوصيل/الاستلام
    document.getElementById('delivery-modal').checked = orderMethod === 'delivery';
    document.getElementById('pickup-modal').checked = orderMethod === 'pickup';
}

function generateWhatsAppMessage() {
    const { finalTotal, orderMethod } = calculateTotals();
    
    let message = `مرحباً، أود تقديم طلب من قائمة سحايب ديرتي:\n\n`;
    
    cart.forEach((item, index) => {
        let optionsText = item.options.length > 0 ? ` (${item.options.join(', ')})` : '';
        message += `*${index + 1}. ${item.title}*: ${item.finalPrice} ريال${optionsText}\n`;
    });
    
    message += `\n*الإجمالي (الوجبات)*: ${calculateTotals().subtotal} ريال\n`;
    
    if (orderMethod === 'delivery') {
        message += `*رسوم التوصيل*: ٥ ريال\n`;
        message += `\n*الإجمالي النهائي*: ${finalTotal} ريال (شامل التوصيل)\n`;
        message += `\n*طريقة الاستلام*: توصيل\n`;
        message += `\nالرجاء إرسال الموقع والاسم:\n`;
    } else {
        message += `\n*الإجمالي النهائي*: ${finalTotal} ريال\n`;
        message += `\n*طريقة الاستلام*: استلام من المطعم\n`;
    }
    
    message += `\nشكراً لك.`;

    return encodeURIComponent(message);
}

// =====================================================================
// Event Listeners (Cart)
// =====================================================================

// فتح المودال عند الضغط على زر عرض السلة
viewCartBtn.addEventListener('click', () => {
    updateCartDisplay();
    cartModal.style.display = 'block';
});

// إغلاق المودال عند الضغط على X
closeBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

// إغلاق المودال عند الضغط خارج المودال
window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// إضافة الوجبة إلى السلة
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const card = e.target.closest('.menu-card');
        const item = getItemDetails(card);
        addToCart(item);
    });
});

// تحديث الإجمالي عند تغيير طريقة الطلب (توصيل/استلام)
orderMethodRadios.forEach(radio => {
    radio.addEventListener('change', updateCartDisplay);
});


// زر إرسال الطلب عبر واتساب
sendOrderBtn.addEventListener('click', () => {
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
    
    // بعد الإرسال، يمكن مسح السلة إن أردنا
    // cart = []; 
    // saveCart();
    // updateCartDisplay();
    // cartModal.style.display = 'none';
});


// تحميل السلة عند بدء تشغيل التطبيق
loadCart();
