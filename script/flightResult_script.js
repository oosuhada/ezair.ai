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