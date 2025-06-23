document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup');
  const closePopup = document.getElementById('closePopup');

  // Show popup on page load if not closed recently
  const popupClosed = localStorage.getItem('popupClosed');
  if (!popupClosed || (Date.now() - popupClosed) > 7 * 24 * 60 * 60 * 1000) {
    popup.classList.remove('hidden');
  }

  // Close popup
  closePopup.addEventListener('click', () => {
    popup.classList.add('hidden');
    // Set localStorage to prevent popup for 7 days
    localStorage.setItem('popupClosed', Date.now());
  });
});