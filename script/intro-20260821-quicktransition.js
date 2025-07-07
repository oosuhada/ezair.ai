// Intro variant: preserve the airplane path, shorten only the post-flight handoff.
document.addEventListener('DOMContentLoaded', function() {

    const mainContent = document.getElementById('mainContent');
    const introOverlay = document.getElementById('introOverlay');

    if (sessionStorage.getItem('introShown') === 'true') {
        if (introOverlay) {
            introOverlay.remove();
        }
        gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
        return;
    }

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
            const tangentX = loopRadiusX * Math.sin(angle);
            const tangentY = -loopRadiusY * Math.cos(angle);
            let rotation = Math.atan2(tangentY, tangentX) * 180 / Math.PI + 90;
            while (rotation > previousLoopRotation) rotation -= 360;
            previousLoopRotation = rotation;

            return { x, y, rotation, duration: loopSegmentDuration, ease: "none" };
        });

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
        // The path geometry stays identical; a modest global speed-up keeps the
        // scroll-locked intro from feeling longer than the visual story needs.
        tl.timeScale(1.35);

        // Airplane entry / loop / exit geometry intentionally matches the approved version.
        tl.from(airplaneWindow, { duration: 2, scale: 0.3, rotation: 360, ease: "back.out(1.7)" });
        tl.to('.cloud', { duration: 1.2, opacity: 1, stagger: 0.4 }, "-=2");
        tl.fromTo(
            introAirplane,
            { x: startX, y: startY, rotation: 135, opacity: 1 },
            {
                keyframes: [
                    { x: -viewportWidth * 0.31, y: -viewportHeight * 0.28, rotation: 135, duration: 1.0, ease: "power1.out" },
                    { x: loopStartX, y: loopStartY, rotation: 124, duration: 0.46, ease: "power3.in" },
                    ...loopKeyframes,
                    { x: exitX, y: exitY, rotation: exitRotation, duration: exitDuration, ease: "none" }
                ]
            },
            "-=3"
        );
        tl.set(introAirplane, { opacity: 0 });

        // Shorten only the black-screen -> AI search handoff so scroll unlock arrives sooner.
        tl.to(windowInner, { duration: 0.65, opacity: 0, ease: "power2.inOut", onComplete: function() { windowInner.style.display = 'none'; } }, ">-0.32");
        tl.to(airplaneWindow, { duration: 0.52, x: targetX, y: targetY, width: targetWidth, height: targetHeight, borderRadius: targetBorderRadius, backgroundColor: targetBackgroundColor, borderColor: targetBorderColor, boxShadow: targetBoxShadow, ease: "power2.inOut" }, ">-0.32");
        tl.to(airplaneWindow, {
            duration: 0.70,
            ease: "power2.inOut",
            onStart: function () {
                if (aiInputBox) {
                    const placeholderText = "다음주 금요일 서울에서 제주도 가는 가장 저렴한 항공권 찾아줘";
                    airplaneWindow.innerHTML = `<div id="typing-wrapper" style="display: flex; align-items: center; height: 100%; font-size: 15px; color: var(--blk); background: var(--gray50); border-radius: ${targetBorderRadius}; padding: 0 20px; box-sizing: border-box; border: 1px solid var(--gray100);"><div id="typing-text" style="flex: 1; white-space: nowrap;"></div><div id="typing-btn" style="width: 38px; height: 38px;"></div></div>`;
                    lottie.loadAnimation({ container: document.getElementById('typing-btn'), renderer: 'svg', loop: true, autoplay: true, path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json' });
                    gsap.to("#typing-text", { duration: 0.90, text: placeholderText, ease: "none" });
                    gsap.to(introOverlay, { duration: 1.10, backgroundColor: 'rgba(0,0,0,0)', ease: "power2.inOut" });
                    gsap.to(mainContent, { duration: 1.10, opacity: 1, visibility: 'visible', ease: "power2.inOut" });
                }
            }
        }, "+=0.08");

        tl.to(introOverlay, {
            duration: 0.80,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: function() {
                if (introOverlay) introOverlay.remove();
                gsap.set(airplaneWindow, { zIndex: -1, pointerEvents: "none", clearProps: "all" });
                sessionStorage.setItem('introShown', 'true');
            }
        }, "+=0.12");
    }
});
