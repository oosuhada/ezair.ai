// script/amadeus_search.js
// Flatpickr 인스턴스를 전역으로 노출
let departPicker;
let returnPicker;
let isRoundTrip = true; // Default to round trip

document.addEventListener('DOMContentLoaded', function () {
    const searchFlightsBtn = document.getElementById('search-flights-btn');
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const departCalendar = document.getElementById('depart-calendar');
    const returnCalendar = document.getElementById('return-calendar');
    const passengerCount = document.getElementById('passenger-count');
    const seatClass = document.getElementById('seat-class');
    const directFlightRadio = document.getElementById('radio2');
    const flightResultsSection = document.getElementById('flight-results-section'); // 섹션도 필요
    const flightResultsDiv = document.getElementById('flight-results');
    const noResultsMessage = document.getElementById('no-results-message');
    const tripButtons = document.querySelectorAll('.trip-btn');

    const originSuggestionsDiv = document.getElementById('origin-suggestions');
    const destinationSuggestionsDiv = document.getElementById('destination-suggestions');

    // Initialize Flatpickr for date selection and expose to global scope
    departPicker = flatpickr(departCalendar, {
        dateFormat: "Y-m-d",
        disableMobile: true,
        appendTo: document.getElementById('depart-label').parentElement,
        onChange: function (selectedDates, dateStr) {
            document.getElementById('depart-label').textContent = dateStr || "가는 날";
            document.getElementById('depart-label').classList.toggle('selected', !!dateStr);
            if (selectedDates.length > 0) {
                returnPicker.set('minDate', selectedDates[0]); // Set return date minimum to departure date
            } else {
                returnPicker.set('minDate', "today");
            }
        }
    });
    window.departPicker = departPicker; // Expose globally

    returnPicker = flatpickr(returnCalendar, {
        dateFormat: "Y-m-d",
        disableMobile: true,
        appendTo: document.getElementById('return-label').parentElement,
        onChange: function (selectedDates, dateStr) {
            document.getElementById('return-label').textContent = dateStr || "오는 날";
            document.getElementById('return-label').classList.toggle('selected', !!dateStr);
        }
    });
    window.returnPicker = returnPicker; // Expose globally


    // Event listeners for calendar labels to open pickers
    document.getElementById('depart-label').addEventListener("click", () => departPicker.open());
    document.getElementById('return-label').addEventListener("click", () => {
        if (window.isRoundTrip) { // Only open return calendar if round trip is selected
            returnPicker.open();
        }
    });

    // Passenger dropdown logic
    const passengerBtn = document.getElementById('passenger-btn');
    const passengerDropdown = document.getElementById('passenger-dropdown');

    passengerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from immediately closing it
        passengerDropdown.classList.toggle('show');
    });

    // Function to update the passenger button text (exposed globally)
    function updatePassengerLabel() {
        const count = passengerCount.value;
        const seat = seatClass.options[seatClass.selectedIndex].text; // Get text for display
        passengerBtn.textContent = `성인 ${count}명, ${seat}`;
    }
    window.updatePassengerLabel = updatePassengerLabel; // Expose globally

    // Update label when selection changes, but don't close dropdown from here
    passengerCount.addEventListener('change', updatePassengerLabel);
    seatClass.addEventListener('change', updatePassengerLabel);

    // Close dropdown when clicking anywhere outside it or the button
    document.addEventListener('click', function (e) {
        if (!passengerBtn.contains(e.target) && !passengerDropdown.contains(e.target)) {
            passengerDropdown.classList.remove('show');
        }
    });
    updatePassengerLabel(); // Initial update on load


    // Trip type (왕복/편도/다구간) button logic
    tripButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tripButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tripType = this.textContent;
            const returnCalendarContainer = returnCalendar.closest('.calendar-container').querySelector('#return-label').parentElement;

            if (tripType === '편도') {
                window.isRoundTrip = false; // Update global variable
                if (returnCalendarContainer) {
                    returnCalendarContainer.style.display = 'none';
                }
                returnPicker.clear(); // Clear return date when switching to one-way
                document.getElementById('return-label').textContent = '오는 날'; // 라벨 텍스트 초기화
                document.getElementById('return-label').classList.remove('selected');
            } else {
                window.isRoundTrip = true; // Update global variable
                if (returnCalendarContainer) {
                    returnCalendarContainer.style.display = 'block';
                }
            }
        });
    });


    // Function to fetch and display location suggestions (Amadeus reference data)
    async function fetchAndDisplaySuggestions(inputElement, suggestionsDiv, initialSearch = false) {
        const keyword = inputElement.value.trim();

        if (initialSearch && keyword.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">입력하여 도시/공항을 검색하세요.</div>';
            suggestionsDiv.style.display = 'block';
            return;
        }

        if (keyword.length < 2) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">최소 두 글자 이상 입력해주세요.</div>';
            suggestionsDiv.style.display = 'block';
            return;
        }

        // 첫 글자가 영문 또는 한글인지 확인
        const firstChar = keyword.charAt(0);
        if (!(/[a-zA-Z]/.test(firstChar)) && !(/[ㄱ-힣]/.test(firstChar))) {
             suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">유효하지 않은 검색어입니다. (영문/한글로 시작해야 합니다)</div>';
             suggestionsDiv.style.display = 'block';
             return;
        }


        suggestionsDiv.innerHTML = '<div class="suggestion-item loading">검색 중...</div>';
        suggestionsDiv.style.display = 'block';

        try {
            // 백엔드 URL이 3001번 포트로 변경되었으므로 수정
            const response = await fetch(`http://localhost:3001/api/search-locations?keyword=${encodeURIComponent(keyword)}`);

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.details && errorData.details.errors && errorData.details.errors.length > 0
                                   ? `Amadeus API 오류: ${errorData.details.errors[0].detail}`
                                   : errorData.error || 'Failed to fetch location suggestions';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            displaySuggestions(data.data, inputElement, suggestionsDiv);

        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            suggestionsDiv.innerHTML = `<div class="suggestion-item error">오류 발생: ${error.message}</div>`;
            suggestionsDiv.style.display = 'block';
        }
    }

    // Function to render location suggestions in the dropdown
    function displaySuggestions(locations, inputElement, suggestionsDiv) {
        suggestionsDiv.innerHTML = '';

        if (!locations || locations.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">결과 없음</div>';
            return;
        }

        locations.forEach(location => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');

            let displayValue = '';
            let valueToSet = '';

            // Amadeus API 응답에 따라 표시 방식 결정
            if (location.iataCode) {
                // 공항 또는 도시 코드 (IATA)가 있는 경우
                if (location.subType === 'AIRPORT') {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address.cityName}, ${location.address.countryName}`;
                } else if (location.subType === 'CITY') {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address.countryName}`;
                } else { // 기타 subType (e.g., "POINT_OF_INTEREST") 또는 예상치 못한 경우
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address?.cityName || location.address?.countryName || ''}`;
                }
                valueToSet = `${location.name} (${location.iataCode})`; // 입력 필드에 표시할 값
            } else {
                // IATA 코드가 없는 경우 (예외 케이스 또는 도시 이름만 있는 경우)
                displayValue = `${location.name} - ${location.address?.countryName || ''}`;
                valueToSet = location.name;
            }
            
            suggestionItem.textContent = displayValue;
            suggestionItem.dataset.iataCode = location.iataCode || ''; // IATA 코드를 data 속성에 저장
            suggestionItem.dataset.cityName = location.address?.cityName || location.name; // 도시 이름을 data 속성에 저장

            suggestionItem.addEventListener('click', () => {
                inputElement.value = suggestionItem.dataset.cityName + (suggestionItem.dataset.iataCode ? ` (${suggestionItem.dataset.iataCode})` : '');
                suggestionsDiv.style.display = 'none';
                suggestionsDiv.innerHTML = '';
            });
            suggestionsDiv.appendChild(suggestionItem);
        });
        suggestionsDiv.style.display = 'block';
    }

    // Event listeners for input fields (using 'input' for real-time suggestions)
    let originSearchTimeout;
    originInput.addEventListener('input', () => {
        clearTimeout(originSearchTimeout);
        originSearchTimeout = setTimeout(() => {
            fetchAndDisplaySuggestions(originInput, originSuggestionsDiv);
        }, 300);
    });
    originInput.addEventListener('focus', () => {
        fetchAndDisplaySuggestions(originInput, originSuggestionsDiv, true);
    });

    let destinationSearchTimeout;
    destinationInput.addEventListener('input', () => {
        clearTimeout(destinationSearchTimeout);
        destinationSearchTimeout = setTimeout(() => {
            fetchAndDisplaySuggestions(destinationInput, destinationSuggestionsDiv);
        }, 300);
    });
    destinationInput.addEventListener('focus', () => {
        fetchAndDisplaySuggestions(destinationInput, destinationSuggestionsDiv, true);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (!originInput.contains(event.target) && !originSuggestionsDiv.contains(event.target)) {
            originSuggestionsDiv.style.display = 'none';
        }
        if (!destinationInput.contains(event.target) && !destinationSuggestionsDiv.contains(event.target)) {
            destinationSuggestionsDiv.style.display = 'none';
        }
    });

    // Main search button click handler
    searchFlightsBtn.addEventListener('click', async () => {
        // 입력값에서 IATA 코드 추출 (예: "서울 (ICN)" -> "ICN")
        const extractIataCodeFromInput = (inputVal) => {
            const match = inputVal.match(/\(([^)]+)\)/);
            return match ? match[1] : inputVal; // 괄호 안의 내용을 추출, 없으면 전체 값 반환
        };

        const originCode = extractIataCodeFromInput(originInput.value.trim().toUpperCase());
        const destinationCode = extractIataCodeFromInput(destinationInput.value.trim().toUpperCase());
        const departDate = departCalendar.value;
        const returnDate = window.isRoundTrip ? returnCalendar.value : ''; // 전역 isRoundTrip 사용
        const adults = passengerCount.value;
        const travelClass = seatClass.value;
        const nonStop = directFlightRadio.checked;

        await performFlightSearch({
            origin: originCode,
            destination: destinationCode,
            departDate,
            returnDate,
            adults: parseInt(adults),
            travelClass,
            nonStop
        });
    });

    // Function to perform the actual flight search (Amadeus flight offers) (exposed globally)
    async function performFlightSearch(params) {
        const { origin, destination, departDate, returnDate, adults, travelClass, nonStop } = params;

        if (!origin || !destination || !departDate) {
            alert('출발지, 도착지, 가는 날은 필수 입력 사항입니다.');
            return;
        }

        // Check isRoundTrip status for manual search
        if (window.isRoundTrip && !returnDate) { // 전역 isRoundTrip 사용
            alert('왕복 선택 시 오는 날도 입력해주세요.');
            return;
        }

        flightResultsSection.style.display = 'block'; // 결과 섹션 표시
        flightResultsDiv.innerHTML = '<p>항공편을 검색 중입니다...</p>';
        noResultsMessage.style.display = 'none';

        try {
            // 백엔드 URL이 3001번 포트로 변경되었으므로 수정
            const response = await fetch('http://localhost:3001/api/search-flights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    origin,
                    destination,
                    departDate,
                    returnDate,
                    adults,
                    travelClass,
                    nonStop
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.details && errorData.details.errors && errorData.details.errors.length > 0
                                   ? `Amadeus API 오류: ${errorData.details.errors[0].detail}`
                                   : errorData.error || 'Failed to fetch flights';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            displayFlightOffers(data.data, data.dictionaries);
        } catch (error) {
            console.error('Error during flight search:', error);
            flightResultsDiv.innerHTML = `<p style="color: red;">항공편 검색 중 오류가 발생했습니다: ${error.message}</p>`;
            noResultsMessage.style.display = 'block';
        }
    }
    window.performFlightSearch = performFlightSearch; // Expose globally


    // Function to display flight offers in the UI
    function displayFlightOffers(offers, dictionaries) {
        flightResultsDiv.innerHTML = '';

        if (!offers || offers.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }
        noResultsMessage.style.display = 'none';

        offers.forEach(offer => {
            const price = offer.price.grandTotal;
            const outboundItinerary = offer.itineraries[0];
            const outboundSegment = outboundItinerary.segments[0];
            const inboundItinerary = window.isRoundTrip && offer.itineraries.length > 1 ? offer.itineraries[1] : null; // 전역 isRoundTrip 사용
            // Inbound segments are typically an array, use the first one for summary display
            const inboundFirstSegment = inboundItinerary ? inboundItinerary.segments[0] : null;


            const airlineCode = outboundSegment.carrierCode;
            const airlineName = dictionaries.carriers[airlineCode] || `Unknown (${airlineCode})`;

            const card = document.createElement('div');
            card.className = 'flight-card';

            let flightDetailsHtml = `
                <div class="flight-info">
                    <h3>${originInput.value} → ${destinationInput.value}</h3>
                    <p><strong>항공사:</strong> ${airlineName}</p>
                    <p><strong>출발:</strong> ${new Date(outboundSegment.departure.at).toLocaleString('ko-KR')}</p>
                    <p><strong>도착:</strong> ${new Date(outboundSegment.arrival.at).toLocaleString('ko-KR')}</p>
                    <p><strong>총 소요 시간:</strong> ${formatDuration(outboundItinerary.duration)}</p>
                    ${outboundItinerary.segments.length > 1 ? `<span class="stops-badge">${outboundItinerary.segments.length - 1} 경유</span>` : '<span class="direct-flight-badge">직항</span>'}
                </div>
                <div class="flight-price">
                    <p>가격: <strong>₩${parseFloat(price).toLocaleString()}</strong></p>
                    <button class="book-btn">예매하기</button>
                </div>
            `;

            if (inboundFirstSegment) {
                const inboundAirlineCode = inboundFirstSegment.carrierCode;
                const inboundAirlineName = dictionaries.carriers[inboundAirlineCode] || `Unknown (${inboundAirlineCode})`;
                flightDetailsHtml += `
                    <hr style="margin: 15px 0; border: none; border-top: 1px dashed #eee; width: 100%;">
                    <div class="flight-info">
                        <h3>돌아오는 편</h3>
                        <p><strong>항공사:</strong> ${inboundAirlineName}</p>
                        <p><strong>출발:</strong> ${new Date(inboundFirstSegment.departure.at).toLocaleString('ko-KR')}</p>
                        <p><strong>도착:</strong> ${new Date(inboundFirstSegment.arrival.at).toLocaleString('ko-KR')}</p>
                        <p><strong>총 소요 시간:</strong> ${formatDuration(inboundItinerary.duration)}</p>
                        ${inboundItinerary.segments.length > 1 ? `<span class="stops-badge">${inboundItinerary.segments.length - 1} 경유</span>` : '<span class="direct-flight-badge">직항</span>'}
                    </div>
                `;
            }

            card.innerHTML = flightDetailsHtml;
            flightResultsDiv.appendChild(card);
        });
    }

    // Helper function to format duration (Amadeus returns ISO 8601 duration)
    function formatDuration(isoDuration) {
        const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        if (!matches) return isoDuration;

        const hours = matches[1] ? parseInt(matches[1]) : 0;
        const minutes = matches[2] ? parseInt(matches[2]) : 0;

        let formatted = '';
        if (hours > 0) formatted += `${hours}시간 `;
        if (minutes > 0) formatted += `${minutes}분`;
        return formatted.trim();
    }
});