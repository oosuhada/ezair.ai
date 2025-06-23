// gemini_search.js

// 핵심 수정: import 문을 사용하여 GoogleGenerativeAI를 가져옵니다.
import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";

document.addEventListener('DOMContentLoaded', function() {
    console.log("[Gemini_Search] DOM content loaded. Initializing scripts.");

    const GEMINI_API_KEY = window.GEMINI_API_KEY;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        console.error("⛔️ 오류: Gemini API 키가 설정되지 않았거나 기본값입니다. HTML 파일의 window.GEMINI_API_KEY를 확인하세요.");
        alert("Gemini API 키를 설정해주세요! (HTML 파일 참조)");
        return;
    }
    console.log("[Gemini_Search] API Key loaded.");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // 모델 이름을 gemini-1.5-flash로 사용
    console.log("[Gemini_Search] Gemini model initialized with 'gemini-1.5-flash'.");

    const departFlatpickrInstance = window.departPicker;
    const returnFlatpickrInstance = window.returnPicker;

    if (!departFlatpickrInstance || !returnFlatpickrInstance) {
        console.warn("[Gemini_Search] Flatpickr instances not found. Ensure amadeus_search.js is loaded first if needed.");
    } else {
        console.log("[Gemini_Search] Flatpickr instances successfully referenced.");
    }

    const aiInput = document.querySelector('.ai-input');
    const aiSearchBtn = document.querySelector('.ai-search-btn'); // This is the button we'll target
    const aiResultsModal = document.getElementById('ai-results-modal');
    const closeModalBtn = aiResultsModal ? aiResultsModal.querySelector('.close-button') : null;
    const modalFlightResults = document.getElementById('modal-flight-results');
    const aiAdditionalRecommendation = document.getElementById('ai-additional-recommendation');
    const searchFlightsBtn = document.getElementById('search-flights-btn');

    console.log("[Gemini_Search] DOM elements check:", {
        aiInput: !!aiInput,
        aiSearchBtn: !!aiSearchBtn,
        aiResultsModal: !!aiResultsModal,
        closeModalBtn: !!closeModalBtn,
        modalFlightResults: !!modalFlightResults,
        aiAdditionalRecommendation: !!aiAdditionalRecommendation,
        searchFlightsBtn: !!searchFlightsBtn
    });

    if (aiInput && aiSearchBtn && aiResultsModal && closeModalBtn && modalFlightResults && aiAdditionalRecommendation && searchFlightsBtn) {
        console.log("[Gemini_Search] All required AI assistant elements found. Attaching event listeners.");

        // --- Lottie animation for ai-search-btn ---
        // Ensure the aiSearchBtn is empty before loading the animation
        aiSearchBtn.innerHTML = '';
        const lottieAnimation = lottie.loadAnimation({
            container: aiSearchBtn, // the DOM element that will contain the animation
            renderer: 'svg',
            loop: true, // You can set this to false if you want it to play once per click
            autoplay: false, // Set to false so we can control playback on click
            path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json'
        });
        console.log("[Gemini_Search] Lottie animation initialized for .ai-search-btn.");
        // --- End Lottie animation setup ---


        aiSearchBtn.addEventListener('click', async function() {
            console.log("[Gemini_Search] AI search button clicked!");
            const query = aiInput.value.trim();

            if (lottieAnimation) {
                lottieAnimation.goToAndPlay(0, true); // Play from the beginning
            }

            if (query) {
                console.log("[Gemini_Search] AI search query entered:", query);
                modalFlightResults.innerHTML = '<p>AI 어시스턴트가 항공편 검색 조건을 분석 중입니다...</p>';
                aiAdditionalRecommendation.innerHTML = ''; // 이전 추천 초기화
                aiResultsModal.style.display = 'flex'; // 모달창 표시

                try {
                    console.log("[Gemini_Search] Initiating Gemini API call for parameter extraction...");
                    // Gemini에게 검색 조건만 추출하도록 프롬프트 변경
                    const geminiPrompt = `You are a helpful AI assistant for flight booking.
Please extract the following flight search parameters from the user query and provide them in a JSON format.
If a parameter is not explicitly mentioned, use reasonable defaults or leave it as null/empty if no clear default can be inferred.
Always output the response as a single JSON object.

Parameters to extract:
- origin: IATA code of the departure city/airport (e.g., "ICN", "GMP"). If city name is given, try to infer the major airport IATA.
- destination: IATA code of the arrival city/airport (e.g., "JFK", "CJU").
- departDate: Departure date in YYYY-MM-DD format. Infer from relative terms like "next week", "this weekend", "tomorrow".
- returnDate: Return date in YYYY-MM-DD format (for round trips). If only departure date is given, or "one-way" is specified, set to null or empty string.
- adults: Number of adult passengers (default: 1).
- travelClass: Preferred travel class (ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST) (default: "ECONOMY").
- nonStop: Boolean indicating if only non-stop flights are preferred (default: false).

User Query: "${query}"

Expected JSON format:
\`\`\`json
{
  "origin": "IATA_CODE_ORIGIN",
  "destination": "IATA_CODE_DESTINATION",
  "departDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "adults": 1,
  "travelClass": "ECONOMY",
  "nonStop": false,
  "recommendation": "AI 어시스턴트의 추가 추천 텍스트 (HTML 허용, 예: '날짜를 유연하게 조정해보세요.')"
}
\`\`\`
Example 1:
User Query: "이번 주말 서울에서 제주 가는 가장 저렴한 왕복 항공권 찾아줘"
Response should be:
\`\`\`json
{
  "origin": "ICN",
  "destination": "CJU",
  "departDate": "2025-06-21",
  "returnDate": "2025-06-22",
  "adults": 1,
  "travelClass": "ECONOMY",
  "nonStop": false,
  "recommendation": "이번 주말 항공권은 가격이 높을 수 있습니다. 평일 출발을 고려해 보세요."
}
\`\`\`
Example 2:
User Query: "다음 달에 파리 가는 비즈니스석 편도 2명"
Response should be:
\`\`\`json
{
  "origin": null,
  "destination": "CDG",
  "departDate": "2025-07-01",
  "returnDate": null,
  "adults": 2,
  "travelClass": "BUSINESS",
  "nonStop": false,
  "recommendation": "파리 비즈니스석은 조기 예매 시 더 저렴할 수 있습니다."
}
\`\`\`
If the query is not clearly about flights or booking, explain why you cannot process it in the 'recommendation' field and set other parameters to null.
`;
                    const result = await model.generateContent(geminiPrompt);
                    const response = await result.response;
                    const geminiText = response.text();
                    console.log("[Gemini_Search] Gemini API response received:", geminiText);

                    let extractedParams;
                    let aiRecommendationText = "AI 어시스턴트의 추가 추천<br>요청하신 내용을 정확히 이해하지 못했습니다. '서울에서 제주도 다음주 금요일 가장 저렴한 항공권'과 같이 구체적으로 문의해주세요.";

                    try {
                        const jsonMatch = geminiText.match(/```json\n([\s\S]*?)\n```/);
                        if (jsonMatch && jsonMatch[1]) {
                            extractedParams = JSON.parse(jsonMatch[1]);
                            console.log("[Gemini_Search] Gemini response JSON code block parsed successfully:", extractedParams);
                        } else {
                            // JSON 코드 블록이 없으면 전체를 JSON으로 시도
                            extractedParams = JSON.parse(geminiText);
                            console.log("[Gemini_Search] Gemini response full JSON parsed successfully (no code block):", extractedParams);
                        }
                        if (extractedParams.recommendation) {
                            aiRecommendationText = extractedParams.recommendation;
                            delete extractedParams.recommendation; // 추천 텍스트는 파라미터에서 제외
                        }

                    } catch (parseError) {
                        console.error("[Gemini_Search] Failed to parse Gemini response text as JSON:", parseError);
                        console.log("[Gemini_Search] Original Gemini response text (parsing failed):", geminiText);
                        // 파싱 실패 시 기본 값 설정
                        extractedParams = {
                            origin: null, destination: null, departDate: null, returnDate: null,
                            adults: 1, travelClass: "ECONOMY", nonStop: false
                        };
                        aiRecommendationText = "AI 어시스턴트가 요청하신 내용을 정확히 이해하지 못했습니다.<br>AI 어시스턴트의 추가 추천<br>요청하신 내용을 정확히 이해하지 못했습니다. '서울에서 제주도 다음주 금요일 가장 저렴한 항공권'과 같이 구체적으로 문의해주세요.";
                    }

                    // AI 추천 텍스트 모달에 먼저 표시
                    aiAdditionalRecommendation.innerHTML = aiRecommendationText;

                    // 추출된 파라미터로 UI 업데이트 및 Amadeus 검색 트리거
                    if (extractedParams.origin && extractedParams.destination && extractedParams.departDate) {
                        console.log("[Gemini_Search] Extracted parameters are valid. Updating main UI and triggering Amadeus search.");

                        // 1. 메인 검색 UI 필드 업데이트
                        // origin, destination 필드 업데이트 (도시명 (IATA) 형식)
                        // Amadeus API에서 도시/공항 이름 정보를 직접 가져오지 않으므로, IATA 코드만 표시하거나 사용자에게 입력하도록 유도해야 할 수 있습니다.
                        // 여기서는 일단 IATA 코드만으로 업데이트하거나, AI가 도시명을 제공하면 함께 사용합니다.
                        document.getElementById('origin-input').value = `${extractedParams.originCity || ''} (${extractedParams.origin || ''})`;
                        document.getElementById('destination-input').value = `${extractedParams.destinationCity || ''} (${extractedParams.destination || ''})`;

                        // 달력 업데이트
                        if (departFlatpickrInstance && extractedParams.departDate) {
                            departFlatpickrInstance.setDate(extractedParams.departDate);
                        } else {
                            console.warn("[Gemini_Search] Could not set depart date from Gemini results or Flatpickr instance not found.");
                        }

                        // 왕복/편도 및 오는 날 업데이트
                        const tripButtons = document.querySelectorAll('.trip-btn');
                        const oneWayButton = Array.from(tripButtons).find(btn => btn.textContent === '편도');
                        const roundTripButton = Array.from(tripButtons).find(btn => btn.textContent === '왕복');
                        const returnCalendarContainer = document.getElementById('return-calendar') ? document.getElementById('return-calendar').closest('.calendar-container').querySelector('#return-label').parentElement : null;


                        if (extractedParams.returnDate && returnFlatpickrInstance) {
                            returnFlatpickrInstance.setDate(extractedParams.returnDate);
                            if (roundTripButton) {
                                tripButtons.forEach(btn => btn.classList.remove('active'));
                                roundTripButton.classList.add('active');
                                window.isRoundTrip = true;
                                if (returnCalendarContainer) returnCalendarContainer.style.display = 'block';
                            }
                        } else {
                            // 편도 설정 또는 오는 날 정보 없음
                            if (oneWayButton) {
                                tripButtons.forEach(btn => btn.classList.remove('active'));
                                oneWayButton.classList.add('active');
                                window.isRoundTrip = false;
                                if (returnCalendarContainer) returnCalendarContainer.style.display = 'none';
                                if (returnFlatpickrInstance) returnFlatpickrInstance.clear();
                            }
                        }

                        // 인원수, 좌석 등급 업데이트
                        if (extractedParams.adults) {
                            document.getElementById('passenger-count').value = extractedParams.adults;
                        }
                        if (extractedParams.travelClass) {
                            document.getElementById('seat-class').value = extractedParams.travelClass.toUpperCase();
                        }
                        if (window.updatePassengerLabel) { // amadeus_search.js의 함수 호출
                            window.updatePassengerLabel();
                        }

                        // 직항 여부 업데이트
                        const directFlightRadio = document.getElementById('radio2');
                        if (directFlightRadio) {
                            directFlightRadio.checked = extractedParams.nonStop;
                        }

                        // 2. Amadeus 검색 버튼 클릭 트리거
                        // amadeus_search.js의 searchFlightsBtn.addEventListener에서 처리되므로,
                        // 모든 필드가 채워진 후에 클릭을 호출합니다.
                        setTimeout(() => {
                            if (window.performFlightSearch) { // amadeus_search.js의 전역 함수 호출
                                // performFlightSearch에 필요한 파라미터를 정확히 전달합니다.
                                window.performFlightSearch({
                                    origin: extractedParams.origin,
                                    destination: extractedParams.destination,
                                    departDate: extractedParams.departDate,
                                    returnDate: extractedParams.returnDate,
                                    adults: extractedParams.adults,
                                    travelClass: extractedParams.travelClass,
                                    nonStop: extractedParams.nonStop
                                });
                                console.log("[Gemini_Search] Triggered Amadeus search based on Gemini results.");
                                // 모달의 "AI 항공권 검색 결과" 섹션은 "실제 검색 결과를 보려면 아래를 확인하세요." 등의 메시지로 변경
                                modalFlightResults.innerHTML = '<p>AI가 검색 조건을 분석하여 주요 검색 필드를 업데이트했습니다.<br>실제 항공편 검색 결과를 보려면 페이지 하단의 "검색 결과" 섹션을 확인해주세요!</p>';
                            } else {
                                console.error("[Gemini_Search] window.performFlightSearch is not available. Ensure amadeus_search.js is loaded correctly.");
                                modalFlightResults.innerHTML = '<p>AI가 검색 조건을 분석했지만, 실제 항공편 검색 기능을 찾을 수 없습니다.<br>스크립트 로드 순서나 파일 누락 여부를 확인해주세요.</p>';
                            }
                        }, 500); // UI 업데이트 후 약간의 딜레이

                    } else {
                        modalFlightResults.innerHTML = '<p>AI 어시스턴트가 요청하신 내용에서 유효한 항공편 검색 조건을 추출할 수 없었습니다.<br>예: "서울에서 제주 다음주 금요일 왕복 항공권 찾아줘"와 같이 구체적으로 문의해주세요.</p>';
                        console.log("[Gemini_Search] AI could not extract valid flight search parameters.");
                    }

                } catch (error) {
                    console.error("[Gemini_Search] An error occurred during AI flight search or parameter extraction:", error);
                    modalFlightResults.innerHTML = '<p>AI 항공권 검색 중 오류가 발생했습니다. 다시 시도해 주세요.</p>';
                    aiAdditionalRecommendation.innerHTML = "문제가 지속되면 시스템 관리자에게 문의하거나, '서울에서 제주도 다음주 금요일 가장 저렴한 항공권'과 같이 구체적으로 문의해주세요.";
                } finally {
                    if (lottieAnimation) {
                        lottieAnimation.stop(); // Stop the animation after the search is complete
                    }
                }

            } else {
                console.warn("[Gemini_Search] AI search query is empty. Please enter a query.");
                if (lottieAnimation) {
                    lottieAnimation.stop(); // Stop the animation if no query
                }
            }
        });

        closeModalBtn.addEventListener('click', function() {
            aiResultsModal.style.display = 'none';
            console.log("[Gemini_Search] AI search modal closed.");
        });

        window.addEventListener('click', function(event) {
            if (event.target == aiResultsModal) {
                aiResultsModal.style.display = 'none';
                console.log("[Gemini_Search] AI search modal closed by clicking outside.");
            }
        });
        console.log("[Gemini_Search] AI Flight Assistant features initialized and ready.");
    } else {
        console.warn("[Gemini_Search] One or more AI assistant HTML elements not found. Please check HTML IDs and classes.");
        console.warn({ aiInput: !!aiInput, aiSearchBtn: !!aiSearchBtn, aiResultsModal: !!aiResultsModal, closeModalBtn: !!closeModalBtn, modalFlightResults: !!modalFlightResults, aiAdditionalRecommendation: !!aiAdditionalRecommendation, searchFlightsBtn: !!searchFlightsBtn });
    }

}); // DOMContentLoaded 끝