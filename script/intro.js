// intro.js
// Ensure GSAP is loaded globally
document.addEventListener('DOMContentLoaded', function() {
    // Inject intro overlay HTML dynamically
    const introHTML = `
        <div class="intro-overlay" id="introOverlay">
            <div class="airplane-window" id="airplaneWindow">
                <div class="window-frame"></div>
                <div class="window-inner" id="windowInner">
                    <div class="video-background"></div>
                    <div class="clouds">
                        <div class="cloud cloud1"></div>
                        <div class="cloud cloud2"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', introHTML);

    // Wait for all assets to load before starting animation
    // Changed to window.onload for more robust asset loading check
    window.addEventListener('load', function() {
        startIntroAnimation();
    });

    function startIntroAnimation() {
        const introOverlay = document.getElementById('introOverlay');
        const airplaneWindow = document.getElementById('airplaneWindow');
        const windowInner = document.getElementById('windowInner');
        const mainContent = document.getElementById('mainContent');
        const aiInputBox = document.querySelector('.ai-input-box'); // Get the target element

        // Check if GSAP is available
        if (typeof gsap === 'undefined') {
            console.error("Error: GSAP is not defined.");
            introOverlay.style.display = 'none';
            introOverlay.remove();
            gsap.set(mainContent, { opacity: 1, visibility: 'visible' });
            return;
        }

        // Crucially, hide the main content initially
        gsap.set(mainContent, { opacity: 0, visibility: 'hidden' });
        // Ensure intro elements are visible initially for animation
        gsap.set([introOverlay, airplaneWindow], { opacity: 1 });
        // Set transformOrigin early for consistent transformations
        gsap.set(airplaneWindow, { transformOrigin: "center center" });

        const tl = gsap.timeline();

        // 1. Initial airplane window appearance
        tl.from(airplaneWindow, {
            duration: 2,
            scale: 0.3,
            rotation: 360,
            ease: "back.out(1.7)"
        });

        // 2. Cloud animation begins - 구름이 더 잘 보이도록 opacity를 1로 즉시 설정하고, 애니메이션 시작 시간을 조절
        tl.to('.cloud', {
            duration: 0.8, // 구름이 더 부드럽게 나타나도록 지속 시간 증가
            opacity: 1, // 구름이 완전히 보이도록 설정
            stagger: 0.3 // 구름이 약간의 시간차를 두고 나타나도록 조절
        }, "-=1.5"); // 이전 애니메이션이 끝나기 1.5초 전에 시작하여 구름이 더 빨리 보이기 시작함

        // Calculate target position and dimensions of the ai-input-box
        let targetX = 0;
        let targetY = 0;
        let targetWidth = 0;
        let targetHeight = 0;
        let targetBorderRadius = '25px'; // Default fallback
        let targetBackgroundColor = '#ffffff'; // Default background for ai-input-box
        let targetBoxShadow = '0 5px 15px rgba(0,0,0,0.1)'; // Default shadow for ai-input-box

        if (aiInputBox) {
            const aiInputBoxRect = aiInputBox.getBoundingClientRect();
            const aiInputBoxComputedStyle = getComputedStyle(aiInputBox);

            // Calculate the center of the airplane window (initial position, fixed to viewport center)
            // Since airplaneWindow is fixed and centered by the overlay, its initial position is relative to the viewport.
            // When using x/y for fixed elements, it's relative to their current fixed position.
            // So we need to calculate the difference from the current center to the target center.

            // Target center of the aiInputBox (relative to viewport)
            const targetBoxCenterX = aiInputBoxRect.left + (aiInputBoxRect.width / 2);
            const targetBoxCenterY = aiInputBoxRect.top + (aiInputBoxRect.height / 2);

            // Get current scroll position
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            // Calculate the translation needed for the airplane window's center to match the ai-input-box's center,
            // factoring in scroll position.
            // We need to move from the FIXED current center to the SCROLL-ADJUSTED target center.
            // The initial fixed position of airplaneWindow is implicitly (viewport.width/2 - window.width/2), (viewport.height/2 - window.height/2).
            // Its fixed position is handled by `intro-overlay` with `display: flex`, `align-items: center`, `justify-content: center`.
            // So, `initialWindowCenterX` and `initialWindowCenterY` are the dimensions of the window itself, not its viewport coordinates.
            // We need to translate it from its *current visual center* (which is the viewport center)
            // to the *target visual center* (which is aiInputBoxRect.left + scrollX + aiInputBoxRect.width / 2 etc.).
            // Therefore, the targetX and targetY are the absolute pixel difference from current viewport center.

            // The fixed element's (x, y) transform is relative to its *initial* fixed position.
            // So, if the element is centered, its initial (x,y) is 0,0.
            // We want to move it to `aiInputBoxRect.left` and `aiInputBoxRect.top` (viewport coordinates).
            // But since it's transforming its size as well, we need to consider the center.
            // Corrected logic: calculate the difference between the viewport center and the target's center.
            targetX = (aiInputBoxRect.left + scrollX + aiInputBoxRect.width / 2) - (window.innerWidth / 2);
            targetY = (aiInputBoxRect.top + scrollY + aiInputBoxRect.height / 2) - (window.innerHeight / 2);

            // Accurately calculate target dimensions including padding/border for a perfect overlay
            targetWidth = aiInputBoxRect.width;
            targetHeight = aiInputBoxRect.height;

            // Border radius
            targetBorderRadius = aiInputBoxComputedStyle.borderRadius;
            // Background color and box shadow of the ai-input-box (or its parent if the background is on parent)
            targetBackgroundColor = aiInputBoxComputedStyle.backgroundColor || '#ffffff';
            targetBoxShadow = aiInputBoxComputedStyle.boxShadow || 'none';


            console.log("Calculated Target - X:", targetX, "Y:", targetY, "Width:", targetWidth, "Height:", targetHeight, "BorderRadius:", targetBorderRadius);
        } else {
            console.error("'.ai-input-box' not found. Animation will not precisely target it. Ensure the element exists in your HTML.");
            // Fallback values if target not found (adjust as needed for a graceful degradation)
            targetWidth = 300;
            targetHeight = 50;
            targetX = 0; // Keep it centered horizontally for fallback
            targetY = (window.innerHeight / 2) - 100; // Move it up slightly
            targetBackgroundColor = '#ffffff';
            targetBoxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        }

        // 3. Fade out internal window content (clouds, video-background) and change airplane window background
        tl.to([windowInner, airplaneWindow], {
            duration: 1, // Increased duration for smoother transition
            opacity: 0.7, // Make it slightly transparent during the move
            backgroundColor: targetBackgroundColor, // Change background to match target
            boxShadow: targetBoxShadow, // Change shadow to match target
            ease: "power2.inOut"
        }, "+=0.5"); // Starts 0.5 second after previous animation ends

        // 4. Transform and move the airplane window to overlay the ai-input-box
        tl.to(airplaneWindow, {
            duration: 1.5, // Increased duration for smoother transition
            x: targetX,
            y: targetY,
            width: targetWidth,
            height: targetHeight,
            borderRadius: targetBorderRadius,
            opacity: 1, // Ensure it's fully opaque at the end
            ease: "power2.inOut",
            // onUpdate: () => console.log(`Current X: ${gsap.getProperty(airplaneWindow, "x")}, Y: ${gsap.getProperty(airplaneWindow, "y")}`)
        }, "<"); // Starts concurrently with the previous animation (fade out and bg change)

        // 5. Inject and fade in the search box content within the transformed window
        tl.to(windowInner, {
            duration: 0.8,
            opacity: 1,
            ease: "power2.inOut",
            onStart: function() {
                if (windowInner && aiInputBox) {
                    const aiInput = aiInputBox.querySelector('.ai-input');
                    const placeholderText = aiInput ? aiInput.getAttribute('placeholder') : '다음주 금요일 서울에서 제주도 가는 가장 저렴한 항공권 찾아줘';
                    const aiSearchBtn = aiInputBox.querySelector('.ai-search-btn');
                    const aiSearchBtnBg = aiSearchBtn ? getComputedStyle(aiSearchBtn).backgroundImage : 'none';

                    // Reconstruct the *visual* elements of ai-input-box
                    windowInner.innerHTML = `
                        <div style="
                            display: flex;
                            align-items: center;
                            height: 100%;
                            font-size: 15px;
                            color: var(--blk); /* Inherit from your CSS vars */
                            background: var(--gray50); /* Inherit from your CSS vars */
                            border-radius: var(--radius-pill); /* Inherit from your CSS vars */
                            padding: 0 20px; /* Match ai-input-box padding */
                            box-sizing: border-box; /* Crucial for width/height */
                            border: 1px solid var(--gray100); /* Match ai-input-box border */
                        ">
                            <input type="text" placeholder="${placeholderText}" style="
                                flex: 1;
                                border: none;
                                background: transparent;
                                font-size: 15px;
                                color: var(--blk);
                                outline: none;
                                padding: 0;
                            "/>
                            <button style="
                                width: 38px;
                                height: 38px;
                                border-radius: 50%;
                                background: ${aiSearchBtnBg}; /* Use the actual background of the button */
                                border: none;
                                margin-left: 10px;
                                cursor: pointer;
                                flex-shrink: 0;
                            "></button>
                        </div>
                    `;
                    // Ensure windowInner's internal positioning is reset to fill the parent and match border-radius
                    gsap.set(windowInner, {
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: targetBorderRadius,
                        overflow: 'hidden',
                        background: 'transparent' // Inner div handles the background now
                    });
                } else if (windowInner) {
                    // Fallback content if aiInputBox is not found
                    windowInner.innerHTML = `
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            height: 100%;
                            font-size: 16px;
                            color: #666;
                            background: white;
                            border-radius: ${targetBorderRadius};
                        ">
                            환영합니다! EZ AIR
                        </div>
                    `;
                }
            }
        }, "-=0.3"); // Starts slightly before the end of the transform

        // 6. Fade in the main content of the page
        tl.to(mainContent, {
            duration: 1,
            opacity: 1,
            visibility: 'visible',
            ease: "power2.inOut"
        }, "-=0.5"); // Starts slightly before the end of the window transform/text fade-in

        // 7. Fade out and remove the intro overlay, and clean up airplaneWindow's z-index/pointer-events
        // 메인 콘텐츠 페이드인 이후 오버레이가 사라지도록 타이밍 조절
        tl.to(introOverlay, {
            duration: 0.8,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: function() {
                introOverlay.style.display = 'none';
                introOverlay.remove(); // Clean up the DOM
                // Reset airplaneWindow properties so it doesn't interfere
                gsap.set(airplaneWindow, {
                    zIndex: -1, // Move it behind other content
                    pointerEvents: "none", // Make it unclickable
                    clearProps: "all" // Optional: remove all inline styles set by GSAP if you want to completely restore it
                });
            }
        }, "+=0.3"); // 메인 콘텐츠 페이드인 완료 후 0.3초 뒤에 시작하도록 변경
    }
});