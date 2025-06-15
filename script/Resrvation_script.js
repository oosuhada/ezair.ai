// script/Resrvation_script.js

document.addEventListener('DOMContentLoaded', () => {
    initTripTabs();
    initPassengerDropdown();
    initFlatpickr3();
    initFlightCardToggles();
});

function initTripTabs() {
    document.querySelectorAll('.search-widget .trip-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.search-widget .trip-btn')
                .forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

function initPassengerDropdown() {
    const wrapper = document.querySelector('.passenger-select-wrapper');
    if (!wrapper) return;

    const btn = wrapper.querySelector('#passenger-btn');
    const dropdown = wrapper.querySelector('#passenger-dropdown');
    const count = dropdown.querySelector('#passenger-count');
    const seat  = dropdown.querySelector('#seat-class');

    btn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', e => {
        if (!wrapper.contains(e.target)) dropdown.classList.remove('show');
    });

    const updateLabel = () => {
        btn.textContent = `성인 ${count.value}명, ${seat.value}`;
    };
    count.addEventListener('change', updateLabel);
    seat.addEventListener('change', updateLabel);
}

function initFlatpickr3() {
    document.querySelectorAll('.calendar-container3').forEach(container => {
        const label = container.querySelector('.calendar-label3');
        const input = container.querySelector('input.flatpickr-input3');
        const defaultDate = label.dataset.default || null;

        const picker = flatpickr(input, {
            dateFormat: 'm-d',
            defaultDate,
            disableMobile: true,
            clickOpens: false,
            onReady: (_, dateStr) => {
                if (dateStr) label.textContent = dateStr;
            },
            onChange: (_, dateStr) => {
                if (dateStr) label.textContent = dateStr;
            }
        });

        label.addEventListener('click', e => {
            e.stopPropagation();
            picker.open();
        });
    });
}
// 아래 코드는 initFlightCardToggles() 대신 사용할 함수예요
function initFlightCardAppendDetails() {
  document.querySelectorAll('.flight-card').forEach(card => {
    const details = card.querySelector('.flight-card-details');
    const toggleBtns = card.querySelectorAll('.flight-card-toggle');
    let isAppended = false;

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();

        // 토글 상태
        const willOpen = btn.getAttribute('aria-expanded') === 'false';

        if (willOpen) {
          // card 바로 아래로 끄집어내서 붙인다
          card.insertAdjacentElement('afterend', details);
          details.classList.remove('hidden');
        } else {
          // 다시 카드 안으로 집어넣는다
          card.appendChild(details);
          details.classList.add('hidden');
        }

        // aria-expanded, 라벨 동기화
        toggleBtns.forEach(t => {
          t.setAttribute('aria-expanded', String(willOpen));
          t.querySelector('.flight-card-toggle-label').textContent =
            willOpen ? '간략하게 보기' : '여정 자세히 보기';
        });

        isAppended = willOpen;
      });
    });
  });
  const module = document.querySelector('.price-module');
  const toggle = module.querySelector('.toggle-btn');
  const details = module.querySelector('.price-details');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('.label').textContent = expanded
      ? '가격 추적 그래프 확인'
      : '간략하게 보기';
    details.classList.toggle('hidden', expanded);
  });
}

// 그리고 DOMContentLoaded 에서 이 함수를 호출해 주세요
document.addEventListener('DOMContentLoaded', () => {
  initTripTabs();
  initPassengerDropdown();
  initFlatpickr3();
  initFlightCardAppendDetails();  // ← 여기
});


window.addEventListener('load', function () {
    const swiper = new Swiper(".mySwiper", {
        slidesPerView: "auto",
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