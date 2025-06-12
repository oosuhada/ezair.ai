// script/api_integration.js
document.addEventListener('DOMContentLoaded', function () {
    const searchFlightsBtn = document.getElementById('search-flights-btn');
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const departCalendar = document.getElementById('depart-calendar');
    const returnCalendar = document.getElementById('return-calendar');
    const passengerCount = document.getElementById('passenger-count');
    const seatClass = document.getElementById('seat-class');
    const directFlightRadio = document.getElementById('radio2');
    const flightResultsDiv = document.getElementById('flight-results');
    const noResultsMessage = document.getElementById('no-results-message');
    const tripButtons = document.querySelectorAll('.trip-btn');

    const originSuggestionsDiv = document.getElementById('origin-suggestions');
    const destinationSuggestionsDiv = document.getElementById('destination-suggestions');

    let isRoundTrip = true; // Default to round trip

    // Initialize Flatpickr for date selection
    const departPicker = flatpickr(departCalendar, {
        dateFormat: "Y-m-d",
        disableMobile: true,
        onChange: function (selectedDates, dateStr) {
            document.getElementById('depart-label').textContent = dateStr || "가는 날";
            if (dateStr) {
                returnPicker.set('minDate', dateStr); // Set return date minimum to departure date
                if (!isRoundTrip) { // 편도일 경우 returnPicker 비활성화
                    returnPicker.clear();
                    returnPicker.close();
                }
            }
        }
    });

    const returnPicker = flatpickr(returnCalendar, {
        dateFormat: "Y-m-d",
        disableMobile: true,
        onChange: function (selectedDates, dateStr) {
            document.getElementById('return-label').textContent = dateStr || "오는 날";
        }
    });

    // Event listeners for calendar labels to open pickers
    document.getElementById('depart-label').addEventListener("click", () => departPicker.open());
    document.getElementById('return-label').addEventListener("click", () => {
        if (isRoundTrip) { // 왕복일 때만 오는 날 달력 열기
            returnPicker.open();
        }
    });

    // Passenger dropdown logic
    const passengerBtn = document.getElementById('passenger-btn');
    const passengerDropdown = document.getElementById('passenger-dropdown');

    passengerBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from closing immediately
        passengerDropdown.classList.toggle('show');
    });

    function updatePassengerLabel() {
        const count = passengerCount.value;
        const seat = seatClass.options[seatClass.selectedIndex].text; // Get text for display
        passengerBtn.textContent = `성인 ${count}명, ${seat}`;
    }

    passengerCount.addEventListener('change', updatePassengerLabel);
    seatClass.addEventListener('change', updatePassengerLabel);

    document.addEventListener('click', function (e) {
        if (!passengerBtn.contains(e.target) && !passengerDropdown.contains(e.target)) {
            passengerDropdown.classList.remove('show');
        }
    });
    updatePassengerLabel(); // Initial update


    // Trip type (왕복/편도/다구간) button logic
    tripButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tripButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tripType = this.textContent;
            const returnCalendarContainer = returnCalendar.closest('.calendar-container').querySelector('#return-label').parentElement;

            if (tripType === '편도') {
                isRoundTrip = false;
                if (returnCalendarContainer) {
                    returnCalendarContainer.style.display = 'none';
                }
                returnPicker.clear(); // 편도 선택 시 오는 날짜 초기화
            } else {
                isRoundTrip = true;
                if (returnCalendarContainer) {
                    returnCalendarContainer.style.display = 'block';
                }
            }
        });
    });


    // Function to fetch and display location suggestions
    async function fetchAndDisplaySuggestions(inputElement, suggestionsDiv, initialSearch = false) {
        const keyword = inputElement.value.trim();

        // 텍스트 필드를 클릭했을 때 (initialSearch=true) 초기 메시지 표시
        if (initialSearch && keyword.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">입력하여 도시/공항을 검색하세요.</div>';
            suggestionsDiv.style.display = 'block';
            return;
        }

        // 키워드가 2글자 미만일 때 (또는 공백만 있을 때) 검색을 수행하지 않음
        if (keyword.length < 2) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">최소 두 글자 이상 입력해주세요.</div>'; // 안내 메시지 추가
            suggestionsDiv.style.display = 'block'; // 드롭다운 표시
            return;
        }

        // Amadeus API에 유효한 문자가 아닌 경우 (예: 특수문자, 숫자만 있는 경우 등)를 대비한 간단한 검증
        // 대부분의 공항/도시 코드는 영문 알파벳 또는 한글로 시작합니다.
        // 숫자나 특수문자로만 구성된 검색어는 Amadeus에서 INVALID FORMAT 오류를 발생시킬 수 있습니다.
        const firstChar = keyword.charAt(0);
        if (!(/[a-zA-Z]/.test(firstChar)) && !(/[ㄱ-힣]/.test(firstChar))) {
             suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">유효하지 않은 검색어입니다. (영문/한글로 시작해야 합니다)</div>';
             suggestionsDiv.style.display = 'block';
             return;
        }


        suggestionsDiv.innerHTML = '<div class="suggestion-item loading">검색 중...</div>';
        suggestionsDiv.style.display = 'block';

        try {
            const response = await fetch(`http://localhost:3000/api/search-locations?keyword=${encodeURIComponent(keyword)}`);

            if (!response.ok) {
                const errorData = await response.json();
                // 백엔드에서 넘겨주는 Amadeus 오류 메시지를 더 상세하게 표시
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

    // Function to render suggestions in the dropdown
    function displaySuggestions(locations, inputElement, suggestionsDiv) {
        suggestionsDiv.innerHTML = ''; // Clear previous suggestions

        if (!locations || locations.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">결과 없음</div>';
            return;
        }

        locations.forEach(location => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');

            let displayValue = '';
            let valueToSet = ''; // This will be the IATA code or city name used for search

            // Prioritize AIRPORT (A) over CITY (C) if both exist for the same IATA code
            // The Amadeus API's /v1/reference-data/locations endpoint typically returns
            // both CITY and AIRPORT subTypes. We want to display the full name
            // but use the IATA code for the backend search.

            if (location.iataCode) {
                // For Airports: "Airport Name (IATA) - City, Country"
                if (location.subType === 'AIRPORT') {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address.cityName}, ${location.address.countryName}`;
                }
                // For Cities with an IATA code: "City Name (IATA) - Country"
                else if (location.subType === 'CITY') {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address.countryName}`;
                }
                valueToSet = location.iataCode;
            } else {
                // Fallback for locations without IATA (less common for flight search but good to handle)
                displayValue = `${location.name} - ${location.address.countryName}`;
                valueToSet = location.name; // Use name as a fallback for search if no IATA
            }
            
            suggestionItem.textContent = displayValue;
            suggestionItem.dataset.value = valueToSet; // Store the IATA code or city name for input

            suggestionItem.addEventListener('click', () => {
                inputElement.value = suggestionItem.dataset.value; // Set input value to IATA code
                suggestionsDiv.style.display = 'none'; // Hide suggestions
                suggestionsDiv.innerHTML = ''; // Clear suggestions
            });
            suggestionsDiv.appendChild(suggestionItem);
        });
        suggestionsDiv.style.display = 'block'; // Show the dropdown
    }

    // Event listeners for input fields (using 'input' for real-time suggestions)
    let originSearchTimeout;
    originInput.addEventListener('input', () => {
        clearTimeout(originSearchTimeout);
        originSearchTimeout = setTimeout(() => {
            fetchAndDisplaySuggestions(originInput, originSuggestionsDiv);
        }, 300); // Debounce to prevent too many requests
    });
    // Add focus listener for initial display
    originInput.addEventListener('focus', () => {
        fetchAndDisplaySuggestions(originInput, originSuggestionsDiv, true); // Pass true for initial search
    });


    let destinationSearchTimeout;
    destinationInput.addEventListener('input', () => {
        clearTimeout(destinationSearchTimeout);
        destinationSearchTimeout = setTimeout(() => {
            fetchAndDisplaySuggestions(destinationInput, destinationSuggestionsDiv);
        }, 300); // Debounce
    });
    // Add focus listener for initial display
    destinationInput.addEventListener('focus', () => {
        fetchAndDisplaySuggestions(destinationInput, destinationSuggestionsDiv, true); // Pass true for initial search
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
        const origin = originInput.value.trim().toUpperCase();
        const destination = destinationInput.value.trim().toUpperCase();
        const departDate = departCalendar.value;
        const returnDate = isRoundTrip ? returnCalendar.value : '';
        const adults = passengerCount.value;
        const travelClass = seatClass.value; // Value is ECONOMY, BUSINESS, FIRST
        const nonStop = directFlightRadio.checked;

        if (!origin || !destination || !departDate) {
            alert('출발지, 도착지, 가는 날은 필수 입력 사항입니다.');
            return;
        }

        if (isRoundTrip && !returnDate) {
            alert('왕복 선택 시 오는 날도 입력해주세요.');
            return;
        }

        flightResultsDiv.innerHTML = '<p>항공편을 검색 중입니다...</p>';
        noResultsMessage.style.display = 'none';


        try {
            // Send request to your backend server
            const response = await fetch('http://localhost:3000/api/search-flights', { // Adjust URL if your backend is on a different port/domain
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
            displayFlightOffers(data.data, data.dictionaries); // Amadeus API returns 'data' and 'dictionaries'
        } catch (error) {
            console.error('Error during flight search:', error);
            flightResultsDiv.innerHTML = `<p style="color: red;">항공편 검색 중 오류가 발생했습니다: ${error.message}</p>`;
            noResultsMessage.style.display = 'block'; // Or hide, depending on preference for error messages
        }
    });

    function displayFlightOffers(offers, dictionaries) {
        flightResultsDiv.innerHTML = ''; // Clear previous results

        if (!offers || offers.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }
        noResultsMessage.style.display = 'none';


        offers.forEach(offer => {
            const price = offer.price.grandTotal;
            // Assuming first itinerary and first segment for simplicity of display
            const outboundItinerary = offer.itineraries[0];
            const outboundSegment = outboundItinerary.segments[0];
            const inboundItinerary = isRoundTrip && offer.itineraries.length > 1 ? offer.itineraries[1] : null;
            const inboundSegment = inboundItinerary ? inboundItinerary.segments[0] : null;

            // Get airline name using IATA code from dictionaries
            const airlineCode = outboundSegment.carrierCode;
            const airlineName = dictionaries.carriers[airlineCode] || airlineCode; // Fallback to code if name not found

            const card = document.createElement('div');
            card.className = 'flight-card'; // Apply custom styling

            let flightDetailsHtml = `
                <h3>${originInput.value.toUpperCase()} (${outboundSegment.departure.iataCode}) → ${destinationInput.value.toUpperCase()} (${outboundSegment.arrival.iataCode})</h3>
                <p><strong>항공사:</strong> ${airlineName}</p>
                <p><strong>출발:</strong> ${new Date(outboundSegment.departure.at).toLocaleString()}</p>
                <p><strong>도착:</strong> ${new Date(outboundSegment.arrival.at).toLocaleString()}</p>
                <p><strong>총 소요 시간:</strong> ${formatDuration(outboundItinerary.duration)}</p>
                ${outboundSegment.numberOfStops === 0 ? '<span class="direct-flight-badge">직항</span>' : `<span class="stops-badge">${outboundSegment.numberOfStops} 경유</span>`}
            `;

            if (inboundSegment) {
                const inboundAirlineCode = inboundSegment.carrierCode;
                const inboundAirlineName = dictionaries.carriers[inboundAirlineCode] || inboundAirlineCode;
                flightDetailsHtml += `
                    <hr>
                    <p><strong>오는 편:</strong></p>
                    <p><strong>항공사:</strong> ${inboundAirlineName}</p>
                    <p><strong>출발:</strong> ${new Date(inboundSegment.departure.at).toLocaleString()}</p>
                    <p><strong>도착:</strong> ${new Date(inboundSegment.arrival.at).toLocaleString()}</p>
                    <p><strong>총 소요 시간:</strong> ${formatDuration(inboundItinerary.duration)}</p>
                    ${inboundSegment.numberOfStops === 0 ? '<span class="direct-flight-badge">직항</span>' : `<span class="stops-badge">${inboundSegment.numberOfStops} 경유</span>`}
                `;
            }

            card.innerHTML = `
                <div class="flight-info">
                    ${flightDetailsHtml}
                </div>
                <div class="flight-price">
                    <p>가격: <strong>${price} USD</strong></p>
                    <button class="book-btn">예매하기</button>
                </div>
            `;
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