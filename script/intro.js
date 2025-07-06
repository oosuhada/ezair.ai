// intro.js (sessionStorage를 사용한 최종 해결 버전)
document.addEventListener('DOMContentLoaded', function() {

    // 이제는 HTML에 직접 있으므로, 아래 코드만 필요
    const introAirplane = document.querySelector('.intro-airplane');
    if (introAirplane) {
        introAirplane.style.width = "70vw";      // CSS와 동일하게 vw 단위 사용
        introAirplane.style.height = "auto";     // 비율 유지
        introAirplane.style.left = "50%";        // 좌우 중앙 정렬
        introAirplane.style.top = "20%";         // 상단 20% (원하는 위치 조정)
        introAirplane.style.transform = "translateX(-50%)"; // 좌우 정중앙
        introAirplane.style.position = "absolute";          // 위치 지정
    }

    const mainContent = document.getElementById('mainContent');
    const introOverlay = document.getElementById('introOverlay');

    // 1. sessionStorage에서 'introShown' 값을 확인합니다.
    if (sessionStorage.getItem('introShown') === 'true') {
        // 값이 'true'이면, 이 탭에서 인트로를 본 적이 있는 것이므로 즉시 건너뜁니다.
        if (introOverlay) {
            introOverlay.remove();
        }
        gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
        return; // 스크립트 실행을 여기서 중단합니다.
    }

    // 2. 인트로를 본 적이 없다면, 애니메이션을 실행합니다.
    window.addEventListener('load', function() {
        startIntroAnimation();
    });

    function startIntroAnimation() {
        const airplaneWindow = document.getElementById('airplaneWindow');
        const windowInner = document.getElementById('windowInner');
        const aiInputBox = document.querySelector('.ai-input-box');
        const introAirplane = document.querySelector('.intro-airplane');

        if (typeof gsap === 'undefined') {
            console.error("Error: GSAP is not defined.");
            if (introOverlay) introOverlay.remove();
            gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
            return;
        }

        gsap.set(mainContent, { opacity: 0, visibility: 'hidden' });
        gsap.set([introOverlay, airplaneWindow], { opacity: 1 });
        gsap.set(airplaneWindow, { transformOrigin: "center center" });
        gsap.set(introAirplane, { transformOrigin: "center center" });

        // 좌측 상단 진입 → 중앙에서 한 번의 롤러코스터 loop → 좌측 하단 이탈
        // 기존 중앙 고정 loop처럼 보이던 경로를 제거하고 진행 방향을 유지한다.
        const startX = -window.innerWidth / 2 - 520;
        const startY = -window.innerHeight / 2 - 420;
        const loopRadiusX = Math.min(170, window.innerWidth * 0.13);
        const loopRadiusY = Math.min(140, window.innerHeight * 0.16);
        const exitX = -window.innerWidth / 2 - 520;
        const exitY = window.innerHeight / 2 + 420;

        let targetX = 0, targetY = 0, targetWidth = 300, targetHeight = 50, targetBorderRadius = '25px', targetBackgroundColor = '#ffffff', targetBoxShadow = '0 5px 15px rgba(0,0,0,0.1)', targetBorderColor = '#ffffff';

        if (aiInputBox) {
            const aiInputBoxRect = aiInputBox.getBoundingClientRect();
            const aiInputBoxComputedStyle = getComputedStyle(aiInputBox);
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;
            targetX = (aiInputBoxRect.left + scrollX + aiInputBoxRect.width / 2) - (window.innerWidth / 2);
            targetY = (aiInputBoxRect.top + scrollY + aiInputBoxRect.height / 2) - (window.innerHeight / 2);
            targetWidth = aiInputBoxRect.width;
            targetHeight = aiInputBoxRect.height;
            targetBorderRadius = aiInputBoxComputedStyle.borderRadius || '25px';
            targetBackgroundColor = aiInputBoxComputedStyle.backgroundColor || '#ffffff';
            targetBoxShadow = aiInputBoxComputedStyle.boxShadow || '0 5px 15px rgba(0,0,0,0.1)';
            targetBorderColor = targetBackgroundColor;
        } else {
            console.error("'.ai-input-box' not found. Using fallback values.");
            targetY = (window.innerHeight / 2) - 100;
        }

        const tl = gsap.timeline();

        // GSAP 타임라인 코드는 모두 동일
        tl.from(airplaneWindow, { duration: 2, scale: 0.3, rotation: 360, ease: "back.out(1.7)" });
        tl.to('.cloud', { duration: 1.2, opacity: 1, stagger: 0.4 }, "-=2");
        tl.fromTo(
            introAirplane,
            { x: startX, y: startY, rotation: 135, opacity: 1 },
            {
                keyframes: [
                    { x: -loopRadiusX * 2, y: -loopRadiusY * 1.5, rotation: 135, duration: 1.0, ease: "power2.out" },
                    { x: -loopRadiusX, y: -loopRadiusY, rotation: 160, duration: 0.45, ease: "sine.inOut" },
                    { x: 0, y: -loopRadiusY, rotation: 210, duration: 0.55, ease: "sine.inOut" },
                    { x: loopRadiusX, y: 0, rotation: 270, duration: 0.65, ease: "sine.inOut" },
                    { x: 0, y: loopRadiusY, rotation: 330, duration: 0.65, ease: "sine.inOut" },
                    { x: -loopRadiusX, y: 0, rotation: 390, duration: 0.65, ease: "sine.inOut" },
                    { x: 0, y: 0, rotation: 420, duration: 0.45, ease: "power1.inOut" },
                    { x: exitX, y: exitY, rotation: 405, duration: 1.25, ease: "power2.in" }
                ]
            },
            "-=3"
        );
        tl.set(introAirplane, { opacity: 0 });
        tl.to(windowInner, { duration: 1.5, opacity: 0, ease: "power2.inOut", onComplete: function() { windowInner.style.display = 'none'; } }, ">-0.5");
        tl.to(airplaneWindow, { duration: 1, x: targetX, y: targetY, width: targetWidth, height: targetHeight, borderRadius: targetBorderRadius, backgroundColor: targetBackgroundColor, borderColor: targetBorderColor, boxShadow: targetBoxShadow, ease: "power2.inOut" }, ">-0.7");
        tl.to(airplaneWindow, {
            duration: 1.2,
            ease: "power2.inOut",
            onStart: function () {
                if (aiInputBox) {
                    const placeholderText = "다음주 금요일 서울에서 제주도 가는 가장 저렴한 항공권 찾아줘";
                    airplaneWindow.innerHTML = `<div id="typing-wrapper" style="display: flex; align-items: center; height: 100%; font-size: 15px; color: var(--blk); background: var(--gray50); border-radius: ${targetBorderRadius}; padding: 0 20px; box-sizing: border-box; border: 1px solid var(--gray100);"><div id="typing-text" style="flex: 1; white-space: nowrap;"></div><div id="typing-btn" style="width: 38px; height: 38px;"></div></div>`;
                    lottie.loadAnimation({ container: document.getElementById('typing-btn'), renderer: 'svg', loop: true, autoplay: true, path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json' });
                    gsap.to("#typing-text", { duration: 2, text: placeholderText, ease: "none" });
                    gsap.to(introOverlay, { duration: 6, backgroundColor: 'rgba(0,0,0,0)', ease: "power2.inOut" });
                    gsap.to(mainContent, { duration: 6, opacity: 1, visibility: 'visible', ease: "power2.inOut" });
                }
            }
        }, "+=0.3");

        tl.to(introOverlay, {
            duration: 3.5,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: function() {
                if (introOverlay) introOverlay.remove();
                gsap.set(airplaneWindow, { zIndex: -1, pointerEvents: "none", clearProps: "all" });

                // 3. ★★★ 애니메이션이 모두 끝나면 'introShown' 값을 'true'로 저장합니다. ★★★
                sessionStorage.setItem('introShown', 'true');
            }
        }, "+=2");
    }
});
