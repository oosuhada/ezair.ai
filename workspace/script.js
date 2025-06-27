// Data for destinations
const destinationsData = [
    {
        id: 'ny',
        name: '뉴욕, 서밋 원 반더빌트 투어',
        type: ['city', 'adventure', 'culture'],
        aiMatch: 95,
        aiReason: '뉴욕의 화려한 도시와 아름다운 문화예술을 즐기고 싶은 당신을 위한 완벽한 선택',
        aiInfo: '원 반더빌트는 뉴욕에서 네 번째로 높은 마천루로, <br>서밋 전망대는 가장 인기 있는 전망대 중 하나입니다.',
        price: '₩450,000',
        duration: '5일 4박',
        image: '../../../image/keyword_ny1.png',
        description: '뉴욕의 화려한 도시와 아름다운 문화예술을 즐기고 싶은 당신을 위한 완벽한 선택',
        keywords: ['도시', '액티비티','예술']
    },
    {
        id: 'bali',
        name: '브루클린, 브리지와 덤보 가이드 도보 투어',
        type: ['nature', 'culture', 'relaxation'],
        aiMatch: 90,
        aiReason: '뉴욕의 상징적인 건축물과 도시의 풍경을 즐기고 싶은 당신을 위한 완벽한 선택',
        aiInfo: '맨해튼에서 브루클린까지 가이드가 안내하는<br> 뉴욕 시내 도보 투어를 즐겨보세요. ',
        price: '₩270,000',
        duration: '7일 6박',
        image: '../../../image/keyword_02.png',
        description: '아름다운 해변, 울창한 정글, 고대 사원을 탐험하며 몸과 마음을 치유하세요.',
        keywords: ['도시', '관광', '역사']
    },
    {
        id: 'tokyo',
        name: '나이아가라, 폭포 가이드 투어',
        type: ['nature', 'culture', 'relaxation'],
        aiMatch: 88,
        aiReason: '뉴욕의 아름다운 자연환경을 경험하고 싶은 당신을 위한 완벽한 선택',
        aiInfo: '뉴욕에서 하룻밤 여행을 떠나 나이아가라 폭포의 장관을 감상하세요.',
        price: '₩320,000',
        duration: '4일 3박',
        image: '../../../image/keyword_03.png',
        description: '현대적인 스카이라인, 전통 사찰, 그리고 활기찬 거리에서 일본의 매력을 느껴보세요.',
        keywords: ['자연', '관광', '보트여행']
    },
    {
        id: 'santorini',
        name: '엘리스 아일랜드, 자유의 여신상 & 페리',
        type: ['nature', 'city', 'romantic'],
        aiMatch: 94,
        aiReason: '미국의 상징적인 건축물과 역사적 상징을 감상하고 싶은 당신을 위한 완벽한 추천',
        aiInfo: '뉴욕 항구를 통과하는 수백만 명의 이민자들을 맞이했던<br> 미국의 상징인 자유의 여신상을 만나보세요.',
        price: '₩210,000',
        duration: '6일 5박',
        image: '../../../image/keyword_04.png',
        description: '하얀 집들과 푸른 바다가 어우러진 절경, 세계 3대 석양을 감상하며 잊지 못할 추억을 만드세요.',
        keywords: ['역사', '관광', '문화예술']
    },
    {
        id: 'quebec-city',
        name: '미드타운, 엠파이어 스테이트 빌딩 전망대',
        type: ['city', 'adventure'],
        aiMatch: 85,
        aiReason: '뉴욕의 아름다운 자연환경을 경험하고 싶은 당신을 위한 완벽한 선택',
        aiInfo: '뉴욕에서 하룻밤 여행을 떠나 나이아가라 폭포의 장관을<br>감상하세요.',
        price: '₩320,000',
        duration: '6일 5박',
        image: '../../../image/keyword_05.png',
        description: '로키 산맥의 심장부, 밴프 국립공원에서 하이킹, 스키, 카누를 즐겨보세요.',
        keywords: ['도시', '건물', '역사']
    },
    {
        id: 'banff',
        name: '센트럴파크, TV & 영화 촬영지 도보 투어',
        type: ['city', 'adventure'],
        aiMatch: 82,
        aiReason: '뉴욕의 아름다운 자연환경을 경험하고 싶은 당신을 위한 완벽한 선택',
        aiInfo: '뉴욕에서 하룻밤 여행을 떠나 나이아가라 폭포의 장관을<br>감상하세요.',
        price: '₩320,000',
        duration: '6일 5박',
        image: '../../../image/keyword_06.png',
        description: '로키 산맥의 심장부, 밴프 국립공원에서 하이킹, 스키, 카누를 즐겨보세요.',
        keywords: ['자연', '호수', '도시']
    }
];

let currentIndex = 0;
let filteredDestinations = destinationsData;

// --- Modal Functions ---
function showMessageModal(title, message) {
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h2 class="modal-title">${title}</h2>
            <p class="modal-message">${message}</p>
            <button class="modal-close-button" onclick="this.closest('.modal-overlay').remove()">확인</button>
        </div>
    `;
    document.body.appendChild(modalOverlay);
    setTimeout(() => modalOverlay.classList.add('open'), 10);
}

// --- Word Cloud Functions ---
function renderWordCloud() {
    const svg = document.getElementById('word-cloud-svg');
    const staticElements = svg.querySelectorAll('path, circle');
    svg.innerHTML = '';
    staticElements.forEach(el => svg.appendChild(el.cloneNode(true)));

    const svgWidth = svg.viewBox.baseVal.width;
    const svgHeight = svg.viewBox.baseVal.height;

    filteredDestinations.forEach(dest => {
        const fontSize = 16 + (dest.aiMatch / 100) * 16;
        const colorHue = 240 - (dest.aiMatch - 80) * 5;
        const color = `hsl(${colorHue}, 70%, 50%)`;

        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute('class', 'word');
        textElement.setAttribute('x', Math.random() * (svgWidth * 0.7 - 50) + 50);
        textElement.setAttribute('y', Math.random() * (svgHeight * 0.7 - 50) + 50);
        textElement.setAttribute('font-size', fontSize);
        textElement.setAttribute('fill', color);
        textElement.setAttribute('data-id', dest.id);
        textElement.setAttribute('tabindex', '0');
        textElement.setAttribute('role', 'button');
        textElement.setAttribute('aria-label', `Select ${dest.name.split(',')[0]}`);
        textElement.textContent = dest.name.split(',')[0];

        textElement.onclick = () => {
            const index = filteredDestinations.findIndex(d => d.id === dest.id);
            if (index !== -1) {
                currentIndex = index;
                updateCarousel();
            }
        };
        textElement.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                textElement.click();
            }
        };

        const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tooltip.setAttribute('class', 'word-tooltip');
        tooltip.setAttribute('x', parseFloat(textElement.getAttribute('x')) + 30);
        tooltip.setAttribute('y', parseFloat(textElement.getAttribute('y')) + 20);
        tooltip.textContent = `${dest.aiMatch}% match for ${dest.aiReason.toLowerCase()}`;
        tooltip.style.pointerEvents = 'none';

        svg.appendChild(textElement);
        svg.appendChild(tooltip);
    });

    if (filteredDestinations.length > 0) {
        activateWord(filteredDestinations[currentIndex].id);
    }
}

function activateWord(id) {
    document.querySelectorAll('.word').forEach(word => {
        word.classList.toggle('active', word.getAttribute('data-id') === id);
    });
}

function filterKeywords(type) {
    filteredDestinations = destinationsData.filter(dest => type === 'all' || dest.type.includes(type));
    currentIndex = 0;

    document.querySelectorAll('.word').forEach(word => {
        const destId = word.getAttribute('data-id');
        const destination = destinationsData.find(d => d.id === destId);
        if (destination) {
            word.classList.toggle('filtered-out', !(type === 'all' || destination.type.includes(type)));
        }
    });

    if (filteredDestinations.length === 0) {
        showMessageModal('정보 없음', '선택된 필터에 해당하는 추천 여행지가 없습니다.');
        document.getElementById('recommendation-grid').innerHTML = '<p class="no-recommendations-message">선택된 필터에 해당하는 추천이 없습니다.</p>';
        updateNavigationButtons();
        return;
    }
    updateCarousel();
}

function shuffleKeywords() {
    renderWordCloud();
    const currentFilter = document.getElementById('category-filter').value;
    filterKeywords(currentFilter);
    showMessageModal('새로운 추천 보기', 'AI가 새로운 추천 패턴을 생성 중입니다.');
}

// --- Carousel Functions ---
function renderCarouselCard(destination) {
    const cardDiv = document.createElement('div');
    cardDiv.id = `${destination.id}-card`;
    cardDiv.classList.add('card');
    cardDiv.innerHTML = `
        <div class="card-container">
                <div id="card-con-left">
                    <div class="card-image-wrap">
                        <img src="${destination.image}" alt="${destination.name}" class="card-image">
                        <span class="card-badge"><img src="../../image/ai-fill.svg">BEST</span>
                    </div>

                </div>
                <div id="card-con-right">
                    <div class="card-content-wrapper">
                        <div class="card-info-top">
                            <span>${destination.duration} | 인천 출발</span>
                        </div>
                        <h3>${destination.name}</h3>
                        <div class="card-tags">
                            ${destination.keywords.map(keyword => `<span
                                class="card-tag-item">#${keyword}</span>`).join('')}
                        </div>
                        <div class="ai-info-text1">
                            <span class="ai-info-text2">${destination.aiInfo}</span>
                        </div>
                        <div class="ai-match-info">
                            <div class="ai-info-icon"><img src="../../image/ai-fill.svg" alt="AI 추천 아이콘"
                                    class="ai-match-icon">
                                <div class="ai-match-text">AI 추천 ${destination.aiMatch}% 일치</div>
                            </div>

                            <span class="ai-reason-text">${destination.aiReason}</span>
                        </div>
                    </div>
                    <div class="price-bt">
                    <p class="price-info">성인 1인 <strong
                            class="card-price">${destination.price}</strong> 부터</p>
                        <button class="book-now-button glow-button"
                            onclick="showMessageModal('예약하기', '${destination.name} 패키지 예약을 진행합니다.')"
                            aria-label="Book ${destination.name} package">
                            항공권 및 패키지 예매
                        </button>
                    </div>
                </div>
            </div>
    `;
    return cardDiv;
}

function updateCarousel() {
    const grid = document.getElementById('recommendation-grid');
    grid.innerHTML = '';
    filteredDestinations.forEach(dest => {
        const card = renderCarouselCard(dest);
        grid.appendChild(card);
    });
    grid.style.transform = `translateX(-${currentIndex * 100}%)`;
    if (filteredDestinations.length > 0) {
        activateWord(filteredDestinations[currentIndex].id);
    }
    updateNavigationButtons();
}

function navigateCards(direction) {
    if (direction === -1 && currentIndex > 0) {
        currentIndex--;
    } else if (direction === 1 && currentIndex < filteredDestinations.length - 1) {
        currentIndex++;
    } else {
        showMessageModal('더 이상 이동할 수 없습니다', '이동할 다음 또는 이전 추천이 없습니다.');
        return;
    }
    updateCarousel();
}

function updateNavigationButtons() {
    const leftButton = document.querySelector('.carousel-button.left');
    const rightButton = document.querySelector('.carousel-button.right');
    if (leftButton) leftButton.disabled = currentIndex === 0;
    if (rightButton) rightButton.disabled = currentIndex === filteredDestinations.length - 1;
}

// Initial setup
window.addEventListener('load', function () {
    const tripButtons = document.querySelectorAll('.trip-btn');
    tripButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tripButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    function setupToggleRadio(id) {
        const radio = document.getElementById(id);
        if (!radio) return;
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

    setupToggleRadio('radio1');
    setupToggleRadio('radio2');

    renderWordCloud();
    updateCarousel();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') navigateCards(-1);
        if (e.key === 'ArrowRight') navigateCards(1);
    });

    // GSAP animations
    gsap.from(".ai-recommendation-section h2", {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".ai-recommendation-section",
            start: "top 80%",
            toggleActions: "play none none none",
        }
    });

    gsap.from(".ai-keywords-panel", {
        opacity: 0,
        x: -100,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".ai-recommendation-section",
            start: "top 80%",
            toggleActions: "play none none none",
        }
    });

    gsap.from(".ai-recommendation-cards-panel", {
        opacity: 0,
        x: 100,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.2,
        scrollTrigger: {
            trigger: ".ai-recommendation-section",
            start: "top 80%",
            toggleActions: "play none none none",
        }
    });
});

