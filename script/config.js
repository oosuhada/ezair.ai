// config.js — 클라이언트 공개 설정만 포함. API 키/시크릿 절대 금지.

const API_BASE_URL =
    (typeof window !== 'undefined' && window.EZAIR_API_BASE_URL) ||
    'http://localhost:3000/api';

const IS_DEVELOPMENT_MODE = true;

const AI_SEARCH_MODE = 'mock';

function getApiUrl(path) {
    const base = API_BASE_URL.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : '/' + path;
    return base + p;
}

export { API_BASE_URL, IS_DEVELOPMENT_MODE, AI_SEARCH_MODE, getApiUrl };

// 비모듈 스크립트(amadeus_search.js 등)에서 접근할 수 있도록 전역에 노출
if (typeof window !== 'undefined') {
    window.EZAIR_CONFIG = { API_BASE_URL, AI_SEARCH_MODE, getApiUrl };
}
