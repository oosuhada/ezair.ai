// script.js
document.addEventListener('DOMContentLoaded', function () {
    // GSAP 플러그인 등록
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(TextPlugin); // Make sure TextPlugin is registered if used elsewhere

    // 라디오 버튼 toggle 기능 (해외출장 / 직항만)
    function setupToggleRadio(id) {
        const radio = document.getElementById(id);
        if (!radio) return;
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

    setupToggleRadio('radio1');
    setupToggleRadio('radio2'); // Make sure to setup for radio2 as well if needed

    // 왕복/편도/다구간 버튼 active
    const tripButtons = document.querySelectorAll('.trip-btn');
    tripButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tripButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- 애니메이션 로직 추가 ---

    // 1. AI 태그 롤링 애니메이션
    const wrapper = document.querySelector(".tag-wrapper"); // Changed to querySelector as ID "tagWrapper" was not in HTML
    if (wrapper) { // Ensure wrapper exists before proceeding
        const items = Array.from(wrapper.children);

        // tag-item을 2번 더 복제하여 총 3세트로 만듦
        for (let i = 0; i < 2; i++) {
            items.forEach(item => {
                wrapper.appendChild(item.cloneNode(true));
            });
        }

        // 애니메이션 시간 자동 계산 (선택)
        const durationPerItem = 2; // 초
        const totalItemCount = wrapper.children.length;
        const totalDuration = durationPerItem * totalItemCount;

        // Apply animation directly with GSAP if preferred for more control, or keep CSS animation.
        // For a CSS-based rolling animation, ensure your CSS has the @keyframes and animation properties.
        // If using GSAP for continuous rolling, it's a bit more complex, often involving xPercent.
        // For the current setup, assuming CSS animation will handle the continuous rolling.
    }


    // 2. 추천 항공편(.recommend) 카드 등장 애니메이션
    const recommendCards = gsap.utils.toArray(".recommend .swiper-slide");
    if (recommendCards.length > 0) {
        gsap.from(recommendCards, {
            scrollTrigger: {
                trigger: ".recommend",
                start: "top 80%",
                toggleActions: "play reverse play reverse", // Play on enter, reverse on leave, play on re-enter, reverse on re-leave
                // markers: true, // Uncomment for debugging ScrollTrigger
            },
            opacity: 0,
            y: 50,
            duration: 2,
            stagger: 0.1,
            ease: "power2.out"
        });
    }

    // 3. 테마별 여행지(.theme-travel) 카드 등장 애니메이션
    const themeCards = gsap.utils.toArray(".theme-travel .theme-card");
    if (themeCards.length > 0) {
        gsap.from(themeCards, {
            scrollTrigger: {
                trigger: ".theme-travel",
                start: "top 80%",
                toggleActions: "play reverse play reverse", // Play on enter, reverse on leave, play on re-enter, reverse on re-leave
                // markers: true, // Uncomment for debugging ScrollTrigger
            },
            opacity: 0,
            y: 50,
            duration: 2,
            stagger: .35,
            ease: "power2.out"
        });
    }

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