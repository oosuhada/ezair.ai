// 핵심 수정: import 문을 사용하여 GoogleGenerativeAI를 가져옵니다.
import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";

document.addEventListener('DOMContentLoaded', function() {
    console.log("[Gemini_Search] DOM content loaded. Initializing scripts.");

    // --- API 키 및 모델 설정 ---
    const GEMINI_API_KEY = window.GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
        console.error("⛔️ 오류: Gemini API 키가 설정되지 않았습니다.");
        // 사용자에게 알림을 표시할 수 있습니다.
        return;
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // --- DOM 요소 참조 ---
    const aiInput = document.querySelector('.ai-input');
    const aiSearchBtn = document.querySelector('.ai-search-btn');
    const aiNotification = document.getElementById('ai-notification');
    
    // 모달 관련 요소
    const aiResultsModal = document.getElementById('ai-results-modal');
    const closeModalBtn = aiResultsModal.querySelector('.close-button');
    const modalFlightResultsContainer = document.getElementById('modal-flight-results');
    const aiStatusMessage = document.getElementById('ai-status-message');
    const aiLoadingStatus = modalFlightResultsContainer.querySelector('.ai-loading-status');
    const aiLoadingText = document.getElementById('ai-loading-text');
    const aiFinalResults = document.getElementById('ai-final-results');
    const aiInsightText = document.getElementById('ai-insight-text');
    const aiFlightCardsContainer = document.getElementById('ai-flight-cards');
    const aiRecommendationContainer = document.querySelector('.ai-recommendation-text');
    const aiAdditionalRecommendation = document.getElementById('ai-additional-recommendation');
    const aiFollowUpContainer = document.querySelector('.ai-follow-up-actions');
    const followUpButtonsContainer = aiFollowUpContainer.querySelector('.follow-up-buttons');

    // --- 상태 관리 변수 ---
    let isLoading = false;
    let currentSearchContext = {};
    let loadingTimeouts = [];

    // --- Lottie 애니메이션 설정 ---
    aiSearchBtn.innerHTML = ''; // 기존 아이콘 제거
    const lottieAnimation = lottie.loadAnimation({
        container: aiSearchBtn,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json'
    });
    lottieAnimation.addEventListener('DOMLoaded', () => {
        lottieAnimation.playSegments([90, 120], true); // 기본 상태
    });

    // --- 인터랙션 및 UI 함수 ---

    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement("span");
        ripple.className = 'ripple';
        button.appendChild(ripple);
        // Clean up the ripple element after the animation is done
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    function showNotification(message, type = 'warning', duration = 4000) {
        aiNotification.textContent = message;
        aiNotification.className = 'ai-notification'; // Reset classes
        aiNotification.classList.add(type, 'show');
        
        setTimeout(() => {
            aiNotification.classList.remove('show');
        }, duration);
    }

    function setLoadingState(loading) {
        isLoading = loading;
        aiSearchBtn.classList.toggle('loading', loading);
        aiInput.disabled = loading;
        if (loading) {
            lottieAnimation.playSegments([61, 89], true); // 로딩중 애니메이션
        } else {
            lottieAnimation.playSegments([90, 120], true); // 기본 상태로 복귀
        }
    }

    function runLoadingSequence() {
        loadingTimeouts.forEach(clearTimeout);
        loadingTimeouts = [];

        const messages = [
            { text: "최적의 출발지와 도착지를 찾는 중...", delay: 1500 },
            { text: "달력에서 날짜를 확인하고 있어요...", delay: 1500 },
            { text: "거의 다 됐습니다! 잠시만 기다려주세요...", delay: 2000 }
        ];

        let cumulativeDelay = 0;
        
        const updateText = (text) => {
            gsap.to(aiLoadingText, { opacity: 0, duration: 0.2, onComplete: () => {
                aiLoadingText.textContent = text;
                gsap.to(aiLoadingText, { opacity: 1, duration: 0.2 });
            }});
        };

        updateText("요청하신 내용을 분석 중입니다...");

        messages.forEach(message => {
            cumulativeDelay += message.delay;
            const timeout = setTimeout(() => updateText(message.text), cumulativeDelay);
            loadingTimeouts.push(timeout);
        });
    }

    function resetModal() {
        aiStatusMessage.style.display = 'block';
        aiLoadingStatus.style.display = 'none';
        aiFinalResults.style.display = 'none';
        
        // Clear dynamic content
        aiInsightText.textContent = '';
        aiFlightCardsContainer.innerHTML = '';
        aiAdditionalRecommendation.textContent = '';
        followUpButtonsContainer.innerHTML = '';
        aiRecommendationContainer.style.display = 'none';
        aiFollowUpContainer.style.display = 'none';
    }
    
    function createFlightCardHTML(flight) {
        // This is a template function. You should adapt it to your actual flight data structure.
        const isNonStop = flight.nonStop ? '직항' : `${flight.stops}회 경유`;
        // Dummy logo based on airline name
        const logoUrl = `https://logo.clearbit.com/${flight.airline.toLowerCase().replace(/\s/g, '')}.com`;
    
        return `
            <div class="ai-flight-card">
                <div class="airline-info">
                    <img src="${logoUrl}" alt="${flight.airline} 로고" class="airline-logo" onerror="this.style.display='none'">
                    <span class="airline-name">${flight.airline}</span>
                </div>
                <div class="flight-details">
                    <div class="flight-segment">
                        <div class="time-airport">
                            <div class="time">${flight.departureTime}</div>
                            <div class="airport-code">${flight.origin}</div>
                        </div>
                        <div class="duration-info">
                            <div class="duration">${flight.duration}</div>
                            <div class="arrow-line"></div>
                            <div class="stop-info">${isNonStop}</div>
                        </div>
                        <div class="time-airport">
                            <div class="time">${flight.arrivalTime}</div>
                            <div class="airport-code">${flight.destination}</div>
                        </div>
                    </div>
                </div>
                <div class="price-section">
                    <div>
                        <div class="price">${flight.price.toLocaleString()}</div>
                        <span class="currency">원</span>
                    </div>
                    <button class="select-btn">선택</button>
                </div>
            </div>
        `;
    }

    function renderResultsInModal(data) {
        // 1. Hide loading animation
        aiLoadingStatus.style.display = 'none';

        // 2. Show Insight
        aiInsightText.textContent = data.aiInsight || "AI가 추천하는 최적의 항공편입니다.";
        
        // 3. Render flight cards with animation
        aiFlightCardsContainer.innerHTML = '';
        data.flights.forEach(flight => {
            aiFlightCardsContainer.innerHTML += createFlightCardHTML(flight);
        });

        // 4. Render Additional Recommendation
        if (data.aiRecommendation) {
            aiAdditionalRecommendation.textContent = data.aiRecommendation;
            aiRecommendationContainer.style.display = 'block';
        }

        // 5. Render Follow-up actions
        if (data.followUpActions && data.followUpActions.length > 0) {
            followUpButtonsContainer.innerHTML = '';
            data.followUpActions.forEach(action => {
                followUpButtonsContainer.innerHTML += `<button class="ai-action-btn" data-query="${action.query}">${action.label}</button>`;
            });
            aiFollowUpContainer.style.display = 'block';
        }

        // 6. Show the final results container and animate cards
        aiFinalResults.style.display = 'flex';
        gsap.fromTo(".ai-flight-card", 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
    }
    
    // --- Main Search Logic ---
    async function handleAISearch(query) {
        if (isLoading) return;
        setLoadingState(true);
        
        // --- 1. Reset and Show Modal ---
        resetModal();
        aiStatusMessage.style.display = 'none';
        aiLoadingStatus.style.display = 'flex';
        aiResultsModal.style.display = 'flex';
        runLoadingSequence();
        
        try {
            // --- 2. Call Gemini API ---
            // Note: In a real app, include previous context for follow-up questions.
            const geminiPrompt = `
You are a helpful flight booking assistant. Extract parameters from the user query into a JSON object.
- The JSON should contain: origin (IATA), destination (IATA), departDate (YYYY-MM-DD), returnDate (YYYY-MM-DD or null), adults (number), travelClass (ECONOMY, BUSINESS, FIRST), nonStop (boolean).
- Also include a short, friendly "aiInsight" text summarizing what you understood.
- Today is ${new Date().toISOString().split('T')[0]}.
- User Query: "${query}"

Example Response:
\`\`\`json
{
  "origin": "ICN",
  "destination": "CJU",
  "departDate": "2024-10-25",
  "returnDate": null,
  "adults": 1,
  "travelClass": "ECONOMY",
  "nonStop": true,
  "aiInsight": "금요일에 서울에서 제주도로 가는 가장 저렴한 직항 항공편을 찾아볼게요!"
}
\`\`\`
`;
            const result = await model.generateContent(geminiPrompt);
            const responseText = result.response.text();
            console.log("[Gemini Response]", responseText);

            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch) throw new Error("AI 응답 형식이 올바르지 않습니다.");
            
            const params = JSON.parse(jsonMatch[1]);
            currentSearchContext = params; // Save context for follow-ups

            // --- 3. Call Flight Search API (using amadeus_search.js) ---
            // This is a MOCK. In a real scenario, amadeus_search.js would make an API call.
            // We pass our modal rendering function as a callback.
            if (window.performFlightSearch) {
                // The `performFlightSearch` function should be modified to accept a callback.
                // For demo, we'll call the callback directly with mock data.
                console.log("[Flight Search] Triggering search with params:", params);
                
                // MOCK DATA - a real implementation would get this from an API
                const mockFlightData = {
                    aiInsight: params.aiInsight,
                    aiRecommendation: "주말에 출발하는 항공편은 가격이 오를 수 있으니, 평일 출발도 고려해보세요!",
                    followUpActions: [
                        { label: "더 저렴한 날짜 찾아줘", query: "더 싼 날짜는 언제가 좋을까?" },
                        { label: "2명으로 검색", query: "2명이면 얼마야?" },
                        { label: "호텔도 추천해줘", query: "이 근처에 묵을만한 호텔 추천해줘" }
                    ],
                    flights: [
                        { airline: "T'way Air", origin: params.origin, destination: params.destination, departureTime: "09:30", arrivalTime: "10:40", duration: "1시간 10분", nonStop: true, stops: 0, price: 78000 },
                        { airline: "Asiana", origin: params.origin, destination: params.destination, departureTime: "10:00", arrivalTime: "11:15", duration: "1시간 15분", nonStop: true, stops: 0, price: 85000 },
                        { airline: "Korean Air", origin: params.origin, destination: params.destination, departureTime: "11:00", arrivalTime: "12:10", duration: "1시간 10분", nonStop: true, stops: 0, price: 92000 }
                    ]
                };

                // Simulate API delay
                setTimeout(() => {
                    renderResultsInModal(mockFlightData);
                }, 1000); // 1s delay

            } else {
                throw new Error("비행편 검색 기능을 찾을 수 없습니다.");
            }

        } catch (error) {
            console.error("[AI Search Error]", error);
            aiLoadingStatus.style.display = 'none';
            aiStatusMessage.textContent = `오류가 발생했습니다: ${error.message}`;
            aiStatusMessage.style.display = 'block';
        } finally {
            loadingTimeouts.forEach(clearTimeout);
            setLoadingState(false);
        }
    }


    // --- Event Listeners ---
    aiSearchBtn.addEventListener('click', (e) => {
        createRipple(e);
        const query = aiInput.value.trim();
        if (!query) {
            showNotification('검색어를 입력해주세요!', 'warning');
            gsap.fromTo(aiInput, {x: -5}, {x: 5, repeat: 5, yoyo: true, duration: 0.05, clearProps: "transform"});
            return;
        }
        handleAISearch(query);
    });
    
    aiInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
           aiSearchBtn.click();
        }
    });

    closeModalBtn.addEventListener('click', () => {
        aiResultsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == aiResultsModal) {
            aiResultsModal.style.display = 'none';
        }
    });

    // Event delegation for follow-up questions
    aiFollowUpContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('ai-action-btn')) {
            const newQuery = e.target.dataset.query;
            aiInput.value = newQuery;
            handleAISearch(newQuery);
        }
    });

    // ==================================================
    // === ✨ AI 태그 롤링 애니메이션 추가 ✨ ===
    // ==================================================
    const tagWrapper = document.querySelector('.tag-wrapper');
    const tagItems = document.querySelectorAll('.tag-item');

    if (tagWrapper && tagItems.length > 1) {
        const tagCount = tagItems.length;
        const tagHeight = tagItems[0].offsetHeight;
        let currentIndex = 0;

        // 자연스러운 반복을 위해 첫 번째 요소를 복제하여 맨 뒤에 추가
        const firstItemClone = tagItems[0].cloneNode(true);
        tagWrapper.appendChild(firstItemClone);

        // 3초마다 태그를 위로 롤링시키는 함수
        function rollTags() {
            currentIndex++; // 다음 인덱스로 이동

            gsap.to(tagWrapper, {
                y: -currentIndex * tagHeight, // y축으로 태그 높이만큼 이동
                duration: 0.7, // 애니메이션 속도
                ease: 'power2.inOut', // 부드러운 움직임 효과
                onComplete: () => {
                    // 마지막 요소(복제된 첫 번째 요소)에 도달하면
                    if (currentIndex === tagCount) {
                        // 애니메이션 없이 즉시 첫 위치로 리셋
                        gsap.set(tagWrapper, { y: 0 });
                        currentIndex = 0;
                    }
                }
            });
        }

        // 3초 간격으로 애니메이션 실행
        setInterval(rollTags, 3000);
    }
    
    console.log("[Gemini_Search] AI Flight Assistant features initialized.");
});