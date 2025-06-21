document.addEventListener('DOMContentLoaded', function () {
  const calendarContainers = document.querySelectorAll('.calendar-container');

  const isMobile = window.innerWidth <= 768;

  calendarContainers.forEach(container => {
    const label = container.querySelector('.calendar-label');
    const input = container.querySelector('input');
    const defaultDate = label.dataset.default || null;

    const options = {
      dateFormat: "m-d",
      defaultDate,
      positionElement: label,
      onReady: (selectedDates, dateStr) => {
        if (dateStr) label.textContent = dateStr;
      },
      onChange: (selectedDates, dateStr) => {
        label.textContent = dateStr || label.getAttribute('data-placeholder');
      }
    };

    // 모바일일 경우에만 옵션을 추가합니다.
    if (isMobile) {
      options.static = true; // 달력을 화면 중앙에 고정
      options.disableMobile = true; // 모바일 전용 UI 대신 데스크탑용 UI 강제
    }

    const picker = flatpickr(input, options);

    label.addEventListener("click", e => {
      e.stopPropagation();
      picker.open();
    });
  });
  const calendarContainers3 = document.querySelectorAll('.calendar-container3');

  calendarContainers3.forEach(container => {
    const label = container.querySelector('.calendar-label3');
    const input = container.querySelector('.flatpickr-input3');
    const defaultDate = label.dataset.default || null;

    const picker = flatpickr(input, {
      dateFormat: "m-d",
      defaultDate: defaultDate,
      disableMobile: true,
      positionElement: label,
      onReady: (selectedDates, dateStr) => {
        if (dateStr) label.textContent = dateStr;
      },
      onChange: (selectedDates, dateStr) => {
        label.textContent = dateStr || label.getAttribute('data-default');
      }
    });
    label.addEventListener("click", e => {
      e.stopPropagation();
      picker.open();
    });
  });


  function animateGraph() {
    const graphBars = document.querySelectorAll('.graph-bar');
    graphBars.forEach((bar, index) => {
      setTimeout(() => {
        bar.classList.add('is-animated');
      }, index * 50);
    });
  }
  animateGraph();
  const searchWidget = document.querySelector('.search-widget');
  const expandButton = document.querySelector('.expand-button');
  expandButton.addEventListener('click', function () {
    searchWidget.classList.toggle('is-expanded');
    this.classList.toggle('is-active');
  });
  document.querySelector('.apply').addEventListener('click', () => {
    // 검색 위젯과 토글 버튼에서 열린 상태 클래스를 제거
    searchWidget.classList.remove('is-expanded');
    expandButton.classList.remove('is-active');
  });
});

document.addEventListener('DOMContentLoaded', () => {//검색탭
  const tabs = document.querySelectorAll('.tab-buttons .trip-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
})

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('passenger-btn');
  const dropdown = document.getElementById('passenger-dropdown');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  const selectCount = document.getElementById('passenger-count');
  const selectClass = document.getElementById('seat-class');
  function updateLabel() {
    btn.textContent = `성인 ${selectCount.value}명, ${selectClass.value}`;
  }
  selectCount.addEventListener('change', updateLabel);
  selectClass.addEventListener('change', updateLabel);
});

// --- 모바일 전용 필터 기능 연결 (최종 수정본) ---
document.addEventListener('DOMContentLoaded', () => {

  const mobileFilter = document.querySelector('.mobile-filter-widget');
  // 모바일 필터가 없는 페이지에서는 아무것도 실행하지 않음
  if (!mobileFilter) {
    return;
  }

  // --- 모바일 필터 펼침/닫힘 기능 (최종 수정본) ---
  document.addEventListener('DOMContentLoaded', function () {

    const mobileFilter = document.querySelector('.mobile-filter-widget');
    // 필터 위젯이 없으면 스크립트 실행을 중지합니다.
    if (!mobileFilter) {
      return;
    }

    // 필터 위젯 전체에 클릭 이벤트 리스너를 한 번만 등록합니다.
    mobileFilter.addEventListener('click', function (event) {

      // 클릭된 요소 또는 그 부모 중에 'js-toggle-filter' 클래스를 가진 버튼이 있는지 확인합니다.
      const toggleButton = event.target.closest('.js-toggle-filter');

      // 만약 그런 버튼이 있다면 (null이 아니라면)
      if (toggleButton) {
        // .is-expanded 클래스를 토글합니다.
        mobileFilter.classList.toggle('is-expanded');
      }
    });

    // --- 펼친 상태 내부의 다른 기능들은 여기에 계속 추가할 수 있습니다 ---

    // 예: 펼친 상태의 날짜 선택 기능
    const expandedView = mobileFilter.querySelector('.filter-expanded');
    const mobileDateLabels = expandedView.querySelectorAll('.calendar-label3');
    mobileDateLabels.forEach(label => {
      const input = label.nextElementSibling;
      if (input) {
        const picker = flatpickr(input, {
          dateFormat: "m-d",
          disableMobile: true,
          static: true, // 중앙 고정
        });
        // 라벨의 부모(날짜 선택 영역 전체)를 클릭하면 열리도록 수정
        label.closest('.calendar-container3').addEventListener("click", (e) => {
          e.stopPropagation();
          picker.open();
        });
      }
    });

    // 예: 펼친 상태의 인원 선택 기능
    const mobilePassengerBtn = document.getElementById('passenger-btn-mobile');
    const originalDropdown = document.getElementById('passenger-dropdown');
    if (mobilePassengerBtn && originalDropdown) {
      mobilePassengerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        originalDropdown.classList.toggle('show');
        document.body.classList.toggle('modal-open');
      });
    }
  })
})
 // --- 모바일 전용 필터 펼침/닫힘 기능 ---
document.addEventListener('DOMContentLoaded', function () {
    
    const mobileFilter = document.querySelector('.mobile-filter-widget');
    // HTML에 우리가 만든 모바일 필터가 없으면, 스크립트 실행을 중지합니다.
    if (!mobileFilter) {
        return;
    }

    // '변경' 버튼과 '닫기' 버튼 모두를 찾아냅니다.
    const toggleButtons = mobileFilter.querySelectorAll('.js-toggle-filter');

    toggleButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 버튼을 누를 때마다 부모 위젯에 .is-expanded 클래스를 추가하거나 제거합니다.
            mobileFilter.classList.toggle('is-expanded');
        });
    });
});