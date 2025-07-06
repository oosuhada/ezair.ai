// intro.js (sessionStorage를 사용한 최종 해결 버전)
document.addEventListener('DOMContentLoaded', function() {

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
        gsap.set(introAirplane, {
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "center center"
        });

        // 화면 중앙을 기준으로 실제 이동 궤적을 만든다.
        // 좌측 상단에서 천천히 진입한 뒤 loop 직전에 가속하고, 중앙 loop는
        // 반시계 방향으로 짧고 빠르게 한 번 수행한다. 이후 감속하면서 우측
        // 하단으로 빠져나간다.
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const airplaneWidth = introAirplane.getBoundingClientRect().width;
        const startX = -(viewportWidth / 2 + airplaneWidth * 0.58);
        const startY = -(viewportHeight / 2 + airplaneWidth * 0.36);
        const loopRadiusX = Math.min(260, Math.max(110, viewportWidth * 0.21));
        const loopRadiusY = Math.min(190, Math.max(105, viewportHeight * 0.24));
        const loopCenterX = Math.min(50, viewportWidth * 0.04);
        const loopCenterY = Math.min(30, viewportHeight * 0.04);
        const exitX = viewportWidth / 2 + airplaneWidth * 0.58;
        const exitY = viewportHeight / 2 + airplaneWidth * 0.42;

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
                    // 좌측 상단 진입은 여유 있게 보여주고 loop 직전에 속도를 붙인다.
                    { x: -viewportWidth * 0.31, y: -viewportHeight * 0.28, rotation: 135, duration: 1.0, ease: "power1.out" },
                    { x: loopCenterX - loopRadiusX * 0.70, y: loopCenterY + loopRadiusY * 0.72, rotation: 143, duration: 0.46, ease: "power3.in" },

                    // 이전 loop 진행 방향을 반대로 뒤집는다. 8개 원주 waypoint를
                    // 사용해 꺾인 오각형처럼 보이지 않고 한 번의 원형 회전으로 읽히게 한다.
                    { x: loopCenterX - loopRadiusX * 0.15, y: loopCenterY + loopRadiusY, rotation: 109, duration: 0.16, ease: "none" },
                    { x: loopCenterX + loopRadiusX * 0.55, y: loopCenterY + loopRadiusY * 0.82, rotation: 80, duration: 0.17, ease: "none" },
                    { x: loopCenterX + loopRadiusX, y: loopCenterY + loopRadiusY * 0.18, rotation: 47, duration: 0.17, ease: "none" },
                    { x: loopCenterX + loopRadiusX * 0.78, y: loopCenterY - loopRadiusY * 0.62, rotation: -22, duration: 0.17, ease: "none" },
                    { x: loopCenterX + loopRadiusX * 0.15, y: loopCenterY - loopRadiusY, rotation: -68, duration: 0.17, ease: "none" },
                    { x: loopCenterX - loopRadiusX * 0.55, y: loopCenterY - loopRadiusY * 0.82, rotation: -100, duration: 0.17, ease: "none" },
                    { x: loopCenterX - loopRadiusX, y: loopCenterY - loopRadiusY * 0.18, rotation: -133, duration: 0.17, ease: "none" },
                    { x: loopCenterX - loopRadiusX * 0.70, y: loopCenterY + loopRadiusY * 0.72, rotation: -207, duration: 0.17, ease: "none" },

                    // loop의 마지막 접선 방향을 그대로 살려 우측 하단으로 이어 붙인다.
                    // 속도는 첫 exit waypoint부터 순차적으로 줄어든다.
                    { x: viewportWidth * 0.20, y: viewportHeight * 0.28, rotation: -263, duration: 0.72, ease: "power3.out" },
                    { x: viewportWidth * 0.43, y: viewportHeight * 0.42, rotation: -251, duration: 0.96, ease: "power2.out" },
                    { x: exitX, y: exitY, rotation: -235, duration: 1.38, ease: "power1.out" }
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
