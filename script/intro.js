document.addEventListener('DOMContentLoaded', function() {
    // Inject intro overlay HTML dynamically with airplane image
    const introHTML = `
        <div class="intro-overlay" id="introOverlay" style="background-color: #000000;">
            <img class="intro-airplane" src="../../image/introairplane.png" alt="Intro Airplane">
            <div class="airplane-window-outer" id="airplaneWindow">
                <div class="video-overlay" id="windowInner">
                    <video autoplay muted loop playsinline>
                        <source src="./video/airplaneview.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <div class="clouds">
                        <div class="cloud cloud1"></div>
                        <div class="cloud cloud2"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', introHTML);

    window.addEventListener('load', function() {
        startIntroAnimation();
    });

    function startIntroAnimation() {
        const introOverlay = document.getElementById('introOverlay');
        const airplaneWindow = document.getElementById('airplaneWindow');
        const windowInner = document.getElementById('windowInner');
        const mainContent = document.getElementById('mainContent');
        const aiInputBox = document.querySelector('.ai-input-box');
        const introAirplane = document.querySelector('.intro-airplane');

        if (typeof gsap === 'undefined') {
            console.error("Error: GSAP is not defined.");
            introOverlay.style.display = 'none';
            introOverlay.remove();
            gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
            return;
        }

        // Initialize main content as hidden
        gsap.set(mainContent, { opacity: 0, visibility: 'hidden' });
        gsap.set([introOverlay, airplaneWindow], { opacity: 1 });
        gsap.set(airplaneWindow, { transformOrigin: "center center" });
        gsap.set(introAirplane, { transformOrigin: "center center" });

        // Calculate starting and ending positions for airplane
        const startX = -window.innerWidth / 2 - 1000; // Start outside top-left
        const startY = -window.innerHeight / 2 - 1000;
        const endX = window.innerWidth / 2 + 1000; // End outside bottom-right
        const endY = window.innerHeight / 2 + 1000;

        // Calculate target position and dimensions of the ai-input-box
        let targetX = 0;
        let targetY = 0;
        let targetWidth = 300;
        let targetHeight = 50;
        let targetBorderRadius = '25px';
        let targetBackgroundColor = '#ffffff';
        let targetBoxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        let targetBorderColor = '#ffffff';

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
            targetWidth = 300;
            targetHeight = 50;
            targetX = 0;
            targetY = (window.innerHeight / 2) - 100;
            targetBorderRadius = '25px';
        }

        const tl = gsap.timeline();

        // 1. Initial airplane window appearance with CSS border
        tl.from(airplaneWindow, {
            duration: 3,
            scale: 0.3,
            rotation: 360,
            ease: "back.out(1.7)"
        });

        // 2. Cloud animation with slight delay
        tl.to('.cloud', {
            duration: 1.2,
            opacity: 1,
            stagger: 0.4
        }, "-=2");

        // 3. Animate intro airplane flying from top-left to bottom-right at 135 degrees
        tl.fromTo(introAirplane, {
            x: startX,
            y: startY,
            rotation: 135,
            opacity: 1
        }, {
            x: endX,
            y: endY,
            duration: 5,
            ease: "power2.inOut"
        }, "-=3");

        // 비행기가 화면에서 벗어난 직후 갑자기 사라지게
        tl.set(introAirplane, {
            opacity: 0
        });

        // 4. Fade out video and clouds
        tl.to(windowInner, {
            duration: 1.5,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: function() {
                windowInner.style.display = 'none';
            }
        }, "-=1.5");

        // 5. Transform airplane window to chatbox (position, size, border, and background)
        tl.to(airplaneWindow, {
            duration: 2,
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            borderRadius: targetBorderRadius,
            backgroundColor: targetBackgroundColor,
            borderColor: targetBorderColor,
            boxShadow: targetBoxShadow,
            ease: "power2.inOut"
        }, "+=0.5");

        // 6. Inject and fade in chatbox content with introOverlay background transition and main content fade-in
        tl.to(airplaneWindow, {
            duration: 1.2,
            ease: "power2.inOut",
            onStart: function () {
                if (aiInputBox) {
                    const placeholderText = "다음주 금요일 서울에서 제주도 가는 가장 저렴한 항공권 찾아줘";

                    // 초기 셋업: 내부 콘텐츠 초기화
                    airplaneWindow.innerHTML = `
                        <div id="typing-wrapper" style="
                            display: flex;
                            align-items: center;
                            height: 100%;
                            font-size: 15px;
                            color: var(--blk);
                            background: var(--gray50);
                            border-radius: ${targetBorderRadius};
                            padding: 0 20px;
                            box-sizing: border-box;
                            border: 1px solid var(--gray100);
                        ">
                            <div id="typing-text" style="flex: 1; white-space: nowrap;"></div>
                            <div id="typing-btn" style="width: 38px; height: 38px;"></div>
                        </div>
                    `;

                    // Load Lottie animation
                    lottie.loadAnimation({
                        container: document.getElementById('typing-btn'), // the DOM element that will contain the animation
                        renderer: 'svg',
                        loop: true,
                        autoplay: true,
                        path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json' // the path to the animation json
                    });

                    // 타이핑 애니메이션과 동시에 introOverlay 배경색을 검정에서 투명으로 전환, 메인 콘텐츠 페이드인
                    gsap.to("#typing-text", {
                        duration: 4,
                        text: placeholderText,
                        ease: "none"
                    });

                    gsap.to(introOverlay, {
                        duration: 4,
                        backgroundColor: 'rgba(0,0,0,0)', // 투명 배경으로 전환
                        ease: "power2.inOut"
                    });

                    gsap.to(mainContent, {
                        duration: 4,
                        opacity: 1,
                        visibility: 'visible',
                        ease: "power2.inOut"
                    });
                }
            }
        }, "+=0.5");

        // 7. Fade out and remove the intro overlay
        tl.to(introOverlay, {
            duration: 2,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: function() {
                introOverlay.style.display = 'none';
                introOverlay.remove();
                gsap.set(airplaneWindow, {
                    zIndex: -1,
                    pointerEvents: "none",
                    clearProps: "all"
                });
            }
        }, "+=3");
    }
});