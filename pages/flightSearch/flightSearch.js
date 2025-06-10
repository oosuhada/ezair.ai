document.addEventListener('DOMContentLoaded', () => {
    // Carousel functionality for the main banner
    const carouselSlides = document.querySelectorAll('.banner-slide');
    const slideCounter = document.querySelector('.slide-counter');
    const leftArrow = document.querySelector('.left-arrow-circle');
    const rightArrow = document.querySelector('.right-arrow-circle');
    let currentSlide = 0;
    let autoSlideInterval;

    function showSlide(index) {
        carouselSlides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        slideCounter.textContent = `${index + 1} / ${carouselSlides.length}`;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % carouselSlides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
        showSlide(currentSlide);
    }

    function startAutoSlide() {
        // Clear any existing interval to prevent multiple intervals running
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
        autoSlideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    // Initialize carousel
    if (carouselSlides.length > 0) {
        showSlide(currentSlide);
        startAutoSlide(); // Start auto-sliding
    }

    // Event listeners for carousel arrows
    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            nextSlide();
            startAutoSlide(); // Restart auto-sliding after manual interaction
        });
    }

    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            prevSlide();
            startAutoSlide(); // Restart auto-sliding after manual interaction
        });
    }


    // Trip type selection (왕복, 편도, 다구간)
    const tripTypeButtons = document.querySelectorAll('.trip-type-button');
    tripTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            tripTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Recommendation tabs (항공편, 숙박)
    const recommendationTabs = document.querySelectorAll('.recommendation-tabs .tab-button');
    recommendationTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            recommendationTabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
            // In a real application, you'd load different content here
            console.log(`${tab.textContent.trim()} tab clicked`);
        });
    });

    // Optional: Smooth scrolling for "맨위로" (Scroll to top) button
    const scrollToTopButton = document.querySelector('.footer-button:last-child'); // Assuming "맨위로" is the last button
    if (scrollToTopButton) {
        scrollToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Dynamic adjustment for the AI Assistant Card for image placement
    // This part might need fine-tuning based on actual image loading and content
    const aiAssistantCard = document.querySelector('.ai-assistant-card');
    const cloudIcon = document.querySelector('.cloud-icon');
    if (aiAssistantCard && cloudIcon) {
        // Example: Adjust position of the cloud icon dynamically if it's an overlay
        // This is a placeholder; real adjustment would depend on the exact design intent
        const inputField = aiAssistantCard.querySelector('input[type="text"]');
        if (inputField) {
            // Position cloud icon relative to the input field or card
            // For now, it's positioned with CSS, but JS could be used for complex alignment
        }
    }
});