const RESTAURANT_NAME = "مطاعم سحايب ديرتي";
const WHATSAPP_NUMBER = "966536803598";
const DELIVERY_FEE = 5;

let cart = [];
let currentOrderType = 'توصيل';

const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartBadge = document.getElementById('cart-badge');
const cartSubtotalPriceElement = document.getElementById('cart-subtotal-price');
const deliveryFeeDisplayElement = document.getElementById('delivery-fee-display');
const cartTotalPriceElement = document.getElementById('cart-total-price');
const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
const deliveryOptionBtn = document.getElementById('delivery-option');
const pickupOptionBtn = document.getElementById('pickup-option');

const itemOptionsOverlay = document.getElementById('item-options-overlay');
const optionItemNameDisplay = document.getElementById('option-item-name');
const optionItemDescription = document.getElementById('option-item-description');
const baseItemPriceInput = document.getElementById('base-item-price');
const baseItemNameInput = document.getElementById('base-item-name');
const optionFinalPriceDisplay = document.getElementById('option-final-price');
const confirmAddToCartBtn = document.getElementById('confirm-add-to-cart-btn');

function openCartModal() {
    cartOverlay.classList.add('show');
    renderCart();
    updateTotal();
}
function closeCartModal() { cartOverlay.classList.remove('show'); }
function closeItemOptionsModal() { itemOptionsOverlay.classList.remove('show'); }

function addToCart(button) {
    const itemElement = button.closest('.menu-item');
    const name = itemElement.getAttribute('data-name');
    const price = parseFloat(itemElement.getAttribute('data-price'));
    openItemOptionsModal(name, price);
}

function addItemToCart(name, price, quantity, options='') {
    const finalName = options ? `${name} (${options})` : name;
    const existingItem = cart.find(item=>item.name===finalName);
    if(existingItem) existingItem.quantity+=quantity;
    else cart.push({name:finalName, price, quantity});
    updateCartBadge();
    updateTotal();
    renderCart();
}

function updateQuantity(name, change) {
    const itemIndex = cart.findIndex(item=>item.name===name);
    if(itemIndex>-1){
        cart[itemIndex].quantity+=change;
        if(cart[itemIndex].quantity<=0) cart.splice(itemIndex,1);
    }
    renderCart(); updateCartBadge(); updateTotal();
}
function removeItem(name){ cart = cart.filter(item=>item.name!==name); renderCart(); updateCartBadge(); updateTotal(); }

function openItemOptionsModal(name, price){
    optionItemNameDisplay.textContent=name;
    optionItemDescription.textContent="";
    baseItemPriceInput.value=price;
    baseItemNameInput.value=name;
    document.querySelector('input[name="size"][value="نص"]').checked=true;
    document.querySelector('input[name="rice"][value="شعبي"]').checked=true;
    updateOptionTotal();
    confirmAddToCartBtn.disabled=false;
    itemOptionsOverlay.classList.add('show');
}

function updateOptionTotal(){
    let basePrice=parseFloat(baseItemPriceInput.value);
    let size=document.querySelector('input[name="size"]:checked');
    let rice=document.querySelector('input[name="rice"]:checked');
    let total=basePrice+parseFloat(size.getAttribute('data-price-modifier'))+parseFloat(rice.getAttribute('data-price-modifier'));
    optionFinalPriceDisplay.textContent=total;
    confirmAddToCartBtn.setAttribute('data-final-price', total);
    confirmAddToCartBtn.setAttribute('data-options', size.value+" - "+rice.value);
}

function confirmAddToCart(){
    let name=baseItemNameInput.value;
    let finalPrice=parseFloat(confirmAddToCartBtn.getAttribute('data-final-price'));
    let options=confirmAddToCartBtn.getAttribute('data-options');
    addItemToCart(name, finalPrice, 1, options);
    closeItemOptionsModal();
}

function updateCartBadge(){
    const totalItems=cart.reduce((sum,item)=>sum+item.quantity,0);
    cartBadge.textContent=totalItems;
    cartBadge.style.display=totalItems>0?'block':'none';
}

function renderCart(){
    cartItemsContainer.innerHTML='';
    if(cart.length===0){cartItemsContainer.innerHTML='<p style="text-align:center;color:#999;">السلة فارغة.</p>';return;}
    cart.forEach(item=>{
        let itemTotal=item.price*item.quantity;
        const div=document.createElement('div');
        div.classList.add('cart-item-entry');
        div.innerHTML=`<div>${item.name}</div>
        <div class="item-quantity">
            <button
