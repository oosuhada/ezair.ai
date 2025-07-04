document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.querySelector('.ai-input');
    const aiSearchBtn = document.querySelector('.ai-search-btn');
    const aiNotification = document.getElementById('ai-notification');
    const aiResultsModal = document.getElementById('ai-results-modal');
    const modalContent = aiResultsModal?.querySelector('.modal-content');
    const modalFlightResultsContainer = document.getElementById('modal-flight-results');
    const closeModalBtn = aiResultsModal?.querySelector('.close-button');

    if (!aiInput || !aiSearchBtn || !aiResultsModal || !modalFlightResultsContainer || !closeModalBtn) {
        console.warn('[EZ AI] 필수 DOM 요소를 찾지 못해 AI 검색을 초기화하지 않았습니다.');
        return;
    }

    let isLoading = false;
    let currentContext = null;
    let currentFlights = [];
    let selectedCompareIds = new Set();
    let previewAbortController = null;
    let previewTimer = null;

    const assistantAnimationUrl = 'https://gist.githubusercontent.com/oosuhada/10350c165ecf9363a48efa8f67aaa401/raw/ea144b564bea1a65faffe4b6c52f8cc1275576de/ai-assistant-logo.json';

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function showNotification(message, type = 'warning') {
        if (!aiNotification) return;
        aiNotification.textContent = message;
        aiNotification.className = `ai-notification ${type} show`;
        window.setTimeout(() => aiNotification.classList.remove('show'), 3200);
    }

    function setupLottieButton() {
        if (!window.lottie) {
            aiSearchBtn.textContent = 'AI';
            return;
        }
        aiSearchBtn.innerHTML = '';
        try {
            const animation = window.lottie.loadAnimation({
                container: aiSearchBtn,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: assistantAnimationUrl,
            });
            animation.addEventListener('DOMLoaded', () => animation.playSegments([90, 120], true));
        } catch {
            aiSearchBtn.textContent = 'AI';
        }
    }

    function ensureIntentPreview() {
        let preview = document.querySelector('.ai-intent-preview');
        if (preview) return preview;
        preview = document.createElement('div');
        preview.className = 'ai-intent-preview';
        preview.setAttribute('aria-live', 'polite');
        const assistantBox = aiInput.closest('.ai-assistant-box');
        assistantBox?.appendChild(preview);
        return preview;
    }

    function renderSummaryChips(summary = [], target = ensureIntentPreview()) {
        if (!target) return;
        if (!summary.length) {
            target.innerHTML = '';
            target.classList.remove('show');
            return;
        }
        target.innerHTML = summary.map((item) => `
            <span class="ai-intent-chip">
                <span class="ai-intent-chip-label">${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
            </span>
        `).join('');
        target.classList.add('show');
    }

    async function requestJson(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(data.error || '요청을 처리하지 못했어요.');
            error.payload = data;
            throw error;
        }
        return data;
    }

    async function previewIntent(query) {
        if (query.trim().length < 4) {
            renderSummaryChips([]);
            return;
        }
        previewAbortController?.abort();
        previewAbortController = new AbortController();
        try {
            const data = await requestJson('/api/ai-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context: null }),
                signal: previewAbortController.signal,
            });
            renderSummaryChips(data.summary || []);
        } catch (error) {
            if (error.name !== 'AbortError') console.debug('[EZ AI] intent preview skipped:', error.message);
        }
    }

    function renderModalShell() {
        modalFlightResultsContainer.innerHTML = `
            <div class="ezai-loading" id="ezai-loading" hidden>
                <div class="ezai-loading-mark" id="ezai-loading-mark" aria-hidden="true"></div>
                <p class="ezai-loading-title">EZ AI가 여행 문장을 이해하고 있어요</p>
                <div class="ezai-loading-steps">
                    <div class="ezai-step" data-step="intent"><span>1</span><strong>여행 조건 이해</strong></div>
                    <div class="ezai-step" data-step="search"><span>2</span><strong>항공편 검색</strong></div>
                    <div class="ezai-step" data-step="rank"><span>3</span><strong>가격·시간 비교</strong></div>
                </div>
            </div>
            <div class="ezai-results" id="ezai-results" hidden>
                <div class="ezai-results-head">
                    <div>
                        <span class="ezai-kicker">EZ AI SEARCH</span>
                        <h3>검색 조건을 이해했어요</h3>
                    </div>
                    <span class="ezai-source" id="ezai-source"></span>
                </div>
                <div class="ezai-result-intent" id="ezai-result-intent"></div>
                <div class="ai-insight ezai-insight">
                    <span class="ai-insight-badge">INSIGHT</span>
                    <p id="ezai-insight-text"></p>
                </div>
                <div class="ezai-provider-note" id="ezai-provider-note" hidden></div>
                <section class="ezai-compare" id="ezai-compare" hidden>
                    <div class="ezai-section-head">
                        <div><span>COMPARE</span><strong>선택한 항공편 비교</strong></div>
                        <button type="button" class="ezai-link-btn" id="ezai-compare-clear">모두 비우기</button>
                    </div>
                    <div class="ezai-compare-grid" id="ezai-compare-grid"></div>
                </section>
                <div class="ezai-flight-list" id="ezai-flight-list"></div>
                <form class="ezai-modify" id="ezai-modify-form">
                    <div>
                        <span class="ezai-kicker">이어 검색하기</span>
                        <strong>조건을 다시 입력하지 않아도 돼요</strong>
                    </div>
                    <div class="ezai-modify-input-row">
                        <input id="ezai-modify-input" type="text" placeholder="예: 하루 늦춰줘 · 2명으로 바꿔줘 · 직항만 보여줘" autocomplete="off">
                        <button type="submit">다시 찾기</button>
                    </div>
                </form>
                <div class="ezai-followups" id="ezai-followups"></div>
            </div>
            <div class="ezai-error" id="ezai-error" hidden></div>
        `;

        const loadingMark = document.getElementById('ezai-loading-mark');
        if (window.lottie && loadingMark) {
            try {
                window.lottie.loadAnimation({ container: loadingMark, renderer: 'svg', loop: true, autoplay: true, path: assistantAnimationUrl });
            } catch { /* visual enhancement only */ }
        }

        document.getElementById('ezai-modify-form')?.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = document.getElementById('ezai-modify-input');
            const query = input?.value.trim();
            if (query) handleAISearch(query, { preserveContext: true });
        });
        document.getElementById('ezai-compare-clear')?.addEventListener('click', () => {
            selectedCompareIds = new Set();
            renderCompare();
            renderFlights(currentFlights);
        });
    }

    function setStep(step, state) {
        const el = document.querySelector(`.ezai-step[data-step="${step}"]`);
        if (!el) return;
        el.dataset.status = state;
    }

    function setLoadingState(loading) {
        isLoading = loading;
        aiSearchBtn.classList.toggle('loading', loading);
        aiInput.disabled = loading;
    }

    function openModal() {
        aiResultsModal.style.display = 'flex';
        requestAnimationFrame(() => aiResultsModal.classList.add('show'));
        modalContent?.setAttribute('tabindex', '-1');
        modalContent?.focus({ preventScroll: true });
    }

    function closeModal() {
        aiResultsModal.classList.remove('show');
        window.setTimeout(() => {
            aiResultsModal.style.display = 'none';
            aiInput.focus();
        }, 260);
    }

    function formatTime(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '--:--';
        return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
    }

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' }).format(date);
    }

    function formatPrice(price) {
        const amount = Number(price?.amount || 0);
        const currency = price?.currency || 'KRW';
        try {
            return new Intl.NumberFormat('ko-KR', { style: 'currency', currency, maximumFractionDigits: currency === 'KRW' ? 0 : 2 }).format(amount);
        } catch {
            return `${amount.toLocaleString('ko-KR')} ${currency}`;
        }
    }

    function getLabels(flights) {
        const labels = new Map();
        if (!flights.length) return labels;
        const currency = flights[0].price?.currency;
        const sameCurrency = flights.filter((flight) => flight.price?.currency === currency && Number(flight.price?.amount) > 0);
        const cheapest = [...sameCurrency].sort((a, b) => Number(a.price.amount) - Number(b.price.amount))[0];
        const fastest = [...flights].filter((flight) => flight.durationMinutes > 0).sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
        if (cheapest) labels.set(cheapest.id, ['최저가']);
        if (fastest) labels.set(fastest.id, [...(labels.get(fastest.id) || []), '최단시간']);

        const prices = sameCurrency.map((flight) => Number(flight.price.amount));
        const durations = flights.map((flight) => Number(flight.durationMinutes || 0)).filter(Boolean);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);
        let best = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const flight of flights) {
            if (flight.price?.currency !== currency || !flight.durationMinutes) continue;
            const priceScore = maxPrice === minPrice ? 0 : (flight.price.amount - minPrice) / (maxPrice - minPrice);
            const durationScore = maxDuration === minDuration ? 0 : (flight.durationMinutes - minDuration) / (maxDuration - minDuration);
            const stopPenalty = Number(flight.stops || 0) * 0.18;
            const score = priceScore * 0.62 + durationScore * 0.38 + stopPenalty;
            if (score < bestScore) { bestScore = score; best = flight; }
        }
        if (best) labels.set(best.id, [...(labels.get(best.id) || []), '균형 추천']);
        flights.filter((flight) => flight.direct).forEach((flight) => labels.set(flight.id, [...(labels.get(flight.id) || []), '직항']));
        return labels;
    }

    function renderFlights(flights) {
        const container = document.getElementById('ezai-flight-list');
        if (!container) return;
        if (!flights.length) {
            container.innerHTML = '<div class="ezai-empty">조건에 맞는 항공편을 찾지 못했어요. 날짜나 직항 조건을 바꿔보세요.</div>';
            return;
        }
        const labels = getLabels(flights);
        container.innerHTML = flights.map((flight) => {
            const badges = labels.get(flight.id) || [];
            const selected = selectedCompareIds.has(flight.id);
            return `
                <article class="ezai-flight-card${selected ? ' is-selected' : ''}" data-flight-id="${escapeHtml(flight.id)}">
                    <div class="ezai-card-top">
                        <div class="ezai-airline">
                            <img src="${escapeHtml(flight.airlineLogo)}" alt="" onerror="this.style.display='none'">
                            <div><strong>${escapeHtml(flight.airline)}</strong><span>${escapeHtml(flight.flightNumber || '')}</span></div>
                        </div>
                        <div class="ezai-card-badges">${badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join('')}</div>
                    </div>
                    <div class="ezai-route-row">
                        <div class="ezai-endpoint"><strong>${formatTime(flight.departureTime)}</strong><span>${escapeHtml(flight.origin)}</span><small>${formatDate(flight.departureTime)}</small></div>
                        <div class="ezai-route-line"><span>${escapeHtml(flight.duration || '')}</span><i></i><small>${flight.direct ? '직항' : `${Number(flight.stops || 0)}회 경유`}</small></div>
                        <div class="ezai-endpoint is-arrival"><strong>${formatTime(flight.arrivalTime)}</strong><span>${escapeHtml(flight.destination)}</span><small>${formatDate(flight.arrivalTime)}</small></div>
                        <div class="ezai-price"><strong>${formatPrice(flight.price)}</strong><span>${escapeHtml(flight.travelClass || 'ECONOMY')}</span></div>
                    </div>
                    <div class="ezai-card-actions">
                        <button type="button" class="ezai-compare-toggle${selected ? ' is-on' : ''}" data-compare-id="${escapeHtml(flight.id)}">${selected ? '비교에서 빼기' : '비교하기'}</button>
                        <a href="./pages/flightResult/flightResult.html" class="ezai-detail-link">항공편 보기</a>
                    </div>
                </article>
            `;
        }).join('');

        container.querySelectorAll('[data-compare-id]').forEach((button) => {
            button.addEventListener('click', () => toggleCompare(button.dataset.compareId));
        });
    }

    function toggleCompare(id) {
        if (selectedCompareIds.has(id)) selectedCompareIds.delete(id);
        else if (selectedCompareIds.size < 3) selectedCompareIds.add(id);
        else {
            showNotification('항공편은 최대 3개까지 비교할 수 있어요.', 'warning');
            return;
        }
        renderCompare();
        renderFlights(currentFlights);
    }

    function renderCompare() {
        const section = document.getElementById('ezai-compare');
        const grid = document.getElementById('ezai-compare-grid');
        if (!section || !grid) return;
        const selected = currentFlights.filter((flight) => selectedCompareIds.has(flight.id));
        section.hidden = selected.length === 0;
        grid.innerHTML = selected.map((flight) => `
            <div class="ezai-compare-card">
                <strong>${escapeHtml(flight.airline)}</strong>
                <span>${escapeHtml(flight.origin)} → ${escapeHtml(flight.destination)}</span>
                <b>${formatPrice(flight.price)}</b>
                <small>${escapeHtml(flight.duration || '')} · ${flight.direct ? '직항' : `${flight.stops}회 경유`}</small>
                <button type="button" data-remove-compare="${escapeHtml(flight.id)}" aria-label="비교에서 제거">×</button>
            </div>
        `).join('');
        grid.querySelectorAll('[data-remove-compare]').forEach((button) => {
            button.addEventListener('click', () => toggleCompare(button.dataset.removeCompare));
        });
    }

    function renderResult(data) {
        currentContext = data.intent;
        currentFlights = Array.isArray(data.flights) ? data.flights : [];
        selectedCompareIds = new Set();

        document.getElementById('ezai-loading').hidden = true;
        document.getElementById('ezai-error').hidden = true;
        document.getElementById('ezai-results').hidden = false;
        document.getElementById('ezai-source').textContent = data.sourceLabel || '';
        document.getElementById('ezai-insight-text').textContent = data.aiInsight || '검색 조건에 맞는 항공편을 정리했어요.';
        renderSummaryChips(data.summary || [], document.getElementById('ezai-result-intent'));

        const providerNote = document.getElementById('ezai-provider-note');
        if (data.providerWarning) {
            providerNote.hidden = false;
            providerNote.textContent = data.providerWarning;
        } else {
            providerNote.hidden = true;
            providerNote.textContent = '';
        }

        renderFlights(currentFlights);
        renderCompare();

        const followups = document.getElementById('ezai-followups');
        followups.innerHTML = (data.followUpActions || []).map((action) => `
            <button type="button" data-followup-query="${escapeHtml(action.query)}">${escapeHtml(action.label)}</button>
        `).join('');
        followups.querySelectorAll('[data-followup-query]').forEach((button) => {
            button.addEventListener('click', () => handleAISearch(button.dataset.followupQuery, { preserveContext: true }));
        });
    }

    function renderError(error) {
        document.getElementById('ezai-loading').hidden = true;
        document.getElementById('ezai-results').hidden = true;
        const errorBox = document.getElementById('ezai-error');
        errorBox.hidden = false;
        errorBox.innerHTML = `<strong>검색 조건을 조금 더 알려주세요</strong><p>${escapeHtml(error.message)}</p>`;
        if (error.payload?.summary) renderSummaryChips(error.payload.summary, errorBox);
    }

    async function handleAISearch(query, { preserveContext = false } = {}) {
        if (isLoading || !query.trim()) return;
        setLoadingState(true);
        renderModalShell();
        openModal();
        const loading = document.getElementById('ezai-loading');
        const results = document.getElementById('ezai-results');
        const errorBox = document.getElementById('ezai-error');
        loading.hidden = false;
        results.hidden = true;
        errorBox.hidden = true;
        setStep('intent', 'active');

        const context = preserveContext ? currentContext : null;
        try {
            const preview = await requestJson('/api/ai-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context }),
            });
            setStep('intent', 'done');
            renderSummaryChips(preview.summary || [], document.getElementById('ezai-result-intent'));
            setStep('search', 'active');

            const data = await requestJson('/api/ai-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context }),
            });
            setStep('search', 'done');
            setStep('rank', 'active');
            renderResult(data);
            setStep('rank', 'done');
        } catch (error) {
            console.error('[EZ AI Search]', error);
            renderError(error);
        } finally {
            setLoadingState(false);
        }
    }

    aiInput.addEventListener('input', () => {
        window.clearTimeout(previewTimer);
        previewTimer = window.setTimeout(() => previewIntent(aiInput.value), 220);
    });

    aiInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            aiSearchBtn.click();
        }
    });

    aiSearchBtn.addEventListener('click', () => {
        const query = aiInput.value.trim();
        if (!query) {
            showNotification('여행 계획을 한 문장으로 입력해주세요.', 'warning');
            aiInput.focus();
            return;
        }
        handleAISearch(query, { preserveContext: false });
    });

    closeModalBtn.addEventListener('click', closeModal);
    aiResultsModal.addEventListener('click', (event) => {
        if (event.target === aiResultsModal) closeModal();
    });
    aiResultsModal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });

    setupLottieButton();
    renderModalShell();
});
