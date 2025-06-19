document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to top functionality
    const topBtn = document.querySelector('.top-btn');
    if (topBtn) {
        topBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Basic click handlers for header buttons (console logs for demo)
    const loginButton = document.querySelector('.login-button');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            console.log('로그인 버튼 클릭됨!');
            // In a real app, this would trigger a login modal or page redirect.
            // alert('로그인 기능을 구현해야 합니다!'); // Using console.log instead of alert
        });
    }

    const menuButton = document.querySelector('.menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', () => {
            console.log('전체 메뉴 버튼 클릭됨!');
            // In a real app, this would open a side navigation or dropdown menu.
            // alert('전체 메뉴 기능을 구현해야 합니다!');
        });
    }

    const shareButton = document.querySelector('.share-btn');
    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            console.log('공유하기 버튼 클릭됨!');
            // In a real app, this would trigger a share dialog.
            // alert('공유하기 기능을 구현해야 합니다!');
            try {
                // Using document.execCommand('copy') as navigator.clipboard.writeText()
                // might not work in some iframe environments.
                const dummyElement = document.createElement('textarea');
                document.body.appendChild(dummyElement);
                dummyElement.value = window.location.href; // Or any content to share
                dummyElement.select();
                document.execCommand('copy');
                document.body.removeChild(dummyElement);
                console.log('페이지 URL이 클립보드에 복사되었습니다.');
                // You could show a custom message box here instead of alert.
            } catch (err) {
                console.error('클립보드 복사 실패:', err);
                // Fallback for sharing if clipboard fails
                // alert('공유 기능을 구현해야 합니다! (클립보드 복사 실패)');
            }
        });
    }


    // Function to handle toggle button active state
    const handleToggleButtons = (sectionSelector) => {
        const section = document.querySelector(sectionSelector);
        if (section) {
            const toggleButtons = section.querySelectorAll('.toggle-btn');
            toggleButtons.forEach(button => {
                button.addEventListener('click', () => {
                    toggleButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    console.log(`${sectionSelector} - ${button.dataset.target} 버튼 클릭됨!`);
                    // In a real app, this would trigger content filtering/loading.
                });
            });
        }
    };

    // Apply toggle logic to relevant sections
    handleToggleButtons('.preferred-hotels-section');
    handleToggleButtons('.party-hotels-section');
    handleToggleButtons('.pool-hotels-section');
    handleToggleButtons('.book-early-hotels-section');

    // Function to handle filter button active state
    const handleFilterButtons = (sectionSelector) => {
        const section = document.querySelector(sectionSelector);
        if (section) {
            const filterButtons = section.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // This logic assumes only one filter can be active at a time for this group.
                    // If multiple can be active, the logic would need to be adjusted.
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    console.log(`${sectionSelector} - ${button.dataset.filter} 필터 버튼 클릭됨!`);
                    // In a real app, this would trigger content filtering/loading based on filter.
                });
            });
        }
    };

    // Apply filter logic to relevant sections
    handleFilterButtons('.preferred-hotels-section');
    handleFilterButtons('.party-hotels-section');

    // Horizontal scroll arrow functionality
    document.querySelectorAll('.hotel-cards-container').forEach(container => {
        // Create left arrow
        const leftArrow = document.createElement('button');
        leftArrow.classList.add('scroll-arrow', 'left');
        leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
        container.parentNode.insertBefore(leftArrow, container); // Insert before the container

        // Create right arrow
        const rightArrow = document.createElement('button');
        rightArrow.classList.add('scroll-arrow', 'right');
        rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
        container.parentNode.insertBefore(rightArrow, container.nextSibling); // Insert after the container

        leftArrow.addEventListener('click', () => {
            container.scrollBy({
                left: -container.offsetWidth / 2, // Scroll half the container width
                behavior: 'smooth'
            });
        });

        rightArrow.addEventListener('click', () => {
            container.scrollBy({
                left: container.offsetWidth / 2, // Scroll half the container width
                behavior: 'smooth'
            });
        });

        // Show/hide arrows based on scroll position (optional but good UX)
        const checkScrollArrows = () => {
            // Only show arrows if content overflows
            const hasOverflow = container.scrollWidth > container.clientWidth;
            if (hasOverflow) {
                leftArrow.style.opacity = container.scrollLeft > 0 ? '1' : '0';
                rightArrow.style.opacity = container.scrollLeft < (container.scrollWidth - container.clientWidth) ? '1' : '0';
            } else {
                leftArrow.style.opacity = '0';
                rightArrow.style.opacity = '0';
            }
        };

        container.addEventListener('scroll', checkScrollArrows);
        window.addEventListener('resize', checkScrollArrows); // Check on resize
        checkScrollArrows(); // Initial check
    });
});
