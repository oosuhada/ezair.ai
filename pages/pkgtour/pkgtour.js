// pkgtour.js

// This file can be used for any interactive JavaScript functionality.
// For example, if you wanted to implement a dynamic carousel in the banner
// or handle search filter logic, you would add it here.

document.addEventListener('DOMContentLoaded', () => {
    console.log('pkgtour.js loaded and DOM is ready.');

    // Example: Add a simple click handler to the search button
    const searchButton = document.querySelector('button.bg-[#9362F5]');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            // In a real application, this would trigger a search API call
            // or filter the displayed products.
            console.log('Search button clicked!');
            // You could display a temporary message instead of an alert:
            // const messageBox = document.createElement('div');
            // messageBox.textContent = '검색 기능은 아직 구현되지 않았습니다.';
            // messageBox.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
            // document.body.appendChild(messageBox);
            // setTimeout(() => messageBox.remove(), 2000); // Remove after 2 seconds
        });
    }

    // Example: Add interactive functionality for the category scroll
    // This could involve dynamically adjusting scroll position or adding navigation arrows
    const categoryScrollContainer = document.querySelector('.flex.overflow-x-auto.space-x-6.py-4.scrollbar-hide');
    const scrollRightArrow = document.querySelector('.fa-chevron-right.ml-4');

    if (categoryScrollContainer && scrollRightArrow) {
        scrollRightArrow.addEventListener('click', () => {
            // Scroll by a certain amount (e.g., the width of the container)
            categoryScrollContainer.scrollBy({
                left: categoryScrollContainer.offsetWidth,
                behavior: 'smooth'
            });
        });
    }

    // More complex interactions (like tab switching for Domestic/Overseas packages)
    // would also be implemented here. For this refactor, the tabs are static
    // but the framework is in place.
});
// pkgtour.js

// This file can be used for any interactive JavaScript functionality.
// For example, if you wanted to implement a dynamic carousel in the banner
// or handle search filter logic, you would add it here.

document.addEventListener('DOMContentLoaded', () => {
    console.log('pkgtour.js loaded and DOM is ready.');

    // Example: Add a simple click handler to the search button
    const searchButton = document.querySelector('button.search-button'); // Updated selector
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            // In a real application, this would trigger a search API call
            // or filter the displayed products.
            console.log('Search button clicked!');
            // You could display a temporary message instead of an alert:
            // const messageBox = document.createElement('div');
            // messageBox.textContent = '검색 기능은 아직 구현되지 않았습니다.';
            // messageBox.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
            // document.body.appendChild(messageBox);
            // setTimeout(() => messageBox.remove(), 2000); // Remove after 2 seconds
        });
    }

    // Example: Add interactive functionality for the category scroll
    // This could involve dynamically adjusting scroll position or adding navigation arrows
    const categoryScrollContainer = document.querySelector('.category-list'); // Updated selector
    const scrollRightArrow = document.querySelector('.scroll-arrow'); // Updated selector

    if (categoryScrollContainer && scrollRightArrow) {
        scrollRightArrow.addEventListener('click', () => {
            // Scroll by a certain amount (e.g., the width of the container)
            categoryScrollContainer.scrollBy({
                left: categoryScrollContainer.offsetWidth,
                behavior: 'smooth'
            });
        });
    }

    // Example: Add tab switching logic for search tabs (Domestic/Overseas packages)
    const searchTabButtons = document.querySelectorAll('.search-tab-button');
    searchTabButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Remove 'active' class from all buttons
            searchTabButtons.forEach(btn => btn.classList.remove('search-tab-button-active'));
            // Add 'active' class to the clicked button
            event.target.classList.add('search-tab-button-active');
            // In a real application, this would trigger content changes
            console.log(`Tab changed to: ${event.target.textContent}`);
        });
    });

    // Example: Add tab switching logic for product category filters
    const filterButtons = document.querySelectorAll('.category-filter-buttons .filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            console.log(`Product filter changed to: ${event.target.textContent}`);
        });
    });
});
