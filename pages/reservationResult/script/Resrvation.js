// script/Resrvation_script.js

document.addEventListener('DOMContentLoaded', () => {

    initTripTabs();
    initFlatpickr3();
});

const testBtn = document.querySelector('#passenger-btn');
if (testBtn) {
  testBtn.addEventListener('click', () => console.log('클릭됨'));
} else {
  console.warn('#passenger-btn 요소를 찾을 수 없습니다.');
}

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
  const seat = dropdown.querySelector('#seat-class');

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



document.addEventListener("DOMContentLoaded", function () {
  const polyline = document.querySelector(".data-line");

  if (!polyline) return;

  const originalPoints = polyline
    .getAttribute("points")
    .trim()
    .split("\n")
    .map((str) => {
      const [x, y] = str.trim().split(",").map(Number);
      return { x, y };
    });

  function animateZigZag() {
    const duration = 1500;
    const frameRate = 60;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const maxOffset = 50; // 더 큰 움직임
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const t = frame / totalFrames;
      const ease = Math.pow(1 - t, 2); // 끝으로 갈수록 줄어듦

      const newPoints = originalPoints.map((pt, i) => {
        const angle = (performance.now() / 1000) + i * 0.8;
        const offset = (Math.sin(angle) + Math.cos(angle * 1.5)) * maxOffset * ease;
        return `${pt.x},${pt.y + offset}`;
      });

      polyline.setAttribute("points", newPoints.join(" "));

      if (frame >= totalFrames) {
        const resetPoints = originalPoints.map((pt) => `${pt.x},${pt.y}`);
        polyline.setAttribute("points", resetPoints.join(" "));
        clearInterval(interval);
      }
    }, 1000 / frameRate);
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateZigZag();
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(polyline);
});

document.addEventListener('DOMContentLoaded', () => {
  // 버튼 내의 Lottie 컨테이너 가져오기
  const aiLoadingLottieContainer = document.getElementById('ai-loading-lottie');

  if (aiLoadingLottieContainer) {
    const lottieAnimation = lottie.loadAnimation({
      container: aiLoadingLottieContainer,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json'
    });

    lottieAnimation.addEventListener('DOMLoaded', () => {
      lottieAnimation.playSegments([90, 120], true);
    });
  } else {
    console.warn('#ai-loading-lottie 요소를 찾을 수 없습니다.');
  }
});