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

window.addEventListener('load', function () {
    const swiper = new Swiper(".swiper", {
        slidesPerView: 'auto',
        spaceBetween: 16,
        grabCursor: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        
      
      
    });






    window.addEventListener('load', function () {
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: 4,
        spaceBetween: 20,
        grabCursor: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        freeMode: true
    });
    const bannerSwiper = new Swiper('.myBannerSwiper', {
        loop: true,
        autoplay: {
            delay: 4000,
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction'
        }
    });
});

    
    const bannerSwiper = new Swiper('.myBannerSwiper', {
        loop: true,
        autoplay: {
            delay: 4000,
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction'
        }

  
    });
});


<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>



