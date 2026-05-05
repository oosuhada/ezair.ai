// services/geminiService.js
require('dotenv').config();
const { normalizeIntent } = require('./flightIntentSchema');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        tripType: { type: 'STRING' },
        originText: { type: 'STRING' },
        destinationText: { type: 'STRING' },
        originIata: { type: 'STRING' },
        destinationIata: { type: 'STRING' },
        departDate: { type: 'STRING' },
        returnDate: { type: 'STRING' },
        adults: { type: 'INTEGER' },
        children: { type: 'INTEGER' },
        infants: { type: 'INTEGER' },
        travelClass: { type: 'STRING' },
        nonStop: { type: 'BOOLEAN' },
        sortBy: { type: 'STRING' },
        budgetMax: { type: 'NUMBER' },
        currency: { type: 'STRING' },
        flexibilityDays: { type: 'INTEGER' },
        purpose: { type: 'STRING' },
        needsClarification: { type: 'BOOLEAN' },
        clarificationQuestion: { type: 'STRING' }
    }
};

function buildPrompt(query, today) {
    return `오늘 날짜: ${today}

다음 자연어 항공권 검색 요청에서 구조화된 검색 파라미터를 추출하세요.

규칙:
- 출발/도착 공항 IATA 코드를 알 수 있으면 originIata/destinationIata에 대문자 3글자로 입력.
- 날짜는 YYYY-MM-DD 형식. "다음 주", "내일" 같은 표현은 오늘 날짜 기준으로 계산.
- 왕복이면 tripType: ROUND_TRIP, returnDate 포함.
- 편도면 tripType: ONE_WAY.
- 필요한 정보가 부족하면 needsClarification: true, clarificationQuestion에 질문 내용 포함.
- 알 수 없는 필드는 생략.

검색 요청: "${query}"`;
}

async function parseFlightQuery(query) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        const error = new Error('query가 비어 있습니다.');
        error.status = 400;
        throw error;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        const error = new Error('GEMINI_API_KEY가 서버에 설정되지 않았습니다. .env를 확인하세요.');
        error.status = 500;
        throw error;
    }

    const today = new Date().toISOString().slice(0, 10);
    const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ role: 'user', parts: [{ text: buildPrompt(query, today) }] }],
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
            temperature: 0.1
        }
    };

    let response;
    try {
        response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }, 15000);
    } catch (err) {
        const error = new Error(err.name === 'AbortError' ? 'Gemini API 요청 시간 초과' : 'Gemini API 연결 실패');
        error.status = 503;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(`Gemini API 오류: HTTP ${response.status}`);
        error.status = response.status >= 500 ? 503 : response.status;
        throw error;
    }

    let raw;
    try {
        raw = await response.json();
    } catch {
        const error = new Error('Gemini API 응답 파싱 실패');
        error.status = 503;
        throw error;
    }

    const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        const error = new Error('Gemini API가 유효한 응답을 반환하지 않았습니다.');
        error.status = 503;
        throw error;
    }

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        const error = new Error('Gemini 응답이 유효한 JSON이 아닙니다.');
        error.status = 503;
        throw error;
    }

    const normalized = normalizeIntent(parsed);
    if (!normalized.ok) {
        const error = new Error('Gemini 응답 스키마 검증 실패');
        error.status = 422;
        error.issues = normalized.issues;
        throw error;
    }

    return normalized.data;
}

module.exports = { parseFlightQuery };
