// script.js
document.addEventListener('DOMContentLoaded', function () {
    // 라디오 버튼 toggle 기능 (해외출장 / 직항만)
    function setupToggleRadio(id) {
        const radio = document.getElementById(id);
        let isChecked = false;

        radio.addEventListener('click', function () {
            if (isChecked) {
                radio.checked = false;
                isChecked = false;
            } else {
                isChecked = true;
            }
        });

        radio.addEventListener('change', function () {
            isChecked = radio.checked;
        });
    }

    setupToggleRadio('radio1'); // 해외출장입니다
    // setupToggleRadio('radio2'); // Direct flight radio is handled by api_integration.js now if needed

    // 왕복/편도/다구간 버튼 active
    const tripButtons = document.querySelectorAll('.trip-btn');

    tripButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tripButtons.forEach(b => b.classList.remove('active')); // 모두 비활성화
            btn.classList.add('active'); // 클릭된 버튼만 활성화
        });
    });

});

window.addEventListener('load', function () {
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
        spaceBetween: 20,
        grabCursor: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        freeMode: true
    });
    const bannerSwiper = new Swiper('.myBannerSwiper', {
        loop: true,
        autoplay: {
            delay: 4000,
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction'
        }
    });
});