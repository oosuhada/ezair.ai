(function () {
    const INTRO_SHOWN_KEY = 'introShown';
    const INTRO_COMPLETE_EVENT = 'ezair:intro-complete';
    const lockState = {
        active: false,
        scrollX: 0,
        scrollY: 0,
        scrollbarWidth: 0,
        body: {},
        html: {},
        observer: null,
        safetyTimer: null,
    };

    function preventScroll(event) {
        if (lockState.active) event.preventDefault();
    }

    function preventScrollKeys(event) {
        if (!lockState.active) return;
        const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
        if (keys.includes(event.key)) event.preventDefault();
    }

    function lockIntroScroll() {
        if (lockState.active || !document.body) return;

        const html = document.documentElement;
        const body = document.body;
        const computedBody = getComputedStyle(body);

        lockState.active = true;
        lockState.scrollX = window.scrollX || window.pageXOffset || 0;
        lockState.scrollY = window.scrollY || window.pageYOffset || 0;
        lockState.scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
        lockState.body = {
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            width: body.style.width,
            overflow: body.style.overflow,
            paddingRight: body.style.paddingRight,
            touchAction: body.style.touchAction,
            overscrollBehavior: body.style.overscrollBehavior,
        };
        lockState.html = {
            overflow: html.style.overflow,
            scrollBehavior: html.style.scrollBehavior,
            overscrollBehavior: html.style.overscrollBehavior,
        };

        html.style.overflow = 'hidden';
        html.style.scrollBehavior = 'auto';
        html.style.overscrollBehavior = 'none';
        body.style.position = 'fixed';
        body.style.top = `${-lockState.scrollY}px`;
        body.style.left = `${-lockState.scrollX}px`;
        body.style.width = '100%';
        body.style.overflow = 'hidden';
        body.style.touchAction = 'none';
        body.style.overscrollBehavior = 'none';

        if (lockState.scrollbarWidth > 0) {
            const currentPaddingRight = Number.parseFloat(computedBody.paddingRight) || 0;
            body.style.paddingRight = `${currentPaddingRight + lockState.scrollbarWidth}px`;
        }

        document.addEventListener('wheel', preventScroll, { passive: false, capture: true });
        document.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
        document.addEventListener('keydown', preventScrollKeys, { capture: true });
    }

    function releaseIntroScroll() {
        if (!lockState.active || !document.body) return;

        lockState.active = false;
        window.clearTimeout(lockState.safetyTimer);
        lockState.observer?.disconnect();

        document.removeEventListener('wheel', preventScroll, { capture: true });
        document.removeEventListener('touchmove', preventScroll, { capture: true });
        document.removeEventListener('keydown', preventScrollKeys, { capture: true });

        const html = document.documentElement;
        const body = document.body;
        Object.assign(body.style, lockState.body);
        html.style.overflow = lockState.html.overflow;
        html.style.overscrollBehavior = lockState.html.overscrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(lockState.scrollX, lockState.scrollY);

        requestAnimationFrame(() => {
            html.style.scrollBehavior = lockState.html.scrollBehavior;
        });
    }

    function forceIntroFallback(reason) {
        if (!lockState.active) return;
        console.warn(`[EZ AIR intro] ${reason}`);
        const overlay = document.getElementById('introOverlay');
        const mainContent = document.getElementById('mainContent');
        overlay?.remove();
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.visibility = 'visible';
        }
        sessionStorage.setItem(INTRO_SHOWN_KEY, 'true');
        releaseIntroScroll();
    }

    function installDefaultQueryFallback() {
        const aiInput = document.querySelector('.ai-input');
        const aiSearchBtn = document.querySelector('.ai-search-btn');
        if (!aiInput || !aiSearchBtn) return;

        const defaultQuery = aiInput.placeholder.trim();
        window.EZAIR_DEFAULT_AI_QUERY = defaultQuery;

        function fillDefaultQuery() {
            if (!aiInput.value.trim() && defaultQuery) aiInput.value = defaultQuery;
        }

        // Capture 단계에서 값을 채워 이전에 캐시된 ai_search.js가 로드되어도
        // 기존 click/Enter handler가 동일한 기본 query를 받도록 한다.
        aiSearchBtn.addEventListener('click', fillDefaultQuery, { capture: true });
        aiInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') fillDefaultQuery();
        }, { capture: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        installDefaultQueryFallback();

        if (sessionStorage.getItem(INTRO_SHOWN_KEY) === 'true') {
            releaseIntroScroll();
            return;
        }

        lockIntroScroll();
        document.addEventListener(INTRO_COMPLETE_EVENT, releaseIntroScroll, { once: true });

        lockState.observer = new MutationObserver(() => {
            if (!document.getElementById('introOverlay')) releaseIntroScroll();
        });
        lockState.observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('error', (event) => {
            if (String(event.filename || '').includes('intro-20260821-directexit.js')) {
                forceIntroFallback('intro script error fallback');
            }
        });

        lockState.safetyTimer = window.setTimeout(() => {
            forceIntroFallback('intro completion timeout fallback');
        }, 30000);
    });
})();
