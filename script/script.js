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
document.addEventListener('DOMContentLoaded', () => { // DOM이 로드된 후 스크립트 실행
    const searchInput = document.querySelector('.ai-input');
    const searchButton = document.querySelector('.ai-search-btn');
    const searchResultsDiv = document.getElementById('searchResults');

    // 검색 버튼 클릭 이벤트 리스너
    searchButton.addEventListener('click', performSearch);

    // Enter 키 입력 이벤트 리스너 (선택 사항이지만 편리함)
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const query = searchInput.value; // input 필드의 현재 value를 검색어로 사용

        if (!query.trim()) {
            searchResultsDiv.innerHTML = '<p>검색어를 입력해주세요.</p>';
            return;
        }

        searchResultsDiv.innerHTML = '<p>항공편을 검색 중입니다...</p>'; // 로딩 메시지

        try {
            const response = await fetch('/api/search-flights', { // 백엔드 API 엔드포인트
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ natural_language_query: query })
            });

            if (!response.ok) {
                // HTTP 오류 처리 (예: 404 Not Found, 500 Internal Server Error)
                const errorText = await response.text();
                throw new Error(`서버 오류 발생: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            if (data.gemini_response) {
                let displayHtml = `<p><strong>Gemini 응답:</strong> ${data.gemini_response}</p>`;

                if (data.flight_results && data.flight_results.length > 0) {
                    displayHtml += '<h3>검색된 항공편:</h3>';
                    displayHtml += '<ul>';
                    data.flight_results.forEach(flight => {
                        displayHtml += `<li>${flight.airline} - ${flight.departure_time} (${flight.origin}) &rarr; ${flight.arrival_time} (${flight.destination}) - <strong>${flight.price}원</strong></li>`;
                    });
                    displayHtml += '</ul>';
                } else if (!data.gemini_response.includes('찾을 수 없습니다')) {
                    // Gemini가 없다고 말하지 않았는데 결과 목록이 비어있을 경우 (더미 데이터 한계 등)
                    displayHtml += '<p>하지만 상세한 항공편 정보는 현재 없습니다.</p>';
                }
                searchResultsDiv.innerHTML = displayHtml;

            } else {
                searchResultsDiv.innerHTML = '<p>검색 결과를 가져오는 데 문제가 발생했습니다.</p>';
            }

        } catch (error) {
            console.error('검색 요청 중 오류 발생:', error);
            searchResultsDiv.innerHTML = `<p>검색 중 오류가 발생했습니다: ${error.message}</p>`;
        }
    }
});