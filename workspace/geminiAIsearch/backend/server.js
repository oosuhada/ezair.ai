// backend/server.js
require('dotenv').config(); // .env 파일에서 환경 변수를 로드합니다.
const express = require('express');
const cors = require('cors'); // CORS 미들웨어 추가

const amadeusRoutes = require('./routes/amadeus'); // Amadeus 라우터 임포트
const geminiRoutes = require('./routes/gemini');   // Gemini 라우터 임포트

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // JSON 형식의 요청 본문을 파싱하기 위한 미들웨어

// CORS 설정: 개발 환경에서 모든 출처에서의 요청 허용
// 실제 운영 환경에서는 특정 도메인으로 제한하는 것이 보안상 좋습니다.
app.use(cors({
    origin: '*', // 모든 출처 허용 (개발용)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// 라우터 등록
app.use('/api', amadeusRoutes); // /api/search-locations, /api/search-flights 등으로 접근
app.use('/api', geminiRoutes);   // /api/gemini-chat 으로 접근 (frontend와 일치)

// 기본 루트 엔드포점 (선택 사항)
app.get('/', (req, res) => {
    res.send('Welcome to the Flight Booking API Backend!');
});

// 에러 핸들링 미들웨어 (가장 마지막에 위치)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).send({ error: err.message || 'Something broke!' }); // 에러 메시지 포함
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Amadeus 및 Gemini API 호출 준비 완료.');
});