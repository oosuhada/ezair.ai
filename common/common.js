// common.js

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (!header) {
        console.error('Header element not found.');
        return;
    }

    let lastScrollTop = 0;
    let scrollTimeout;
    const scrollThreshold = 100;

    // ★★★ 이 값을 조절하여 속도를 제어하세요 ★★★
    // 헤더가 숨겨지거나 나타나기까지 스크롤이 멈춰야 하는 시간 (밀리초 단위)
    const hideDelay = 500; // 스크롤 내릴 때, 0.5초 후 헤더 숨김 (기존 1000)
    const showDelay = 300; // 스크롤 올릴 때, 0.3초 후 헤더 나타남 (기존 1000)

    // --- Scroll-based animation ---
    window.addEventListener('scroll', () => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 진행 중인 타이머를 계속 취소
        clearTimeout(scrollTimeout);

        if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
            // 스크롤을 내릴 때
            // hideDelay(0.2초) 동안 추가 스크롤이 없으면 헤더를 숨깁니다.
            scrollTimeout = setTimeout(() => {
                header.classList.add('hidden');
                header.classList.remove('visible');
            }, hideDelay);
        } else if (currentScrollTop < lastScrollTop) {
            // 스크롤을 올릴 때
            // showDelay(0.1초) 동안 추가 스크롤이 없으면 헤더를 보이게 합니다.
            scrollTimeout = setTimeout(() => {
                header.classList.add('visible');
                header.classList.remove('hidden');
            }, showDelay);
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    });

    // --- 이하 수동 스윕(마우스 드래그) 애니메이션 코드는 동일 ---
    let isSweeping = false;
    let startY = 0;
    const sweepThreshold = 50;

    header.addEventListener('mousedown', (e) => {
        isSweeping = true;
        startY = e.clientY;
        header.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isSweeping) return;
        const deltaY = e.clientY - startY;
        if (deltaY < -sweepThreshold) {
            header.classList.add('hidden');
            header.classList.remove('visible');
            header.style.transition = '';
            isSweeping = false;
        } else if (deltaY > sweepThreshold) {
            header.classList.add('visible');
            header.classList.remove('hidden');
            header.style.transition = '';
            isSweeping = false;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isSweeping) {
            header.style.transition = '';
            isSweeping = false;
        }
    });

    header.addEventListener('mouseleave', () => {
        if (isSweeping) {
            header.style.transition = '';
            isSweeping = false;
        }
    });
});