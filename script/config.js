// config.js — 클라이언트 공개 설정만 포함합니다. API 키/시크릿은 절대 넣지 마세요.

function buildDefaultApiBaseUrl() {
    if (typeof window === 'undefined') return '/api';

    // 배포/프록시 환경에서는 같은 origin의 /api를 기본값으로 사용합니다.
    const { protocol, hostname, port } = window.location;
    const isLocalStaticServer = ['5500', '5173', '8080'].includes(port);

    // Live Server/Vite 개발 서버에서 열었을 때만 같은 hostname의 백엔드 포트로 연결합니다.
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && isLocalStaticServer) {
        return `${protocol}//${hostname}:3000/api`;
    }

    return '/api';
}

const API_BASE_URL =
    (typeof window !== 'undefined' && window.EZAIR_API_BASE_URL) ||
    buildDefaultApiBaseUrl();

const IS_DEVELOPMENT_MODE = true;
const AI_SEARCH_MODE = 'mock';

function getApiUrl(path) {
    const base = String(API_BASE_URL || '/api').replace(/\/$/, '');
    const p = String(path || '').startsWith('/') ? String(path || '') : '/' + String(path || '');
    return base + p;
}

export { API_BASE_URL, IS_DEVELOPMENT_MODE, AI_SEARCH_MODE, getApiUrl };

// 비모듈 스크립트(amadeus_search.js 등)에서 접근할 수 있도록 전역에 노출합니다.
if (typeof window !== 'undefined') {
    window.EZAIR_CONFIG = { API_BASE_URL, AI_SEARCH_MODE, getApiUrl };
}
