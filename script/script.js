document.addEventListener('DOMContentLoaded', function () {
    // 가는 날 / 오는 날 flatpickr
    const departInput = document.getElementById('depart-calendar');
    const returnInput = document.getElementById('return-calendar');
    const departLabel = document.getElementById('depart-label');
    const returnLabel = document.getElementById('return-label');

    const departPicker = flatpickr(departInput, {
        dateFormat: "Y-m-d",
        disableMobile: true,
        allowInput: false,
        clickOpens: false,
        positionElement: departLabel,
        onChange: function (selectedDates, dateStr) {
            departLabel.textContent = dateStr || "가는 날";
        }
    });

    const returnPicker = flatpickr(returnInput, {
        dateFormat: "Y-m-d",
        disableMobile: true,
        allowInput: false,
        clickOpens: false,
        positionElement: returnLabel,
        onChange: function (selectedDates, dateStr) {
            returnLabel.textContent = dateStr || "오는 날";
        }
    });

    departLabel.addEventListener("click", () => departPicker.open());
    returnLabel.addEventListener("click", () => returnPicker.open());

    // 승객 수 / 좌석 선택
    const btn = document.getElementById('passenger-btn');
    const dropdown = document.getElementById('passenger-dropdown');
    const selectCount = document.getElementById('passenger-count');
    const selectClass = document.getElementById('seat-class');

    btn.addEventListener('click', () => {
        dropdown.classList.toggle('show');
    });

    selectCount.addEventListener('change', updateLabel);
    selectClass.addEventListener('change', updateLabel);

    function updateLabel() {
        const count = selectCount.value;
        const seat = selectClass.value;
        btn.textContent = `성인 ${count}명, ${seat}`;
    }

    document.addEventListener('click', function (e) {
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // 라디오 버튼 toggle 기능 (해외출장 / 직항만)
    function setupToggleRadio(id) {
        const radio = document.getElementById(id);
        let isChecked = false;

        radio.addEventListener('click', function () {
            if (isChecked) {
                radio.checked = false;
                isChecked = false;
            } else {
                isChecked = true;
            }
        });

        radio.addEventListener('change', function () {
            isChecked = radio.checked;
        });
    }

    setupToggleRadio('radio1'); // 해외출장입니다
    setupToggleRadio('radio2'); // 직항만

    // 왕복/편도/다구간 버튼 active
    const tripButtons = document.querySelectorAll('.trip-btn');

    tripButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tripButtons.forEach(b => b.classList.remove('active')); // 모두 비활성화
            btn.classList.add('active'); // 클릭된 버튼만 활성화
        });
    });

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
