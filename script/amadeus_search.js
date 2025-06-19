// script/amadeus_search.js
// Flatpickr 인스턴스를 전역으로 노출
let departPicker;
let returnPicker;
let isRoundTrip = true; // Default to round trip

document.addEventListener('DOMContentLoaded', function () {
    console.log("[Amadeus_Search] DOMContentLoaded fired. Initializing..."); // ✅ 추가된 로그

    const searchFlightsBtn = document.getElementById('search-flights-btn');
    const originInput = document.getElementById('origin-input');
    const destinationInput = document.getElementById('destination-input');
    const departCalendar = document.getElementById('depart-calendar');
    const returnCalendar = document.getElementById('return-calendar');
    const passengerCount = document.getElementById('passenger-count');
    const seatClass = document.getElementById('seat-class');
    const directFlightRadio = document.getElementById('radio2');
    const flightResultsSection = document.getElementById('flight-results-section');
    const flightResultsDiv = document.getElementById('flight-results');
    const noResultsMessage = document.getElementById('no-results-message');
    const tripButtons = document.querySelectorAll('.trip-btn');

    const originSuggestionsDiv = document.getElementById('origin-suggestions');
    const destinationSuggestionsDiv = document.getElementById('destination-suggestions');

    // Flatpickr 초기화 전에 요소 존재 여부 확인
    if (departCalendar && returnCalendar) {
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
        console.log("[Amadeus_Search] departPicker initialized."); // ✅ 추가된 로그

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
        console.log("[Amadeus_Search] returnPicker initialized."); // ✅ 추가된 로그
    } else {
        console.warn("[Amadeus_Search] depart-calendar or return-calendar not found for Flatpickr initialization."); // ✅ 추가된 로그
    }


    // Event listeners for calendar labels to open pickers
    const departLabel = document.getElementById('depart-label');
    const returnLabel = document.getElementById('return-label');
    if (departLabel) departLabel.addEventListener("click", () => departPicker && departPicker.open()); // null 체크 추가
    if (returnLabel) returnLabel.addEventListener("click", () => { // null 체크 추가
        if (window.isRoundTrip && returnPicker) { // Only open return calendar if round trip is selected and picker exists
            returnPicker.open();
        }
    });

    // Passenger dropdown logic
    const passengerBtn = document.getElementById('passenger-btn');
    const passengerDropdown = document.getElementById('passenger-dropdown');

    if (passengerBtn) { // null 체크 추가
        passengerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from immediately closing it
            if (passengerDropdown) passengerDropdown.classList.toggle('show'); // null 체크 추가
        });
    } else {
        console.warn("[Amadeus_Search] passenger-btn not found."); // ✅ 추가된 로그
    }


    // Function to update the passenger button text (exposed globally)
    function updatePassengerLabel() {
        const count = passengerCount ? passengerCount.value : '1'; // null 체크 추가
        const seat = seatClass && seatClass.options[seatClass.selectedIndex] ? seatClass.options[seatClass.selectedIndex].text : '일반석'; // null 체크 추가
        if (passengerBtn) passengerBtn.textContent = `성인 ${count}명, ${seat}`;
        else console.warn("[Amadeus_Search] Cannot update passenger label: passenger-btn not found."); // ✅ 추가된 로그
    }
    window.updatePassengerLabel = updatePassengerLabel; // Expose globally

    // Update label when selection changes, but don't close dropdown from here
    if (passengerCount) passengerCount.addEventListener('change', updatePassengerLabel);
    if (seatClass) seatClass.addEventListener('change', updatePassengerLabel);

    // Close dropdown when clicking anywhere outside it or the button
    document.addEventListener('click', function (e) {
        if (passengerBtn && passengerDropdown && !passengerBtn.contains(e.target) && !passengerDropdown.contains(e.target)) {
            passengerDropdown.classList.remove('show');
        }
    });
    updatePassengerLabel(); // Initial update on load


    // Trip type (왕복/편도/다구간) button logic
    tripButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log(`[Amadeus_Search] Trip type button clicked: ${this.textContent}`); // ✅ 추가된 로그
            tripButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tripType = this.textContent;
            const returnCalendarContainer = returnCalendar ? returnCalendar.closest('.calendar-container').querySelector('#return-label').parentElement : null;

            if (tripType === '편도') {
                window.isRoundTrip = false;
                if (returnCalendarContainer) {
                    returnCalendarContainer.style.display = 'none';
                }
                if (returnPicker) returnPicker.clear(); // null 체크 추가
                if (returnLabel) { // null 체크 추가
                    returnLabel.textContent = '오는 날';
                    returnLabel.classList.remove('selected');
                }
            } else {
                window.isRoundTrip = true;
                if (returnCalendarContainer) {
                    returnCalendarContainer.style.display = 'block';
                }
            }
        });
    });


    // Function to fetch and display location suggestions (Amadeus reference data)
    async function fetchAndDisplaySuggestions(inputElement, suggestionsDiv, initialSearch = false) {
        console.log(`[Amadeus_Search] Fetching suggestions for: ${inputElement.id}, keyword: ${inputElement.value}`); // ✅ 추가된 로그
        const keyword = inputElement.value.trim();

        if (initialSearch && keyword.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">입력하여 도시/공항을 검색하세요.</div>';
            suggestionsDiv.style.display = 'block';
            console.log("[Amadeus_Search] Initial search: empty keyword."); // ✅ 추가된 로그
            return;
        }

        if (keyword.length < 2) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">최소 두 글자 이상 입력해주세요.</div>';
            suggestionsDiv.style.display = 'block';
            console.log("[Amadeus_Search] Keyword too short."); // ✅ 추가된 로그
            return;
        }

        const firstChar = keyword.charAt(0);
        if (!(/[a-zA-Z]/.test(firstChar)) && !(/[ㄱ-힣]/.test(firstChar))) {
             suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">유효하지 않은 검색어입니다. (영문/한글로 시작해야 합니다)</div>';
             suggestionsDiv.style.display = 'block';
             console.log("[Amadeus_Search] Invalid first character in keyword."); // ✅ 추가된 로그
             return;
        }


        suggestionsDiv.innerHTML = '<div class="suggestion-item loading">검색 중...</div>';
        suggestionsDiv.style.display = 'block';
        console.log("[Amadeus_Search] Displaying loading message for suggestions."); // ✅ 추가된 로그

        try {
            // 백엔드 URL이 3001번 포트로 변경되었으므로 수정
            const response = await fetch(`http://localhost:3001/api/search-locations?keyword=${encodeURIComponent(keyword)}`);
            console.log("[Amadeus_Search] Location suggestions API call response status:", response.status); // ✅ 추가된 로그

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // JSON 파싱 실패 대비
                const errorMessage = errorData.details && errorData.details.errors && errorData.details.errors.length > 0
                                   ? `Amadeus API 오류: ${errorData.details.errors[0].detail}`
                                   : errorData.error || 'Failed to fetch location suggestions';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("[Amadeus_Search] Location suggestions data received:", data.data ? data.data.length : 0, "items."); // ✅ 추가된 로그
            displaySuggestions(data.data, inputElement, suggestionsDiv);

        } catch (error) {
            console.error('[Amadeus_Search] Error fetching location suggestions:', error); // ✅ 로그 변경
            suggestionsDiv.innerHTML = `<div class="suggestion-item error">오류 발생: ${error.message}</div>`;
            suggestionsDiv.style.display = 'block';
        }
    }

    // Function to render location suggestions in the dropdown
    function displaySuggestions(locations, inputElement, suggestionsDiv) {
        suggestionsDiv.innerHTML = '';

        if (!locations || locations.length === 0) {
            suggestionsDiv.innerHTML = '<div class="suggestion-item no-results">결과 없음</div>';
            console.log("[Amadeus_Search] No suggestions found."); // ✅ 추가된 로그
            return;
        }

        locations.forEach(location => {
            // ... (기존 코드와 동일) ...
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');

            let displayValue = '';
            let valueToSet = '';

            if (location.iataCode) {
                if (location.subType === 'AIRPORT') {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address.cityName}, ${location.address.countryName}`;
                } else if (location.subType === 'CITY') {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address.countryName}`;
                } else {
                    displayValue = `${location.name} (${location.iataCode}) - ${location.address?.cityName || location.address?.countryName || ''}`;
                }
                valueToSet = `${location.name} (${location.iataCode})`;
            } else {
                displayValue = `${location.name} - ${location.address?.countryName || ''}`;
                valueToSet = location.name;
            }
            
            suggestionItem.textContent = displayValue;
            suggestionItem.dataset.iataCode = location.iataCode || '';
            suggestionItem.dataset.cityName = location.address?.cityName || location.name;

            suggestionItem.addEventListener('click', () => {
                inputElement.value = suggestionItem.dataset.cityName + (suggestionItem.dataset.iataCode ? ` (${suggestionItem.dataset.iataCode})` : '');
                suggestionsDiv.style.display = 'none';
                suggestionsDiv.innerHTML = '';
                console.log(`[Amadeus_Search] Suggestion selected for ${inputElement.id}: ${inputElement.value}`); // ✅ 추가된 로그
            });
            suggestionsDiv.appendChild(suggestionItem);
        });
        suggestionsDiv.style.display = 'block';
        console.log("[Amadeus_Search] Displaying suggestions dropdown."); // ✅ 추가된 로그
    }

    // Event listeners for input fields (using 'input' for real-time suggestions)
    let originSearchTimeout;
    if (originInput) { // null 체크 추가
        originInput.addEventListener('input', () => {
            clearTimeout(originSearchTimeout);
            originSearchTimeout = setTimeout(() => {
                fetchAndDisplaySuggestions(originInput, originSuggestionsDiv);
            }, 300);
        });
        originInput.addEventListener('focus', () => {
            fetchAndDisplaySuggestions(originInput, originSuggestionsDiv, true);
        });
    } else {
        console.warn("[Amadeus_Search] origin-input not found."); // ✅ 추가된 로그
    }

    let destinationSearchTimeout;
    if (destinationInput) { // null 체크 추가
        destinationInput.addEventListener('input', () => {
            clearTimeout(destinationSearchTimeout);
            destinationSearchTimeout = setTimeout(() => {
                fetchAndDisplaySuggestions(destinationInput, destinationSuggestionsDiv);
            }, 300);
        });
        destinationInput.addEventListener('focus', () => {
            fetchAndDisplaySuggestions(destinationInput, destinationSuggestionsDiv, true);
        });
    } else {
        console.warn("[Amadeus_Search] destination-input not found."); // ✅ 추가된 로그
    }


    // Hide suggestions when clicking outside
    document.addEventListener('click', (event) => {
        if (originInput && originSuggestionsDiv && !originInput.contains(event.target) && !originSuggestionsDiv.contains(event.target)) {
            originSuggestionsDiv.style.display = 'none';
        }
        if (destinationInput && destinationSuggestionsDiv && !destinationInput.contains(event.target) && !destinationSuggestionsDiv.contains(event.target)) {
            destinationSuggestionsDiv.style.display = 'none';
        }
    });

    // Main search button click handler
    if (searchFlightsBtn) { // null 체크 추가
        searchFlightsBtn.addEventListener('click', async () => {
            console.log("[Amadeus_Search] Main search flights button clicked!"); // ✅ 추가된 로그
            // 입력값에서 IATA 코드 추출 (예: "서울 (ICN)" -> "ICN")
            const extractIataCodeFromInput = (inputVal) => {
                const match = inputVal.match(/\(([^)]+)\)/);
                return match ? match[1] : inputVal;
            };

            const originCode = extractIataCodeFromInput(originInput.value.trim().toUpperCase());
            const destinationCode = extractIataCodeFromInput(destinationInput.value.trim().toUpperCase());
            const departDate = departCalendar.value;
            const returnDate = window.isRoundTrip ? returnCalendar.value : '';
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
    } else {
        console.warn("[Amadeus_Search] search-flights-btn not found."); // ✅ 추가된 로그
    }


    // Function to perform the actual flight search (Amadeus flight offers) (exposed globally)
    async function performFlightSearch(params) {
        console.log("[Amadeus_Search] Performing flight search with params:", params); // ✅ 추가된 로그
        const { origin, destination, departDate, returnDate, adults, travelClass, nonStop } = params;

        if (!origin || !destination || !departDate) {
            alert('출발지, 도착지, 가는 날은 필수 입력 사항입니다.');
            console.warn("[Amadeus_Search] Missing required search parameters."); // ✅ 추가된 로그
            return;
        }

        if (window.isRoundTrip && !returnDate) {
            alert('왕복 선택 시 오는 날도 입력해주세요.');
            console.warn("[Amadeus_Search] Round trip selected but return date is missing."); // ✅ 추가된 로그
            return;
        }

        if (flightResultsSection) flightResultsSection.style.display = 'block'; // 결과 섹션 표시
        if (flightResultsDiv) flightResultsDiv.innerHTML = '<p>항공편을 검색 중입니다...</p>';
        if (noResultsMessage) noResultsMessage.style.display = 'none';

        try {
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
            console.log("[Amadeus_Search] Flight search API call response status:", response.status); // ✅ 추가된 로그

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.details && errorData.details.errors && errorData.details.errors.length > 0
                                   ? `Amadeus API 오류: ${errorData.details.errors[0].detail}`
                                   : errorData.error || 'Failed to fetch flights';
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("[Amadeus_Search] Flight offers data received:", data.data ? data.data.length : 0, "offers."); // ✅ 추가된 로그
            displayFlightOffers(data.data, data.dictionaries);
        } catch (error) {
            console.error('[Amadeus_Search] Error during flight search:', error); // ✅ 로그 변경
            if (flightResultsDiv) flightResultsDiv.innerHTML = `<p style="color: red;">항공편 검색 중 오류가 발생했습니다: ${error.message}</p>`;
            if (noResultsMessage) noResultsMessage.style.display = 'block';
        }
    }
    window.performFlightSearch = performFlightSearch;

    // Function to display flight offers in the UI
    function displayFlightOffers(offers, dictionaries) {
        console.log("[Amadeus_Search] Displaying flight offers..."); // ✅ 추가된 로그
        if (flightResultsDiv) flightResultsDiv.innerHTML = '';

        if (!offers || offers.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
            console.log("[Amadeus_Search] No flight offers found to display."); // ✅ 추가된 로그
            return;
        }
        if (noResultsMessage) noResultsMessage.style.display = 'none';

        offers.forEach(offer => {
            // ... (기존 코드와 동일) ...
            const price = offer.price.grandTotal;
            const outboundItinerary = offer.itineraries[0];
            const outboundSegment = outboundItinerary.segments[0];
            const inboundItinerary = window.isRoundTrip && offer.itineraries.length > 1 ? offer.itineraries[1] : null;
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
            if (flightResultsDiv) flightResultsDiv.appendChild(card); // null 체크 추가
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