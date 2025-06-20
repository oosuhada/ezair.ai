document.addEventListener('DOMContentLoaded', function () {
  const calendarContainers = document.querySelectorAll('.calendar-container');

  calendarContainers.forEach(container => {
    const label = container.querySelector('.calendar-label');
    const input = container.querySelector('input');
    const defaultDate = label.dataset.default || null;

    const picker = flatpickr(input, {
      dateFormat: "m-d",
      defaultDate,
      disableMobile: true,
      positionElement: label,
      onReady: (selectedDates, dateStr) => {
        if (dateStr) label.textContent = dateStr;
      },
      onChange: (selectedDates, dateStr) => {
        label.textContent = dateStr || label.getAttribute('data-placeholder');
      }
    });


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


document.addEventListener('DOMContentLoaded', function () {


});