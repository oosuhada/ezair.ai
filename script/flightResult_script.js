// flightResult_script.js (revised)

document.addEventListener('DOMContentLoaded', () => {
  animateGraph();
  initializePassengerDropdown();

  const mql = window.matchMedia('(max-width: 768px)');
  mql.addListener(handleResponsive);
  handleResponsive(mql);
});

function handleResponsive(mql) {
  if (mql.matches) {
    initializeMobileFilter();
  } else {
    initializeDesktopFilterAndCalendar();
    initializeDesktopTabs();
  }
}

/** 그래프 애니메이션 */
function animateGraph() {
  document.querySelectorAll('.graph-bar').forEach((bar, i) => {
    setTimeout(() => bar.classList.add('is-animated'), i * 50);
  });
}

/** 탭 (왕복/편도/다구간) */
function initializeDesktopTabs() {
  const tabs = document.querySelectorAll('.search-widget .tab-buttons .trip-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

/** 인원/좌석 드롭다운 (공용) */
function initializePassengerDropdown() {
  // Find *all* passenger wrappers (desktop + mobile)
  document.querySelectorAll('.passenger-select-wrapper').forEach(wrapper => {
    const button   = wrapper.querySelector('button');
    const dropdown = wrapper.querySelector('.dropdown');  // use class, not ID

    if (!button || !dropdown) return;

    // toggle this wrapper’s dropdown
    button.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    // click outside closes it
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });

    // wire up the selects in *this* dropdown
    const count = dropdown.querySelector('#passenger-count');
    const seat  = dropdown.querySelector('#seat-class');

    function updateLabel() {
      button.textContent = `성인 ${count.value}명, ${seat.value}`;
    }

    if (count && seat) {
      count.addEventListener('change', updateLabel);
      seat.addEventListener('change',  updateLabel);
    }
  });
}


/** 모바일 전용 필터 펼침/닫힘 & 달력 */
function initializeMobileFilter() {
  const widget = document.querySelector('.mobile-filter-widget');
  if (!widget) return;
  widget.classList.remove('is-expanded');
  widget.querySelectorAll('.js-toggle-filter').forEach(btn =>
    btn.addEventListener('click', () =>
      widget.classList.toggle('is-expanded')
    )
  );
  widget.querySelectorAll('.calendar-container-mobile').forEach(container => {
    const label = container.querySelector('.calendar-label-mobile');
    const input = container.querySelector('.flatpickr-input-mobile');
    if (!label || !input || typeof flatpickr !== 'function') return;
    const picker = flatpickr(input, { dateFormat: 'm.d', disableMobile: true, static: true });
    container.addEventListener('click', e => {
      e.stopPropagation();
      picker.open();
    });
  });
}

/** 데스크탑 전용 필터 & 캘린더 */
function initializeDesktopFilterAndCalendar() {
  const searchWidget = document.querySelector('.search-widget');
  if (!searchWidget) return;

  // Filter open/close
  const expandBtn = searchWidget.querySelector('.expand-button');
  const applyBtn  = searchWidget.querySelector('.apply');
  if (expandBtn && applyBtn) {
    searchWidget.classList.remove('is-expanded');
    expandBtn.classList.remove('is-active');
    expandBtn.addEventListener('click', () => {
      searchWidget.classList.toggle('is-expanded');
      expandBtn.classList.toggle('is-active');
    });
    applyBtn.addEventListener('click', () => {
      searchWidget.classList.remove('is-expanded');
      expandBtn.classList.remove('is-active');
    });
  }

  // Desktop calendars (left AI + filter calendars)
  const containers = [
    ...document.querySelectorAll('.left_ai .calendar-container'),
    ...document.querySelectorAll('.search-widget .calendar-container3')
  ];
  containers.forEach(container => {
    const label = container.querySelector('.calendar-label, .calendar-label3');
    const input = container.querySelector('input.flatpickr-input, input.flatpickr-input3');
    if (!label || !input || typeof flatpickr !== 'function') return;
    const picker = flatpickr(input, {
      dateFormat: 'm-d',
      defaultDate: label.dataset.default || null,
      positionElement: label,
      disableMobile: true,
      onReady: (_, dateStr) => { if (dateStr) label.textContent = dateStr; },
      onChange: (_, dateStr) => { if (dateStr) label.textContent = dateStr; }
    });
    label.addEventListener('click', e => { e.stopPropagation(); picker.open(); });
  });
}
