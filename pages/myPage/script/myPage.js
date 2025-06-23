
// myPage.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Scroll to top functionality
    const backToTopButton = document.querySelector('.back-to-top-button');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Optional: Hide/show back-to-top button based on scroll position
    window.addEventListener('scroll', () => {
        if (backToTopButton) {
            if (window.scrollY > 200) { // Show button after scrolling down 200px
                backToTopButton.style.display = 'flex';
            } else {
                backToTopButton.style.display = 'none';
            }
        }
    });

    // Optional: Toggle company details visibility in the footer
    const footerInfoToggle = document.querySelector('.footer-info-toggle');
    const companyDetails = document.querySelector('.company-details');
    const footerArrow = document.querySelector('.footer-info-toggle .footer-arrow');

    if (footerInfoToggle && companyDetails && footerArrow) {
        // Initial state: hidden on smaller screens, shown on desktop
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        companyDetails.style.display = isDesktop ? 'grid' : 'none';
        footerArrow.setAttribute('data-lucide', isDesktop ? 'chevron-up' : 'chevron-down');


        footerInfoToggle.addEventListener('click', () => {
            if (companyDetails.style.display === 'none' || companyDetails.style.display === '') {
                companyDetails.style.display = 'grid';
                footerArrow.setAttribute('data-lucide', 'chevron-up');
            } else {
                companyDetails.style.display = 'none';
                footerArrow.setAttribute('data-lucide', 'chevron-down');
            }
            lucide.createIcons(); // Re-create icons after changing data-lucide
        });

        // Listen for resize events to adjust visibility for desktop users who resize down
        window.addEventListener('resize', () => {
            const currentIsDesktop = window.matchMedia('(min-width: 1024px)').matches;
            if (currentIsDesktop && companyDetails.style.display === 'none') {
                 companyDetails.style.display = 'grid';
                 footerArrow.setAttribute('data-lucide', 'chevron-up');
                 lucide.createIcons();
            } else if (!currentIsDesktop && companyDetails.style.display === 'grid') {
                 // On smaller screens, if it was open, close it by default
                 companyDetails.style.display = 'none';
                 footerArrow.setAttribute('data-lucide', 'chevron-down');
                 lucide.createIcons();
            }
        });
    }
});
