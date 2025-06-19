// gemini_search.js

// 전역 변수로 Flatpickr 인스턴스를 선언 (필요하다면)
let departFlatpickrInstance;
let returnFlatpickrInstance;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded. Initializing scripts.");

    // --- Flatpickr 초기화 ---
    const departCalendarInput = document.getElementById('depart-calendar');
    const returnCalendarInput = document.getElementById('return-calendar');
    const departLabel = document.getElementById('depart-label');
    const returnLabel = document.getElementById('return-label');

    if (departCalendarInput && returnCalendarInput && typeof flatpickr !== 'undefined') {
        console.log("Flatpickr library is loaded. Initializing calendars.");

        // 가는 날 달력 초기화
        departFlatpickrInstance = flatpickr(departCalendarInput, {
            dateFormat: "Y.m.d", // 원하는 날짜 형식
            minDate: "today", // 오늘 이전 날짜 선택 불가
            onChange: function(selectedDates, dateStr, instance) {
                console.log("가는 날 선택됨:", dateStr);
                // 가는 날짜 선택 시, 오는 날짜의 최소 날짜를 설정
                if (selectedDates.length > 0 && returnFlatpickrInstance) {
                    returnFlatpickrInstance.set("minDate", selectedDates[0]);
                }
                if (dateStr) {
                    departLabel.textContent = dateStr;
                    departLabel.classList.add('selected'); // 선택 시 스타일 변경
                } else {
                    departLabel.textContent = '가는 날';
                    departLabel.classList.remove('selected');
                }
            }
        });

        // 오는 날 달력 초기화
        returnFlatpickrInstance = flatpickr(returnCalendarInput, {
            dateFormat: "Y.m.d", // 원하는 날짜 형식
            minDate: "today", // 오늘 이전 날짜 선택 불가
            onChange: function(selectedDates, dateStr, instance) {
                console.log("오는 날 선택됨:", dateStr);
                // 오는 날짜 선택 시, 가는 날짜의 최대 날짜를 설정 (선택 사항)
                if (selectedDates.length > 0 && departFlatpickrInstance) {
                    departFlatpickrInstance.set("maxDate", selectedDates[0]);
                }
                if (dateStr) {
                    returnLabel.textContent = dateStr;
                    returnLabel.classList.add('selected'); // 선택 시 스타일 변경
                } else {
                    returnLabel.textContent = '오는 날';
                    returnLabel.classList.remove('selected');
                }
            }
        });

        console.log("Flatpickr instances initialized:", departFlatpickrInstance, returnFlatpickrInstance);

    } else {
        console.error("Flatpickr library or calendar inputs not found. Cannot initialize calendars.");
    }

    // --- 왕복/편도/다구간 버튼 로직 ---
    const tripButtons = document.querySelectorAll('.trip-btn');
    const returnCalendarContainer = document.getElementById('return-calendar').closest('.calendar-container').querySelector('#return-label').parentNode; // 오는 날 전체 컨테이너

    tripButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log(`Trip button clicked: ${this.textContent}`);
            tripButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            if (this.textContent === '편도') {
                returnCalendarContainer.style.display = 'none'; // 오는 날 숨기기
                if (returnFlatpickrInstance) {
                    returnFlatpickrInstance.clear(); // 편도 선택 시 오는 날짜 초기화
                }
                returnLabel.textContent = '오는 날';
                returnLabel.classList.remove('selected');
                console.log("편도 선택: 오는 날 필드 숨김.");
            } else {
                returnCalendarContainer.style.display = 'block'; // 왕복/다구간 시 오는 날 보이기
                console.log("왕복/다구간 선택: 오는 날 필드 표시.");
            }
        });
    });

    // --- 출발지/도착지 자동완성 (예시, 실제 데이터 필요) ---
    const airportData = [
        { code: 'ICN', name: '인천국제공항', city: '서울' },
        { code: 'GMP', name: '김포국제공항', city: '서울' },
        { code: 'CJU', name: '제주국제공항', city: '제주' },
        { code: 'PUS', name: '김해국제공항', city: '부산' },
        { code: 'HSG', name: '사가공항', city: '사가' },
        // 더 많은 공항 데이터 추가
    ];

    function setupAirportAutocomplete(inputElementId, suggestionsDropdownId) {
        const input = document.getElementById(inputElementId);
        const dropdown = document.getElementById(suggestionsDropdownId);

        if (!input || !dropdown) {
            console.warn(`Autocomplete elements not found for ID: ${inputElementId}`);
            return;
        }

        input.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            dropdown.innerHTML = '';
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            const filteredAirports = airportData.filter(airport =>
                airport.name.toLowerCase().includes(query) ||
                airport.code.toLowerCase().includes(query) ||
                airport.city.toLowerCase().includes(query)
            );

            if (filteredAirports.length > 0) {
                filteredAirports.forEach(airport => {
                    const div = document.createElement('div');
                    div.classList.add('suggestion-item');
                    div.textContent = `${airport.name} (${airport.code}) - ${airport.city}`;
                    div.addEventListener('click', () => {
                        input.value = `${airport.city} (${airport.code})`;
                        dropdown.style.display = 'none';
                        console.log(`선택된 공항: ${airport.name}`);
                    });
                    dropdown.appendChild(div);
                });
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        });

        // 입력 필드에서 포커스를 잃었을 때 드롭다운 숨기기 (약간의 딜레이를 주어 클릭 이벤트 처리)
        input.addEventListener('blur', () => {
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 100);
        });

        // 드롭다운 클릭 시 blur 이벤트로 인한 숨김 방지
        dropdown.addEventListener('mousedown', (e) => {
            e.preventDefault(); // 기본 blur 동작 방지
        });
    }

    setupAirportAutocomplete('origin-input', 'origin-suggestions');
    setupAirportAutocomplete('destination-input', 'destination-suggestions');
    console.log("Airport autocomplete setup completed.");

    // --- 출발지/도착지 스왑 버튼 ---
    const swapBtn = document.querySelector('.swap-btn');
    if (swapBtn) {
        swapBtn.addEventListener('click', function() {
            const originInput = document.getElementById('origin-input');
            const destinationInput = document.getElementById('destination-input');
            const temp = originInput.value;
            originInput.value = destinationInput.value;
            destinationInput.value = temp;
            console.log("출발지와 도착지 스왑됨.");
        });
    } else {
        console.warn("Swap button not found.");
    }

    // --- 승객 및 좌석 등급 선택 드롭다운 ---
    const passengerBtn = document.getElementById('passenger-btn');
    const passengerDropdown = document.getElementById('passenger-dropdown');
    const passengerCountSelect = document.getElementById('passenger-count');
    const seatClassSelect = document.getElementById('seat-class');

    if (passengerBtn && passengerDropdown && passengerCountSelect && seatClassSelect) {
        passengerBtn.addEventListener('click', function(event) {
            passengerDropdown.style.display = passengerDropdown.style.display === 'block' ? 'none' : 'block';
            event.stopPropagation(); // 버튼 클릭 시 문서 전체 클릭 이벤트 방지
            console.log("승객/좌석 등급 드롭다운 토글됨.");
        });

        // 문서의 다른 곳을 클릭하면 드롭다운 닫기
        document.addEventListener('click', function(event) {
            if (!passengerDropdown.contains(event.target) && !passengerBtn.contains(event.target)) {
                passengerDropdown.style.display = 'none';
            }
        });

        // 선택값 변경 시 버튼 텍스트 업데이트
        function updatePassengerBtnText() {
            const count = passengerCountSelect.value;
            const seatClass = seatClassSelect.options[seatClassSelect.selectedIndex].text;
            passengerBtn.textContent = `성인 ${count}명, ${seatClass}`;
            console.log(`승객 정보 업데이트: 성인 ${count}명, ${seatClass}`);
        }

        passengerCountSelect.addEventListener('change', updatePassengerBtnText);
        seatClassSelect.addEventListener('change', updatePassengerBtnText);

        updatePassengerBtnText(); // 초기 로드 시 버튼 텍스트 설정
        console.log("승객/좌석 등급 선택 기능 설정됨.");
    } else {
        console.warn("Passenger selection elements not found.");
    }

    // --- 검색 버튼 ---
    const searchFlightsBtn = document.getElementById('search-flights-btn');
    if (searchFlightsBtn) {
        searchFlightsBtn.addEventListener('click', function() {
            const origin = document.getElementById('origin-input').value;
            const destination = document.getElementById('destination-input').value;
            const departDate = departFlatpickrInstance.selectedDates[0] ? departFlatpickrInstance.formatDate(departFlatpickrInstance.selectedDates[0], "Y-m-d") : '';
            const returnDate = returnFlatpickrInstance.selectedDates[0] ? returnFlatpickrInstance.formatDate(returnFlatpickrInstance.selectedDates[0], "Y-m-d") : '';
            const passengers = document.getElementById('passenger-count').value;
            const seatClass = document.getElementById('seat-class').value;
            const directFlightOnly = document.getElementById('radio2').checked;

            console.log("항공권 검색 요청:");
            console.log("출발지:", origin);
            console.log("도착지:", destination);
            console.log("가는 날:", departDate);
            console.log("오는 날:", returnDate);
            console.log("인원:", passengers);
            console.log("좌석 등급:", seatClass);
            console.log("직항만:", directFlightOnly);

            // 여기에 실제 항공권 검색 API 호출 로직 추가 (amadeus_search.js 등에서 처리될 것으로 예상)
            // 예: triggerAmadeusSearch(origin, destination, departDate, returnDate, passengers, seatClass, directFlightOnly);
            // 결과를 'flight-results' 섹션에 표시하는 로직이 필요합니다.
            const flightResultsSection = document.getElementById('flight-results-section');
            const flightResultsDiv = document.getElementById('flight-results');
            const noResultsMessage = document.getElementById('no-results-message');

            if (origin && destination && departDate) {
                // 실제 검색 로직은 amadeus_search.js 또는 별도 함수에서 호출
                // 여기서는 예시로 결과를 표시하는 부분만 보여줍니다.
                flightResultsSection.style.display = 'block';
                flightResultsDiv.innerHTML = `<p><strong>${origin} → ${destination}</strong> (${departDate}${returnDate ? ` - ${returnDate}` : ''}) ${passengers}명, ${seatClass} 검색 중...</p>`;
                noResultsMessage.style.display = 'none';

                // 임시로 결과 표시
                setTimeout(() => {
                    flightResultsDiv.innerHTML = `
                        <div class="flight-item">
                            <h3>대한항공 KE1234</h3>
                            <p>출발: ${origin} ${departDate} 10:00</p>
                            <p>도착: ${destination} ${departDate} 12:00</p>
                            <p>가격: ₩250,000</p>
                        </div>
                        <div class="flight-item">
                            <h3>아시아나 OZ5678</h3>
                            <p>출발: ${origin} ${departDate} 11:30</p>
                            <p>도착: ${destination} ${departDate} 13:30</p>
                            <p>가격: ₩230,000</p>
                        </div>
                    `;
                    console.log("항공권 검색 결과 표시 완료.");
                }, 1500);

            } else {
                console.warn("필수 검색 정보가 부족합니다 (출발지, 도착지, 가는 날).");
                flightResultsSection.style.display = 'block';
                noResultsMessage.style.display = 'block';
                flightResultsDiv.innerHTML = ''; // 기존 결과 지우기
            }
        });
    } else {
        console.warn("Search flights button not found.");
    }


    // --- AI 항공권 어시스턴트 모달 로직 (gemini_search.js의 주요 기능일 수 있음) ---
    const aiInput = document.querySelector('.ai-input');
    const aiSearchBtn = document.querySelector('.ai-search-btn');
    const aiResultsModal = document.getElementById('ai-results-modal');
    const closeModalBtn = aiResultsModal ? aiResultsModal.querySelector('.close-button') : null;
    const modalFlightResults = document.getElementById('modal-flight-results');
    const aiAdditionalRecommendation = document.getElementById('ai-additional-recommendation');

    if (aiInput && aiSearchBtn && aiResultsModal && closeModalBtn && modalFlightResults && aiAdditionalRecommendation) {
        aiSearchBtn.addEventListener('click', async function() {
            const query = aiInput.value.trim();
            if (query) {
                console.log("AI 항공권 검색 쿼리:", query);
                modalFlightResults.innerHTML = '<p>AI 어시스턴트가 항공편 정보를 분석 중입니다...</p>';
                aiAdditionalRecommendation.textContent = ''; // 이전 추천 초기화
                aiResultsModal.style.display = 'block';

                try {
                    // 여기에 Gemini API 호출 로직을 넣으세요.
                    // 현재는 더미 데이터로 응답을 시뮬레이션합니다.
                    const simulatedResponse = await simulateGeminiResponse(query);
                    console.log("Gemini 시뮬레이션 응답:", simulatedResponse);

                    if (simulatedResponse.flights && simulatedResponse.flights.length > 0) {
                        modalFlightResults.innerHTML = simulatedResponse.flights.map(flight => `
                            <div class="flight-item">
                                <h3>${flight.airline} ${flight.flightNumber}</h3>
                                <p>출발: ${flight.origin} (${flight.departDate}) ${flight.departTime}</p>
                                <p>도착: ${flight.destination} (${flight.arriveDate}) ${flight.arriveTime}</p>
                                <p>가격: ₩${flight.price.toLocaleString()}</p>
                                ${flight.stops > 0 ? `<p>경유: ${flight.stops}회</p>` : '<p>직항</p>'}
                            </div>
                        `).join('');
                    } else {
                        modalFlightResults.innerHTML = '<p>AI 어시스턴트가 요청하신 조건에 맞는 항공편을 찾을 수 없습니다.</p>';
                    }

                    if (simulatedResponse.recommendation) {
                        aiAdditionalRecommendation.textContent = simulatedResponse.recommendation;
                    }

                } catch (error) {
                    console.error("AI 항공권 검색 중 오류 발생:", error);
                    modalFlightResults.innerHTML = '<p>AI 항공권 검색 중 오류가 발생했습니다. 다시 시도해 주세요.</p>';
                }

            } else {
                console.warn("AI 검색 쿼리를 입력해주세요.");
            }
        });

        closeModalBtn.addEventListener('click', function() {
            aiResultsModal.style.display = 'none';
            console.log("AI 검색 모달 닫힘.");
        });

        window.addEventListener('click', function(event) {
            if (event.target == aiResultsModal) {
                aiResultsModal.style.display = 'none';
                console.log("모달 외부 클릭으로 AI 검색 모달 닫힘.");
            }
        });
        console.log("AI 항공권 어시스턴트 기능 설정됨.");
    } else {
        console.warn("AI assistant elements not found.");
    }

    // --- Gemini 시뮬레이션 함수 (실제 API 호출로 대체 필요) ---
    async function simulateGeminiResponse(query) {
        console.log("시뮬레이션: Gemini 응답 생성 중 for query:", query);
        return new Promise(resolve => {
            setTimeout(() => {
                let flights = [];
                let recommendation = "현재 추천할 만한 추가 정보가 없습니다.";

                if (query.includes("서울에서 제주도") && query.includes("다음주 금요일")) {
                    flights = [
                        { airline: "티웨이항공", flightNumber: "TW101", origin: "서울(GMP)", destination: "제주(CJU)", departDate: "2025-06-27", departTime: "09:00", arriveDate: "2025-06-27", arriveTime: "10:10", price: 55000, stops: 0 },
                        { airline: "제주항공", flightNumber: "7C202", origin: "서울(GMP)", destination: "제주(CJU)", departDate: "2025-06-27", departTime: "10:30", arriveDate: "2025-06-27", arriveTime: "11:40", price: 62000, stops: 0 }
                    ];
                    recommendation = "다음 주 금요일 제주도 항공권은 지금이 구매 적기이며, 오전 시간대 항공편이 인기가 많습니다.";
                } else if (query.includes("가장 저렴한")) {
                     flights = [
                        { airline: "에어부산", flightNumber: "BX303", origin: "서울(GMP)", destination: "부산(PUS)", departDate: "2025-07-05", departTime: "08:00", arriveDate: "2025-07-05", arriveTime: "09:00", price: 40000, stops: 0 },
                        { airline: "진에어", flightNumber: "LJ404", origin: "서울(GMP)", destination: "부산(PUS)", departDate: "2025-07-05", departTime: "09:30", arriveDate: "2025-07-05", arriveTime: "10:30", price: 43000, stops: 0 }
                    ];
                    recommendation = "특정 날짜 없이 가장 저렴한 항공권을 찾으신다면, 주중 오전 출발편을 고려해 보세요.";
                } else {
                    flights = []; // 조건에 맞는 항공편 없음
                    recommendation = "요청하신 내용을 정확히 이해하지 못했습니다. '서울에서 제주도 다음주 금요일 가장 저렴한 항공권'과 같이 구체적으로 문의해주세요.";
                }

                resolve({ flights, recommendation });
            }, 1000); // 1초 지연 시뮬레이션
        });
    }

}); // DOMContentLoaded 끝