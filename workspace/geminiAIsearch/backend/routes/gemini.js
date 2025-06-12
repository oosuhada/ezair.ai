// backend/routes/gemini.js
const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService'); // Gemini 서비스 임포트

// Gemini AI 검색/질문 엔드포인트
router.post('/gemini-chat', async (req, res, next) => { // next 추가
    const { prompt } = req.body; // 사용자 질문을 'prompt'로 받음

    if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt in request body.' });
    }

    try {
        const responseText = await geminiService.generateContent(prompt);
        // Gemini 서비스에서 반환된 텍스트를 그대로 응답으로 보냅니다.
        // 프론트엔드에서 이 텍스트 내의 JSON을 파싱합니다.
        res.json({ response: responseText });
    } catch (error) {
        console.error('Error in /api/gemini-chat route:', error.message);
        // 에러를 다음 미들웨어(에러 핸들링 미들웨어)로 전달
        next(error);
    }
});

module.exports = router;