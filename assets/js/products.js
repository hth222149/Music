document.addEventListener('DOMContentLoaded', () => {
    // 相關元件
    const modal = document.querySelector('.productModal');
    const cards = document.querySelectorAll('.card');
    const close = document.querySelector('.close');
    const modalImg = document.querySelector('.modalImg');
    const modalName = document.querySelector('.modalName');
    const modalPrice = document.querySelector('.modalPrice');
    const modalDesc = document.querySelector('.modalDesc');
    const addToCart = document.querySelector('.addToCart');
    const quantityInput = document.querySelector('.quantity');
    const buyNow = document.querySelector('.buyNow');
    const modalStarsContainer = document.querySelector('.modalStarsContainer');

    let currentProduct = {};

    function performAddToCart(buttonType) {
        if (typeof Auth !== 'undefined' && !Auth.isLoggedIn()) {
            if (buttonType === 'buy') {
                alert("請先登入才能進行下單購買！");
            } else {
                alert("請先登入才能將商品加入購物車！");
            }
            window.location.href = '../pages/Login.html';
            return false;
        }

        const qty = parseInt(quantityInput.value, 10);
        if (isNaN(qty) || qty < 1) {
            alert("請輸入正確的數量！");
            return false;
        }
        let cart = JSON.parse(localStorage.getItem('auraCart')) || [];
        
        // 利用名稱去尋找購物車內是否「已經存在相同商品」
        const existingItem = cart.find(item => item.name === currentProduct.name);
        
        if (existingItem) {
   
            existingItem.qty += qty;
        } else {

            const newItem = {
                id: Date.now().toString() + Math.random().toString().slice(-4), // 產生唯一ID
                name: currentProduct.name,
                price: parseInt(currentProduct.price.replace(/[^0-9]/g, ''), 10),
                qty: qty,
                img: currentProduct.imgSrc
            };
            cart.push(newItem);
        }

        localStorage.setItem('auraCart', JSON.stringify(cart));
        
        Auth.updateCartCount();
        if (typeof updateCartCount === 'function') updateCartCount();
        return true;
    }

    // 商品卡片點擊
    cards.forEach(card => {
        card.style.cursor = 'pointer'; 
        card.addEventListener('click', function(){
            const name = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            const imgSrc = card.querySelector('img').src;
            const desc = card.getAttribute('item-intro');
            const productUrl = card.getAttribute('item-url');
            const rating = parseFloat(card.getAttribute('item-rating')) || 0;
            
            currentProduct = { name, price, imgSrc };

            const goToDetailBtn = document.querySelector('.go-to-detail-btn');
            if (goToDetailBtn && productUrl) goToDetailBtn.href = productUrl; 

            // 星星與其他 
            let starHtml = '';
            for(let i = 0; i < Math.floor(rating); i++) starHtml += '<i class="fas fa-star"></i>';
            if (rating % 1 !== 0) starHtml += '<i class="fas fa-star-half-alt"></i>';

            modalName.innerText = name;
            modalPrice.innerText = price;
            modalDesc.innerText = desc;
            modalImg.src = imgSrc;
            quantityInput.value = 1; 

            if (modalStarsContainer) {
                modalStarsContainer.innerHTML = `<div class="fivestars"><div class="stars">${starHtml}</div><span class="starnum">${rating}</span></div>`;
            }
            modal.style.display = 'flex';
        });
    });

    close.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    addToCart.addEventListener('click', () => {
        if (performAddToCart('cart')) {
            alert(`已成功加入購物車！\n商品：${currentProduct.name}\n數量：${quantityInput.value} 個`);
            modal.style.display = 'none';
        }
    });

    buyNow.addEventListener('click', () => {
        if (performAddToCart('buy')) {
            window.location.href = '../pages/cart.html';
        }
    });

    const priceCheckboxes = document.querySelectorAll('input[name="price"]');
    const brandCheckboxes = document.querySelectorAll('input[name="brand"]');
    const gridCards = document.querySelectorAll('.product-grid .card');

    document.querySelectorAll('.sidebar input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });
    // search
    function filterProducts() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search') ? urlParams.get('search').trim().toLowerCase() : '';
        const selectedPrices = Array.from(priceCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedBrands = Array.from(brandCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        let visibleCount = 0;

        gridCards.forEach(card => {
            const cardName = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : '';
            const cardPrice = parseInt(card.getAttribute('item-price'), 10);
            const cardBrand = card.getAttribute('item-brand');
            const cardDesc = card.getAttribute('item-intro') ? card.getAttribute('item-intro').toLowerCase() : '';
            const searchMatch = searchQuery === '' || 
                                cardName.includes(searchQuery) || 
                                cardDesc.includes(searchQuery) || 
                                (cardBrand && cardBrand.toLowerCase().includes(searchQuery));
            const priceMatch = selectedPrices.length === 0 || selectedPrices.some(range => {
                if (range === '10000up' && cardPrice >= 10000) return true;
                if (range === '5000~10000' && cardPrice >= 5000 && cardPrice <= 10000) return true;
                if (range === 'under5000' && cardPrice <= 5000) return true;
                return false;
            });

            const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(cardBrand);
            if (searchMatch && priceMatch && brandMatch) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        let noResultMsg = document.getElementById('no-search-results-msg');
        const gridContainer = document.querySelector('.product-grid');
        
        if (visibleCount === 0) {
            if (!noResultMsg && gridContainer) {
                noResultMsg = document.createElement('div');
                noResultMsg.id = 'no-search-results-msg';
                noResultMsg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 50px 20px; color: #718096; font-size: 16px;';
                noResultMsg.innerHTML = `
                    <i class="fas fa-search-minus" style="font-size: 48px; margin-bottom: 15px; color: #cbd5e1;"></i>
                    <p>沒有找到符合條件的商品，換個關鍵字或篩選條件試試看吧！</p>
                `;
                gridContainer.appendChild(noResultMsg);
            }
        } else {
            if (noResultMsg) noResultMsg.remove();
        }
    }
    filterProducts();
});