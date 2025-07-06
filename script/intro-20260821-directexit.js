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
        // 반시계 방향으로 짧고 빠르게 한 번 수행한다. loop가 끝난 뒤에는
        // 감속 없이 마지막 접선 속도를 유지하며 우측 하단으로 바로 빠져나간다.
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

        // 반시계 loop를 실제 타원식으로 생성한다. 소수의 수동 waypoint를 잇는
        // 방식보다 곡률 변화가 일정해 기체가 꺾이지 않고 한 번에 도는 느낌이 난다.
        const loopStartAngle = 135;
        const loopSteps = 14;
        const loopSegmentDuration = 0.10;
        const loopStartRad = loopStartAngle * Math.PI / 180;
        const loopStartX = loopCenterX + loopRadiusX * Math.cos(loopStartRad);
        const loopStartY = loopCenterY + loopRadiusY * Math.sin(loopStartRad);
        let previousLoopRotation = 124;
        const loopKeyframes = Array.from({ length: loopSteps }, (_, index) => {
            const angleDeg = loopStartAngle - ((index + 1) * 360 / loopSteps);
            const angle = angleDeg * Math.PI / 180;
            const x = loopCenterX + loopRadiusX * Math.cos(angle);
            const y = loopCenterY + loopRadiusY * Math.sin(angle);

            // 기수는 타원의 접선 방향을 따른다. 0deg가 위쪽을 향하는 원본
            // 비행기 이미지 기준이며, 회전값은 계속 감소시켜 반시계 방향을 유지한다.
            const tangentX = loopRadiusX * Math.sin(angle);
            const tangentY = -loopRadiusY * Math.cos(angle);
            let rotation = Math.atan2(tangentY, tangentX) * 180 / Math.PI + 90;
            while (rotation > previousLoopRotation) rotation -= 360;
            previousLoopRotation = rotation;

            return { x, y, rotation, duration: loopSegmentDuration, ease: "none" };
        });

        // loop 종료점에서 화면 밖 exit까지 직선으로 한 번에 연결한다.
        // 타원 둘레 / loop 시간으로 현재 속도를 추정해 exit 구간 duration을
        // 맞추면 loop 직후 속도가 갑자기 죽거나 다시 붙는 느낌이 사라진다.
        const perimeterA = 3 * (loopRadiusX + loopRadiusY);
        const perimeterB = Math.sqrt((3 * loopRadiusX + loopRadiusY) * (loopRadiusX + 3 * loopRadiusY));
        const loopPerimeter = Math.PI * (perimeterA - perimeterB);
        const loopSpeed = loopPerimeter / (loopSteps * loopSegmentDuration);
        const exitDistance = Math.hypot(exitX - loopStartX, exitY - loopStartY);
        const exitDuration = Math.max(0.82, Math.min(1.18, exitDistance / loopSpeed));
        let exitRotation = Math.atan2(exitY - loopStartY, exitX - loopStartX) * 180 / Math.PI + 90;
        while (exitRotation > previousLoopRotation + 180) exitRotation -= 360;
        while (exitRotation < previousLoopRotation - 180) exitRotation += 360;

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
                    { x: loopStartX, y: loopStartY, rotation: 124, duration: 0.46, ease: "power3.in" },

                    // 실제 타원식을 14구간으로 샘플링한 반시계 방향 loop.
                    ...loopKeyframes,

                    // 별도 감속 waypoint 없이 일정 속도로 화면 밖까지 직행한다.
                    { x: exitX, y: exitY, rotation: exitRotation, duration: exitDuration, ease: "none" }
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
