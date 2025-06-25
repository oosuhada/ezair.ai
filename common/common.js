// common.js

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    const body = document.body; // body 요소 참조 추가
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

    // 헤더의 실제 계산된 높이를 가져오는 함수
    const getHeaderHeight = () => header.offsetHeight;


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
                // 헤더가 숨겨질 때 body 패딩을 다시 0으로 (또는 원래 콘텐츠 시작점)
                body.style.paddingTop = '0px'; // ★★★ 추가 ★★★
            }, hideDelay);
        } else if (currentScrollTop < lastScrollTop) {
            // 스크롤을 올릴 때
            // showDelay(0.1초) 동안 추가 스크롤이 없으면 헤더를 보이게 합니다.
            scrollTimeout = setTimeout(() => {
                header.classList.add('visible');
                header.classList.remove('hidden');
                // 헤더가 나타날 때 body 패딩을 헤더 높이만큼
                body.style.paddingTop = `${getHeaderHeight()}px`; // ★★★ 추가 ★★★
            }, showDelay);
        }
        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    });

    // 페이지 로드 시 초기 패딩 설정 (CSS에서 이미 설정했으나, JS에서도 안전하게 재확인)
    // 헤더의 초기 상태(visible)에 맞춰 패딩을 적용합니다.
    if (header && !header.classList.contains('hidden')) {
        body.style.paddingTop = `${getHeaderHeight()}px`;
    }

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
            body.style.paddingTop = '0px'; // ★★★ 추가 ★★★
            isSweeping = false;
        } else if (deltaY > sweepThreshold) {
            header.classList.add('visible');
            header.classList.remove('hidden');
            header.style.transition = '';
            body.style.paddingTop = `${getHeaderHeight()}px`; // ★★★ 추가 ★★★
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

    // window 리사이즈 이벤트 시 헤더 높이에 맞춰 body 패딩 재조정
    window.addEventListener('resize', () => {
        if (header && !header.classList.contains('hidden')) {
            body.style.paddingTop = `${getHeaderHeight()}px`;
        }
    });
});