$(document).ready(function () {

    // Auth 安全檢查
    const hasAuth = typeof Auth !== 'undefined';
    if (hasAuth) {
        Auth.updateNavbar('../');
    }

    if (!$('#cart-items-wrapper').length) return;

    // 資料 
    const CART_KEY = 'auraCart';
    let cartItems = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

    // Badge
    function updateCartBadge() {
        let totalQty = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalQty);
    }

    // 儲存
    function syncCartData() {
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
        updateCartBadge();
    }

    // 結帳區塊 
    function renderCheckoutArea() {
        const isLoggedIn = hasAuth ? Auth.isLoggedIn() : true;
        const hasItems = cartItems.length > 0; // 檢查購物車內是否有商品

        if (isLoggedIn) {
            if (hasItems) {
                
                $('#checkout-action-area').html(`
                    <button class="btn-main-checkout active" id="btn-submit-order">
                        確認結帳
                    </button>
                `);
            } else {
                
                $('#checkout-action-area').html(`
                    <button class="btn-main-checkout" id="btn-submit-order" disabled>
                        確認結帳
                    </button>
                `);
            }
        } else {
           
            $('#checkout-action-area').html(`
                <div class="auth-notice-box">
                    <p>請先登入才能結帳</p>
                    <div class="auth-links">
                        <a href="../pages/Login.html">登入</a>
                        <a href="../pages/Register.html">註冊</a>
                    </div>
                </div>
            `);
        }
    }

    function renderCartList() {

        // 
        if (!cartItems.length) {
            $('.cart-main-card').addClass('is-empty');

            $('#cart-items-wrapper').html(`
                <span class="empty-cart-text">您的購物車目前沒有任何商品。</span>
            `);
            updateSummary();
            renderCheckoutArea();
            return;
        }
        $('.cart-main-card').removeClass('is-empty');
        let html = '';
        cartItems.forEach(item => {
            html += `
                <div class="cart-item-row">
                    <div class="item-meta">
                        <img src="${item.img || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80'}" alt="${item.name || ''}">
                        <div>
                            <h4>${item.name || '商品'}</h4>
                            <span>NT$ ${(item.price || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="quantity-selector">
                        <button class="btn-decrease" data-id="${item.id}">−</button>
                        <span>${item.qty || 1}</span>
                        <button class="btn-increase" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
        });

        $('#cart-items-wrapper').html(html);
        updateSummary();
        renderCheckoutArea();
    }

    //金額
    function updateSummary() {
        let subtotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
        
        let shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 150;
        let total    = subtotal + shipping;

        $('#cart-subtotal').text(`NT$ ${subtotal.toLocaleString()}`);
        $('#cart-shipping').text(shipping === 0 ? '免運' : `NT$ ${shipping}`);
        $('#cart-total').text(`NT$ ${total.toLocaleString()}`);
    }

    $('#cart-items-wrapper').on('click', '.btn-increase', function () {
        let id   = $(this).data('id');
        let item = cartItems.find(i => i.id == id);
        if (item) item.qty = (item.qty || 0) + 1;
        syncCartData();
        renderCartList();
    });

    $('#cart-items-wrapper').on('click', '.btn-decrease', function () {
        let id    = $(this).data('id');
        let index = cartItems.findIndex(i => i.id == id);
        if (index !== -1) {
            cartItems[index].qty = (cartItems[index].qty || 0) - 1;
            if (cartItems[index].qty <= 0) cartItems.splice(index, 1);
        }
        syncCartData();
        renderCartList();
    });

    // 結帳 
    $('#checkout-action-area').on('click', '#btn-submit-order', function (e) {
        e.preventDefault();

        if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
            window.location.href = '../pages/Login.html';
            return;
        }

        const currentUser = Auth.currentUser();
        
        let cartItems = JSON.parse(localStorage.getItem('auraCart')) || [];

        if (cartItems.length === 0) {
            alert('您的購物車內沒有商品，無法結帳！');
            return;
        }

        const btn = $(this);
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> 處理中...');

        setTimeout(() => {
            let allOrders = JSON.parse(localStorage.getItem('all_users_orders')) || [];
            let orderTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const randomOrderId = "ORD-" + now.getFullYear() + 
                                String(now.getMonth() + 1).padStart(2, '0') + 
                                String(now.getDate()).padStart(2, '0') + 
                                Date.now().toString().slice(-4);

            // 打包成單一訂單物件，把全體商品賽進 items 陣列
            const combinedOrder = {
                userEmail: currentUser.email.toLowerCase().trim(),
                id: randomOrderId,
                date: todayStr,
                totalAmount: orderTotal,
                items: cartItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    qty: item.qty
                }))
            };

            // 
            allOrders.unshift(combinedOrder);
            localStorage.setItem('all_users_orders', JSON.stringify(allOrders));

            //結帳完成，清空購物車
            localStorage.removeItem('auraCart');
            
            alert('訂單成立！感謝您的購買。');
            
            // 更新 Navbar 
            if (typeof Auth !== 'undefined') Auth.updateCartCount();
        
            window.location.href = '../pages/cart.html';
            
        }, 1000);
    });

    renderCartList();
    updateCartBadge();
});