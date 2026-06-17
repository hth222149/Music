$(document).ready(function() {

    //  商品類別下拉選單
    $('.category-toggle').click(function(e) {
        e.preventDefault();
        $('.dropdown-menu').slideToggle(300);
    });

    $(document).click(function(e) {
        if (!$(e.target).closest('.has-dropdown').length) {
            $('.dropdown-menu').slideUp(200);
        }
    });

    //  動態廣告輪播圖邏輯
    let items = $('.carousel-item');
    let currentIndex = 0;

    function showSlide(index) {
        items.removeClass('active');
        items.eq(index).addClass('active');
    }

    $('.next').click(function() {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    });

    $('.prev').click(function() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        showSlide(currentIndex);
    });

    let autoTimer = setInterval(function() {
        $('.next').click();
    }, 5000);

    $('.hero-carousel').hover(
        function() { clearInterval(autoTimer); },
        function() {
            autoTimer = setInterval(function() {
                $('.next').click();
            }, 5000);
        }
    );
    // 商品卡片點擊
    $('.product-card .detail').click(function() {
        const $card = $(this).closest('.card');
        const targetUrl = $card.attr('item-url');
        
        if (targetUrl) {
            window.location.href = targetUrl;
        } else {
            console.warn('找不到該商品的跳轉網址(item-url)');
        }
    });
});