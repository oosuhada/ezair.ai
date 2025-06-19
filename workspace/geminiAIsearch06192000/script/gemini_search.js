// gemini_search.js

// 전역 변수로 Flatpickr 인스턴스를 선언 (amadeus_search.js에서 이미 전역으로 관리하므로 제거)
// let departFlatpickrInstance;
// let returnFlatpickrInstance;

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded. Initializing scripts.");

    // Flatpickr 인스턴스는 amadeus_search.js에서 전역 변수로 노출되므로 직접 사용
    const departCalendarInput = document.getElementById('depart-calendar');
    const returnCalendarInput = document.getElementById('return-calendar');
    const departLabel = document.getElementById('depart-label');
    const returnLabel = document.getElementById('return-label');

    // amadeus_search.js에서 초기화된 Flatpickr 인스턴스를 참조
    // 이 부분이 올바르게 작동하려면 amadeus_search.js가 먼저 로드되어야 합니다.
    // HTML에서 script 태그 순서를 확인하세요.
    const departFlatpickrInstance = window.departPicker;
    const returnFlatpickrInstance = window.returnPicker;

    if (!departFlatpickrInstance || !returnFlatpickrInstance) {
        console.error("Flatpickr instances not found. Ensure amadeus_search.js is loaded first.");
    }

    // --- 왕복/편도/다구간 버튼 로직 ---
    // script.js와 amadeus_search.js에서 이미 처리하고 있으므로 이 부분은 삭제합니다.
    // 중복 코드를 피하고 하나의 소스에서 관리하는 것이 좋습니다.

    // --- 출발지/도착지 자동완성 (Amadeus API 연동) ---
    // 이 부분은 amadeus_search.js에서 이미 잘 구현되어 있으므로, 여기서는 삭제합니다.
    // 대신, amadeus_search.js의 코드가 올바르게 백엔드와 연동되는지 확인합니다.

    // --- 출발지/도착지 스왑 버튼 ---
    // 이 부분은 script.js 또는 amadeus_search.js에서 처리해야 합니다. 여기서는 삭제합니다.

    // --- 승객 및 좌석 등급 선택 드롭다운 ---
    // 이 부분도 amadeus_search.js에서 처리하고 있으므로, 여기서는 삭제합니다.
    // 필요한 경우 amadeus_search.js의 window.updatePassengerLabel 함수를 사용합니다.

    // --- 검색 버튼 (Amadeus 직접 검색) ---
    // 이 부분도 amadeus_search.js에서 처리하고 있으므로, 여기서는 삭제합니다.
    // 필요한 경우 amadeus_search.js의 window.performFlightSearch 함수를 사용합니다.


    // --- AI 항공권 어시스턴트 모달 로직 (gemini_search.js의 주요 기능) ---
    const aiInput = document.querySelector('.ai-input');
    const aiSearchBtn = document.querySelector('.ai-search-btn');
    const aiResultsModal = document.getElementById('ai-results-modal');
    const closeModalBtn = aiResultsModal ? aiResultsModal.querySelector('.close-button') : null;
    const modalFlightResults = document.getElementById('modal-flight-results');
    const aiAdditionalRecommendation = document.getElementById('ai-additional-recommendation');
    const searchFlightsBtn = document.getElementById('search-flights-btn'); // Amadeus 검색 버튼

    if (aiInput && aiSearchBtn && aiResultsModal && closeModalBtn && modalFlightResults && aiAdditionalRecommendation && searchFlightsBtn) {
        aiSearchBtn.addEventListener('click', async function() {
            const query = aiInput.value.trim();
            if (query) {
                console.log("AI 항공권 검색 쿼리:", query);
                modalFlightResults.innerHTML = '<p>AI 어시스턴트가 항공편 정보를 분석 중입니다...</p>';
                aiAdditionalRecommendation.innerHTML = ''; // 이전 추천 초기화 (innerHTML로 변경)
                aiResultsModal.style.display = 'flex'; // flex로 변경하여 중앙 정렬

                try {
                    // 백엔드 Gemini API 엔드포인트 호출
                    const geminiResponse = await fetch('http://localhost:3000/api/gemini-chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt: query }) // 사용자 쿼리를 'prompt'로 보냄
                    });

                    if (!geminiResponse.ok) {
                        const errorData = await geminiResponse.json();
                        throw new Error(`백엔드 Gemini API 오류: ${geminiResponse.status} - ${errorData.error || geminiResponse.statusText}`);
                    }

                    const responseData = await geminiResponse.json();
                    const geminiText = responseData.response; // 백엔드에서 'response' 필드에 텍스트가 옴
                    console.log("Gemini 응답 텍스트 (백엔드로부터):", geminiText);

                    let parsedGeminiData;
                    try {
                        // Gemini가 JSON을 `json` 코드 블록으로 줄 수 있으므로 파싱 로직 강화
                        const jsonMatch = geminiText.match(/```json\n([\s\S]*?)\n```/);
                        if (jsonMatch && jsonMatch[1]) {
                             parsedGeminiData = JSON.parse(jsonMatch[1]);
                        } else {
                            // JSON 코드 블록이 없으면 전체를 JSON으로 시도 (혹은 실패 처리)
                            parsedGeminiData = JSON.parse(geminiText);
                        }
                    } catch (parseError) {
                        console.error("Gemini 응답 텍스트 JSON 파싱 실패:", parseError);
                        // 파싱 실패 시 기본 응답 구조
                        parsedGeminiData = {
                            flights: [],
                            recommendation: "AI 어시스턴트가 요청하신 내용을 정확히 이해하지 못했습니다.<br>AI 어시스턴트의 추가 추천<br>요청하신 내용을 정확히 이해하지 못했습니다. '서울에서 제주도 다음주 금요일 가장 저렴한 항공권'과 같이 구체적으로 문의해주세요."
                        };
                    }

                    if (parsedGeminiData.flights && parsedGeminiData.flights.length > 0) {
                        // AI 검색 모달에 결과 표시
                        modalFlightResults.innerHTML = parsedGeminiData.flights.map(flight => `
                            <div class="flight-item">
                                <h3>${flight.airline || '항공사 불명'} ${flight.flightNumber || ''}</h3>
                                <p>출발: <strong>${flight.origin || '정보 없음'}</strong> (${flight.departDate || '날짜 없음'}) ${flight.departTime || '시간 없음'}</p>
                                <p>도착: <strong>${flight.destination || '정보 없음'}</strong> (${flight.arriveDate || '날짜 없음'}) ${flight.arriveTime || '시간 없음'}</p>
                                <p>가격: ₩${(flight.price || 0).toLocaleString()}</p>
                                ${typeof flight.stops === 'number' && flight.stops > 0 ? `<p>경유: ${flight.stops}회</p>` : '<p>직항</p>'}
                            </div>
                        `).join('');

                        // Gemini 결과로 메인 검색 UI 업데이트 및 Amadeus 검색 트리거
                        const firstFlight = parsedGeminiData.flights[0];

                        // 출발지/도착지 입력 필드 업데이트 (IATA 코드와 도시명 결합 형식)
                        document.getElementById('origin-input').value = `${firstFlight.originCity || firstFlight.origin} (${firstFlight.origin})`;
                        document.getElementById('destination-input').value = `${firstFlight.destinationCity || firstFlight.destination} (${firstFlight.destination})`;

                        // 가는 날/오는 날 달력 업데이트 (Flatpickr 인스턴스 사용)
                        if (departFlatpickrInstance && firstFlight.departDate) {
                            departFlatpickrInstance.setDate(firstFlight.departDate);
                        }
                        // 왕복 여부에 따라 returnDate 처리
                        const tripButtons = document.querySelectorAll('.trip-btn');
                        const oneWayButton = Array.from(tripButtons).find(btn => btn.textContent === '편도');
                        const roundTripButton = Array.from(tripButtons).find(btn => btn.textContent === '왕복');

                        if (firstFlight.returnDate && returnFlatpickrInstance) {
                            returnFlatpickrInstance.setDate(firstFlight.returnDate);
                            // 왕복 버튼 활성화
                            if (roundTripButton) {
                                tripButtons.forEach(btn => btn.classList.remove('active'));
                                roundTripButton.classList.add('active');
                                window.isRoundTrip = true; // amadeus_search.js의 전역 변수 업데이트
                                returnCalendar.closest('.calendar-container').querySelector('#return-label').parentElement.style.display = 'block';
                            }
                        } else {
                            // 편도 버튼 활성화
                            if (oneWayButton) {
                                tripButtons.forEach(btn => btn.classList.remove('active'));
                                oneWayButton.classList.add('active');
                                window.isRoundTrip = false; // amadeus_search.js의 전역 변수 업데이트
                                returnCalendar.closest('.calendar-container').querySelector('#return-label').parentElement.style.display = 'none';
                                if (returnFlatpickrInstance) returnFlatpickrInstance.clear();
                            }
                        }

                        // 인원수, 좌석 등급 업데이트 (Gemini 응답에 있다면)
                        if (firstFlight.adults) {
                            document.getElementById('passenger-count').value = firstFlight.adults;
                        }
                        if (firstFlight.travelClass) {
                            document.getElementById('seat-class').value = firstFlight.travelClass.toUpperCase();
                        }
                        // 승객 버튼 텍스트 업데이트 (amadeus_search.js의 함수 호출)
                        if (window.updatePassengerLabel) {
                            window.updatePassengerLabel();
                        }

                        // 직항 여부 업데이트
                        document.getElementById('radio2').checked = (typeof firstFlight.stops === 'number' && firstFlight.stops === 0);

                        // Amadeus 검색 버튼 클릭 트리거
                        // Amadeus 검색은 amadeus_search.js의 searchFlightsBtn.addEventListener에서 처리되므로,
                        // 그 이벤트 리스너가 필요로 하는 모든 필드가 채워진 후에 클릭을 호출합니다.
                        setTimeout(() => {
                            searchFlightsBtn.click();
                            console.log("Gemini 결과를 바탕으로 Amadeus 검색 시작.");
                        }, 500); // UI 업데이트 후 약간의 딜레이

                    } else {
                        modalFlightResults.innerHTML = '<p>AI 어시스턴트가 요청하신 조건에 맞는 항공편을 찾을 수 없습니다.</p>';
                    }

                    if (parsedGeminiData.recommendation) {
                        aiAdditionalRecommendation.innerHTML = parsedGeminiData.recommendation;
                    }

                } catch (error) {
                    console.error("AI 항공권 검색 중 오류 발생:", error);
                    modalFlightResults.innerHTML = '<p>AI 항공권 검색 중 오류가 발생했습니다. 다시 시도해 주세요.</p>';
                    aiAdditionalRecommendation.innerHTML = "문제가 지속되면 시스템 관리자에게 문의하거나, '서울에서 제주도 다음주 금요일 가장 저렴한 항공권'과 같이 구체적으로 문의해주세요.";
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
        console.warn("AI assistant elements or main search button not found.");
    }

}); // DOMContentLoaded 끝