// script.js
document.addEventListener('DOMContentLoaded', function () {
    console.log("[Script.js] DOMContentLoaded fired. Initializing..."); // ✅ 추가된 로그

    // 라디오 버튼 toggle 기능 (해외출장 / 직항만)
    function setupToggleRadio(id) {
        const radio = document.getElementById(id);
        let isChecked = false;

        if (radio) { // null 체크 추가
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
        } else {
            console.warn(`[Script.js] Radio button with ID '${id}' not found.`);
        }
    }

    setupToggleRadio('radio1'); // 해외출장입니다
    // setupToggleRadio('radio2'); // Direct flight radio is handled by amadeus_search.js now if needed

    // 왕복/편도/다구간 버튼 active
    const tripButtons = document.querySelectorAll('.trip-btn');
    console.log("[Script.js] Trip buttons found:", tripButtons.length); // ✅ 추가된 로그

    tripButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log(`[Script.js] Trip button clicked: ${btn.textContent}`); // ✅ 추가된 로그
            tripButtons.forEach(b => b.classList.remove('active')); // 모두 비활성화
            btn.classList.add('active'); // 클릭된 버튼만 활성화
        });
    });

});

window.addEventListener('load', function () {
    console.log("[Script.js] Window loaded. Initializing Swiper."); // ✅ 추가된 로그
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
    console.log("[Script.js] Swiper initialized."); // ✅ 추가된 로그
});