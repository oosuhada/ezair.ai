document.addEventListener('DOMContentLoaded', function () {
    const calendarContainers = document.querySelectorAll('.calendar-container');
    calendarContainers.forEach(container => {
        const label = container.querySelector('.calendar-label');
        const input = container.querySelector('.flatpickr-input');  // 4. 각 input에 대해 별도의 Flatpickr 인스턴스를 생성합니다.
        const picker = flatpickr(input, {
            dateFormat: "Y-m-d",
            disableMobile: true,
            positionElement: label,
            onChange: function (selectedDates, dateStr, instance) {
                if (dateStr) {
                    label.textContent = dateStr;
                }
            }
        });
        label.addEventListener("click", (e) => {
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