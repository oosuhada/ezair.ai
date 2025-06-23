document.addEventListener('DOMContentLoaded', () => {
    // Function to handle horizontal scrolling for hotel cards
    const setupHorizontalScroll = (wrapperId) => {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;

        const container = wrapper.querySelector('.hotel-cards-container');
        const leftBtn = wrapper.querySelector('.left-btn');
        const rightBtn = wrapper.querySelector('.right-btn');
        const scrollAmount = 200; // Adjust scroll distance as needed

        const updateButtonVisibility = () => {
            if (!leftBtn || !rightBtn || !container) return;

            // Show/hide left button
            if (wrapper.scrollLeft <= 0) {
                leftBtn.classList.add('hidden');
            } else {
                leftBtn.classList.remove('hidden');
            }

            // Show/hide right button
            if (wrapper.scrollLeft + wrapper.clientWidth >= container.scrollWidth) {
                rightBtn.classList.add('hidden');
            } else {
                rightBtn.classList.remove('hidden');
            }
        };

        // Event listener for right scroll button
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }

        // Event listener for left scroll button
        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }

        // Update button visibility on scroll and resize
        wrapper.addEventListener('scroll', updateButtonVisibility);
        window.addEventListener('resize', updateButtonVisibility);

        // Initial check for button visibility
        updateButtonVisibility();
    };

    // Setup for each hotel scroll section
    setupHorizontalScroll('hotel-scroll-1');
    setupHorizontalScroll('hotel-scroll-2');


    // Function to handle the "오늘 하루 보지 않기" checkbox toggle
    const setupCheckboxToggle = (checkboxId) => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('click', () => {
                // Toggle between 'fa-regular fa-square' (unchecked) and 'fa-solid fa-square-check' (checked)
                if (checkbox.classList.contains('fa-square')) {
                    checkbox.classList.remove('fa-square');
                    checkbox.classList.add('fa-square-check');
                    checkbox.classList.add('text-primary-blue'); // Add a color to checked state
                } else {
                    checkbox.classList.remove('fa-square-check');
                    checkbox.classList.add('fa-square');
                    checkbox.classList.remove('text-primary-blue'); // Remove color
                }
            });
        }
    };

    // Setup for each checkbox
    setupCheckboxToggle('toggle-checkbox-1');
    setupCheckboxToggle('toggle-checkbox-2');

    // Smooth scroll to top when "맨위로" is clicked
    const backToTopBtn = document.querySelector('.footer-back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll animation
            });
        });
    }

    // Add basic hover effect for all interactive elements (buttons, links, cards)
    document.querySelectorAll('button, a, .filter-tag, .box-item, .hotel-card, .hotel-offer-card').forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
            element.style.transform = 'translateY(-2px)'; // Slight lift effect
            if (element.tagName === 'BUTTON' || element.classList.contains('hotel-card')) {
                element.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
            if (element.tagName === 'BUTTON' || element.classList.contains('hotel-card')) {
                element.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'; // Reset to original shadow
            }
        });
    });
});
