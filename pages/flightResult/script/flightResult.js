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
        const button = wrapper.querySelector('button');
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
        const seat = dropdown.querySelector('#seat-class');

        function updateLabel() {
            button.textContent = `성인 ${count.value}명, ${seat.value}`;
        }

        if (count && seat) {
            count.addEventListener('change', updateLabel);
            seat.addEventListener('change', updateLabel);
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
    const applyBtn = searchWidget.querySelector('.apply');
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
/**
 * 기능: 모바일 전용 필터 펼침/닫힘 & 달력 (중앙 배치)
 */
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

        const picker = flatpickr(input, {
            dateFormat: 'm.d',
            disableMobile: true,
            static: true,
            appendTo: document.body,         // body 바로 아래에 달력 노드를 붙입니다
            onOpen: (selectedDates, dateStr, instance) => {
                const cal = instance.calendarContainer;
                // 화면 중앙 고정
                cal.style.position = 'fixed';
                cal.style.top = '50%';
                cal.style.left = '50%';
                cal.style.transform = 'translate(-50%, -50%)';
            }
        });

        // 레이블 클릭 시 달력 열기
        container.addEventListener('click', e => {
            e.stopPropagation();
            picker.open();
        });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const aiBtn = document.querySelector('.mf-ai-btn');
    const slidePanel = document.querySelector('.ai-slide-panel');

    if (aiBtn && slidePanel) {
        aiBtn.addEventListener('click', function () {
            slidePanel.classList.toggle('active');
        });
    }

    const filterBtns = document.querySelectorAll('.mf-slide-filters2 .mf-filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    const openBtn = document.querySelector(".mf-ai-btn");
    const dimmedOverlay = document.querySelector(".dimmed-overlay");

    // 열기
    openBtn.addEventListener("click", () => {
        slidePanel.classList.add("active");
        dimmedOverlay.classList.add("active");
    });

    // 딤드 누르면 닫기
    dimmedOverlay.addEventListener("click", () => {
        slidePanel.classList.remove("active");
        dimmedOverlay.classList.remove("active");
    });
});


window.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.flight-result-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // delay를 줘서 순차적 애니메이션
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, index * 150); // 순서에 따라 시간 차를 줌
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
  });

  cards.forEach(card => {
    observer.observe(card);
  });
});
