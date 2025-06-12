// backend/services/geminiService.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // npm install @google/generative-ai 필요

// Gemini API 키 로드
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API 키가 설정되었는지 확인
if (!GEMINI_API_KEY) {
    console.error('\n--- 환경 변수 오류 ---');
    console.error('GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.');
    console.error('backend 폴더의 .env 파일을 확인해주세요.');
    console.error('---------------------\n');
    // 실제 애플리케이션에서는 여기서 프로세스를 종료하거나, 에러를 던져야 합니다.
    // 여기서는 일단 경고만 하고, 호출 시 에러가 나도록 합니다.
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 모델 초기화 (예: 텍스트 생성 모델)
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Gemini AI를 사용하여 텍스트를 생성하는 비동기 함수
async function generateContent(prompt) {
    // API 키가 없는 경우 여기서 명시적으로 에러를 던집니다.
    if (!GEMINI_API_KEY) {
        const error = new Error('Gemini API Key is not configured. Please check .env file.');
        error.status = 500;
        throw error;
    }

    try {
        // Gemini API 호출
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text(); // AI 응답 텍스트 추출
        return text; // 추출된 텍스트를 반환
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        const newError = new Error(`Failed to get response from Gemini API: ${error.message}`);
        newError.status = 500;
        throw newError;
    }
}

module.exports = {
    generateContent
};