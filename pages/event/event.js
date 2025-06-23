document.addEventListener('DOMContentLoaded', () => {
    // Notification Toggle functionality
    const toggleSwitch = document.querySelector('.notification-toggle .toggle-switch');
    const switchHandle = document.querySelector('.notification-toggle .switch-handle');

    if (toggleSwitch && switchHandle) {
        let isToggled = false; // Initial state

        toggleSwitch.addEventListener('click', () => {
            isToggled = !isToggled;
            if (isToggled) {
                switchHandle.style.left = 'calc(100% - 15px - 3px)'; // Move to right (width of handle + left padding)
                toggleSwitch.style.backgroundColor = '#00C73C'; // Change background to green
            } else {
                switchHandle.style.left = '3px'; // Move to left
                toggleSwitch.style.backgroundColor = '#E9ECEF'; // Revert background
            }
        });
    }

    // Category button active state (example, could be dynamic with data)
    const categoryButtons = document.querySelectorAll('.event-categories .category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Sort option active state
    const sortOptions = document.querySelectorAll('.sort-options .sort-option');
    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            sortOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
});