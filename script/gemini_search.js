import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";
import { IS_DEVELOPMENT_MODE } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log("[Gemini_Search] DOM content loaded. Initializing scripts.");

    // --- API 키 및 모델 설정 ---
    const GEMINI_API_KEY = window.GEMINI_API_KEY;
    let genAI, model;

    if (!IS_DEVELOPMENT_MODE) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
            console.error("⛔️ 오류: Gemini API 키가 설정되지 않았습니다.");
            return;
        }
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    // --- DOM 요소 참조 (초기 로드 시점) ---
    const aiInput = document.querySelector('.ai-input');
    const aiSearchBtn = document.querySelector('.ai-search-btn');
    const aiNotification = document.getElementById('ai-notification');
    const aiResultsModal = document.getElementById('ai-results-modal');
    const closeModalBtn = aiResultsModal.querySelector('.close-button');
    const modalFlightResultsContainer = document.getElementById('modal-flight-results');

    // These elements will be dynamically created/re-selected
    let aiStatusMessage, aiLoadingStatus, aiLoadingText, aiFinalResults, aiInsightText,
        aiFlightCardsContainer, aiRecommendationContainer, aiAdditionalRecommendation,
        aiFollowUpContainer, followUpButtonsContainer, aiLoadingLottieContainer;

    // --- 상태 관리 변수 ---
    let isLoading = false;
    let currentSearchContext = {}; // Not directly used in the provided snippet but kept for context
    let loadingTimeouts = [];

    // --- Lottie 애니메이션 설정 (메인 검색 버튼) ---
    aiSearchBtn.innerHTML = '';
    const lottieAnimation = lottie.loadAnimation({
        container: aiSearchBtn,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json'
    });
    lottieAnimation.addEventListener('DOMLoaded', () => {
        lottieAnimation.playSegments([90, 120], true);
    });

    // Modal Loading Lottie Animation
    let modalLottieAnimation;

    function initializeModalLottie() {
        // Ensure aiLoadingLottieContainer is selected first, as it's part of dynamic content
        aiLoadingLottieContainer = document.getElementById('ai-loading-lottie');
        if (aiLoadingLottieContainer && !modalLottieAnimation) {
            modalLottieAnimation = lottie.loadAnimation({
                container: aiLoadingLottieContainer,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json'
            });
            modalLottieAnimation.addEventListener('DOMLoaded', () => {
                modalLottieAnimation.playSegments([61, 89], true);
            });
        }
    }

    // --- 초기 모달 내용 설정 (AI 어시스턴트 박스) ---
    function initializeModalContent() {
        modalFlightResultsContainer.innerHTML = `
            <div class="ai-assistant-box">
                <div class="ai-header">
                    <span class="ai-badge">AI</span>
                    <strong><span class="bold">AI 항공권 어시스턴트</span></strong>
                    <span class="desc">자연어로 편리하게 항공권을 검색하고 추천받으세요</span>
                </div>
                <div class="ai-ip-box">
                    <img src="../../image/ai_search_cloud.png" alt="구름" class="ai-cloud" />
                    <div class="ai-input-box">
                        <input type="text" class="ai-input" placeholder="다음주 금요일 서울에서 제주도 가는 가장 저렴한 항공권 찾아줘" />
                        <button class="ai-search-btn"></button>
                        <div class="ai-notification" id="ai-notification"></div>
                    </div>
                    <div class="ai-tags">
                        <div class="tag-wrapper">
                            <span class="tag-item">✨ 자연어 검색</span>
                            <span class="tag-item">🎯 맞춤 추천</span>
                            <span class="tag-item">⚡ 실시간 비교</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ai-loading-status" id="ai-loading-status" style="display: none;">
                <div class="loading-wrapper">
                    <div class="ai-loading-lottie" id="ai-loading-lottie"></div>
                    <div class="main-loading-text" id="ai-loading-text"></div>
                    <div class="ai-loading-progress">
                        <div class="step" data-status="">
                            <span class="circle">1</span> 출발지/도착지 검색 중
                        </div>
                        <div class="step" data-status="">
                            <span class="circle">2</span> 항공권 날짜/가격 확인 중
                        </div>
                        <div class="step" data-status="">
                            <span class="circle">3</span> 이지님을 위한 최적의 항공권 추천 생성 중
                        </div>
                    </div>
                </div>
            </div>
            <div class="ai-final-results" id="ai-final-results" style="display: none;">
                <div class="ai-insight">
                    <span class="ai-insight-badge">INSIGHT</span>
                    <p id="ai-insight-text"></p>
                </div>
                <div id="ai-flight-cards"></div>
                <div class="ai-recommendation-text" style="display:none;">
                    <h3 class="ai-recommendation-title">💡 EZ AI의 추가 추천</h3>
                    <p id="ai-additional-recommendation"></p>
                </div>
                <div class="ai-follow-up-actions" style="display:none;">
                    <p class="ai-chat-bubble"></p>
                    <div class="follow-up-buttons"></div>
                </div>
            </div>
            <div class="ai-status-message" id="ai-status-message" style="display: none;"></div>
        `;

        // Re-select all relevant DOM elements after initializing content
        aiStatusMessage = document.getElementById('ai-status-message');
        aiLoadingStatus = document.getElementById('ai-loading-status');
        aiLoadingText = document.getElementById('ai-loading-text');
        aiFinalResults = document.getElementById('ai-final-results');
        aiInsightText = document.getElementById('ai-insight-text');
        aiFlightCardsContainer = document.getElementById('ai-flight-cards');
        aiRecommendationContainer = modalFlightResultsContainer.querySelector('.ai-recommendation-text');
        aiAdditionalRecommendation = document.getElementById('ai-additional-recommendation');
        aiFollowUpContainer = modalFlightResultsContainer.querySelector('.ai-follow-up-actions');
        followUpButtonsContainer = aiFollowUpContainer.querySelector('.follow-up-buttons');
        aiLoadingLottieContainer = document.getElementById('ai-loading-lottie');

        // Re-initialize tag rolling animation if it's inside the modal content
        const tagWrapper = modalFlightResultsContainer.querySelector('.tag-wrapper');
        const tagItems = modalFlightResultsContainer.querySelectorAll('.tag-item');
        if (tagWrapper && tagItems.length > 1) {
            const tagCount = tagItems.length;
            const tagHeight = tagItems[0].offsetHeight;
            let currentIndex = 0;
            const firstItemClone = tagItems[0].cloneNode(true);
            tagWrapper.appendChild(firstItemClone);

            // Clear existing interval if any to prevent multiple intervals
            if (tagWrapper._tagInterval) {
                clearInterval(tagWrapper._tagInterval);
            }

            function rollTags() {
                currentIndex++;
                gsap.to(tagWrapper, {
                    y: -currentIndex * tagHeight,
                    duration: 0.7,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (currentIndex === tagCount) {
                            gsap.set(tagWrapper, { y: 0 });
                            currentIndex = 0;
                        }
                    }
                });
            }
            tagWrapper._tagInterval = setInterval(rollTags, 3000); // Store interval ID
        }
    }

    // Call initializeModalContent once to set up the initial modal state
    initializeModalContent();

    // --- 인터랙션 및 UI 함수 ---
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement("span");
        ripple.className = 'ripple';
        button.appendChild(ripple);
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    function showNotification(message, type = 'warning', duration = 4000) {
        aiNotification.textContent = message;
        aiNotification.className = 'ai-notification';
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
            lottieAnimation.playSegments([61, 89], true);
            if (modalLottieAnimation) modalLottieAnimation.play();
        } else {
            lottieAnimation.playSegments([90, 120], true);
            if (modalLottieAnimation) modalLottieAnimation.stop();
        }
    }

    function updateLoadingStep(index, status) {
        const steps = document.querySelectorAll('.ai-loading-progress .step');
        if (steps[index]) {
            steps[index].setAttribute('data-status', status);
            gsap.fromTo(steps[index],
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
            );
        }
    }

    function runLoadingSequence() {
        loadingTimeouts.forEach(clearTimeout);
        loadingTimeouts = [];
        const messages = [
            { text: "최적의 출발지와 도착지를 찾는 중...", delay: 2000 },
            { text: "달력에서 날짜를 확인하고 있어요...", delay: 2000 },
            { text: "거의 다 됐습니다! 잠시만 기다려주세요...", delay: 4000 }
        ];

        let cumulativeDelay = 0;
        updateLoadingStep(0, 'active');

        const updateText = (text) => {
            gsap.to(aiLoadingText, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    aiLoadingText.innerHTML = text; // Use innerHTML to preserve <br>
                    gsap.to(aiLoadingText, { opacity: 1, duration: 0.2 });
                }
            });
        };

        updateText("EZ AI가 이지님을 위한<br>최적의 항공권 티켓을 찾고 있어요.");

        messages.forEach((message, index) => {
            cumulativeDelay += message.delay;
            const timeout = setTimeout(() => {
                updateText(message.text);
                updateLoadingStep(index, 'done');
                if (index < messages.length) {
                    updateLoadingStep(index + 1, 'active');
                }
            }, cumulativeDelay);
            loadingTimeouts.push(timeout);
        });
    }

    function resetModal() {
        // Hide all dynamic content containers first
        aiStatusMessage.style.display = 'none';
        aiLoadingStatus.style.display = 'none';
        aiFinalResults.style.display = 'none';

        // Clear content or reset specific elements
        aiInsightText.textContent = '';
        aiFlightCardsContainer.innerHTML = '';
        aiAdditionalRecommendation.textContent = '';
        followUpButtonsContainer.innerHTML = '';
        aiRecommendationContainer.style.display = 'none';
        aiFollowUpContainer.style.display = 'none';
        document.querySelectorAll('.ai-loading-progress .step').forEach(step => step.setAttribute('data-status', ''));

        if (modalLottieAnimation) {
            modalLottieAnimation.stop();
            // Optional: Destroy Lottie animation to free resources if re-initialized often
            // modalLottieAnimation.destroy();
            // modalLottieAnimation = null;
        }

        // Show the initial AI Assistant Box
        modalFlightResultsContainer.querySelector('.ai-assistant-box').style.display = 'block';
    }

    function createFlightCardHTML(flight) {
        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const options = { month: 'long', day: 'numeric', weekday: 'short' };
            return date.toLocaleDateString('ko-KR', options).replace('.', '');
        };
        const formatTime = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        };
        return `
            <div class="ai-flight-card${flight.recommendation ? ' highlight' : ''}">
                <div class="flight-card-header">
                    <img src="${flight.airlineLogo}" alt="${flight.airline} 로고" class="airline-logo" onerror="this.src='../../image/airline_logos/default.png'">
                    <span class="airline-name">${flight.airline}</span>
                    ${flight.recommendation ? `<span class="badge ${flight.recommendation}">${flight.recommendation === 'direct' ? '직항' : flight.recommendation === 'special' ? '특가' : '추천'}</span>` : ''}
                </div>
                <div class="flight-card-main">
                    <div class="flight-info">
                        <div class="time-airport">
                            <span class="airport">${flight.origin}</span>
                            <span class="flight-time">${formatTime(flight.departureTime)}</span>
                            <span class="date">${formatDate(flight.departureTime)}</span>
                        </div>
                        <span class="arrow">→</span>
                        <div class="time-airport">
                            <span class="airport">${flight.destination}</span>
                            <span class="flight-time">${formatTime(flight.arrivalTime)}</span>
                            <span class="date">${formatDate(flight.arrivalTime)}</span>
                        </div>
                    </div>
                    <div class="flight-details">
                        <span class="flight-duration">${flight.duration}</span>
                        <span class="class">ECONOMY</span>
                        <span class="price">${flight.price.amount.toLocaleString()} ${flight.price.currency}</span>
                    </div>
                </div>
                <button class="select-btn">예매하기</button>
            </div>
        `;
    }

    async function fetchFlightData(query) {
        if (IS_DEVELOPMENT_MODE) {
            // --- 여기서 인위적으로 2초 딜레이 추가 ---
            await new Promise(res => setTimeout(res, 6000)); // 2초간 로딩 UI 보여줌

            try {
                const response = await fetch('./dummy_flights.json');
                if (!response.ok) throw new Error('Failed to load dummy data');
                const data = await response.json();
                // Check if query is for Seoul to New York
                if (query.toLowerCase().includes('서울') && query.toLowerCase().includes('뉴욕')) {
                    return data.seoul_newyork_flights;
                } else {
                    return data.no_results;
                }
            } catch (error) {
                console.error('Error loading dummy data:', error);
                throw error;
            }
        } else {
            // Use Gemini API in production
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
  ""destination": "CJU",
  "departDate": "2024-10-25",
  "returnDate": null,
  "adults": 1,
  "travelClass": "ECONOMY",
  "nonStop": true,
  "aiInsight": "금요일에 서울에서 제주도로 가는 가장 저렴한 직항 항공편을 찾아볼게요!"
}
\`\`\`
`;
            try {
                const result = await model.generateContent(geminiPrompt);
                const responseText = result.response.text();
                console.log("[Gemini Response]", responseText);
                const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
                if (!jsonMatch) throw new Error("AI 응답 형식이 올바르지 않습니다.");
                const params = JSON.parse(jsonMatch[1]);
                // Mock flight data for Gemini API (replace with actual API call if available)
                return {
                    aiInsight: params.aiInsight,
                    additional_recommendation: "주말에 출발하는 항공편은 가격이 오를 수 있으니, 평일 출발도 고려해보세요!",
                    followUpActions: [
                        { label: "더 저렴한 날짜 찾아줘", query: "더 싼 날짜는 언제가 좋을까?" },
                        { label: "2명으로 검색", query: "2명이면 얼마야?" },
                        { label: "호텔도 추천해줘", query: "이 근처에 묵을만한 호텔 추천해줘" }
                    ],
                    flights: [
                        {
                            airline: "Korean Air",
                            airlineLogo: "../../image/airline_logos/korean_air.png",
                            flightNumber: "KE081",
                            origin: params.origin,
                            destination: params.destination,
                            departureTime: "2025-07-01T09:30:00",
                            arrivalTime: "2025-07-01T12:40:00",
                            duration: "14h 10m",
                            price: { amount: 1200000, currency: "KRW" },
                            direct: params.nonStop,
                            recommendation: "recommend"
                        }
                    ]
                };
            } catch (error) {
                console.error('Gemini API Error:', error);
                throw error;
            }
        }
    }

    function renderResultsInModal(data) {
        // Hide initial assistant box and loading status
        modalFlightResultsContainer.querySelector('.ai-assistant-box').style.display = 'none';
        aiLoadingStatus.style.display = 'none';

        // Populate results
        aiInsightText.textContent = data.aiInsight || "AI가 추천하는 최적의 항공편입니다.";
        aiFlightCardsContainer.innerHTML = ''; // Clear previous flight cards

        if (data.flights && data.flights.length > 0) {
            data.flights.forEach(flight => {
                aiFlightCardsContainer.innerHTML += createFlightCardHTML(flight);
            });
            aiFlightCardsContainer.querySelectorAll('.select-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('.ai-flight-card');
                    gsap.to(card, {
                        boxShadow: '0 0 20px rgba(25, 135, 250, 0.5)',
                        duration: 0.3,
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            showNotification('예매 페이지로 이동합니다!', 'success', 2000);
                            setTimeout(() => window.location.href = 'booking.html', 1000);
                        }
                    });
                });
            });
        } else {
            aiFlightCardsContainer.innerHTML = '<p>항공편을 찾을 수 없습니다.</p>';
        }

        if (data.additional_recommendation) {
            aiAdditionalRecommendation.textContent = data.additional_recommendation;
            aiRecommendationContainer.style.display = 'block';
        } else {
            aiRecommendationContainer.style.display = 'none';
        }

        if (data.followUpActions && data.followUpActions.length > 0) {
            followUpButtonsContainer.innerHTML = ''; // Clear previous follow-up buttons
            data.followUpActions.forEach(action => {
                followUpButtonsContainer.innerHTML += `
                    <button class="ai-action-btn" data-query="${action.query}">
                        <span class="icon">🤔</span> ${action.label}
                    </button>`;
            });
            aiFollowUpContainer.querySelector('.ai-chat-bubble').textContent = "💡 이런 것도 궁금하신가요?";
            aiFollowUpContainer.style.display = 'block';
        } else {
            aiFollowUpContainer.style.display = 'none';
        }

        // Show the final results section
        aiFinalResults.style.display = 'flex';
        gsap.fromTo(".ai-flight-card",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );

        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        aiResultsModal.appendChild(confettiContainer);
        lottie.loadAnimation({
            container: confettiContainer,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            path: 'https://lottie.host/81a94207-6f8d-4f1a-b605-2436893dd0ce/Y7v1z0e7vV.json'
        });
        setTimeout(() => confettiContainer.remove(), 3000);
    }

    async function handleAISearch(query) {
        if (isLoading) return;
        setLoadingState(true);

        // Hide the initial AI assistant box
        modalFlightResultsContainer.querySelector('.ai-assistant-box').style.display = 'none';

        // Show loading status and modal
        aiLoadingStatus.style.display = 'flex';
        aiResultsModal.style.display = 'flex';
        aiResultsModal.classList.add('show');

        // Initialize Lottie and run sequence AFTER making loading status visible
        initializeModalLottie();
        runLoadingSequence();

        try {
            const data = await fetchFlightData(query);
            renderResultsInModal(data);
        } catch (error) {
            console.error("[AI Search Error]", error);
            // Hide loading status and show error message
            aiLoadingStatus.style.display = 'none';
            aiFinalResults.style.display = 'none'; // Ensure results are hidden
            aiStatusMessage.textContent = `오류가 발생했습니다: ${error.message}`;
            aiStatusMessage.style.display = 'block';

            // Add retry button if it's not already there
            if (!aiStatusMessage.querySelector('.retry-btn')) {
                const retryBtn = document.createElement('button');
                retryBtn.className = 'retry-btn';
                retryBtn.textContent = '재시도';
                retryBtn.addEventListener('click', () => handleAISearch(query));
                aiStatusMessage.appendChild(retryBtn);
            }
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
        if (e.key === 'Enter') {
            aiSearchBtn.click();
        }
    });

    closeModalBtn.addEventListener('click', () => {
        aiResultsModal.classList.remove('show');
        setTimeout(() => {
            aiResultsModal.style.display = 'none';
            resetModal(); // Reset content to initial state on close
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target == aiResultsModal) {
            aiResultsModal.classList.remove('show');
            setTimeout(() => {
                aiResultsModal.style.display = 'none';
                resetModal(); // Reset content to initial state on close
            }, 300);
        }
    });

    // Event delegation for follow-up buttons, as they are dynamically added
    // This listener should be on a static parent, like modalFlightResultsContainer
    modalFlightResultsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('ai-action-btn')) {
            const newQuery = e.target.dataset.query;
            aiInput.value = newQuery;
            handleAISearch(newQuery);
        }
    });

    // Accessibility: Focus management
    aiResultsModal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = aiResultsModal.querySelectorAll(
                'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (e.shiftKey && (document.activeElement === firstElement || !aiResultsModal.contains(document.activeElement))) {
                lastElement.focus();
                e.preventDefault();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });

    console.log("[Gemini_Search] AI Flight Assistant features initialized.");
});