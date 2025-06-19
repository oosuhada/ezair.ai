require('dotenv').config();
const express = require('express');
const cors = require('cors');

const amadeusRoutes = require('./routes/amadeus');
const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Configuration (가장 먼저 적용) ---
const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 허용할 HTTP 메서드
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], // 허용할 헤더
    credentials: true, // 자격 증명(쿠키, 인증 헤더 등) 허용 여부
    optionsSuccessStatus: 200 // Preflight 요청 성공 시 반환할 HTTP 상태 코드
};

app.use(cors(corsOptions)); // 모든 요청에 CORS 미들웨어 적용
app.options('*', cors(corsOptions));

// --- JSON Body Parser ---
app.use(express.json()); // JSON 형식의 요청 본문을 파싱

// --- Router Registration ---
// API 라우트들을 연결 (CORS 및 JSON 파서 미들웨어 뒤에 위치)
app.use('/api', amadeusRoutes);
app.use('/api', geminiRoutes);

// 기본 루트 엔드포인트
app.get('/', (req, res) => {
    res.send('Welcome to the Flight Booking API Backend!');
});

// 에러 핸들링 미들웨어 (항상 가장 마지막에 위치)
app.use((err, req, res, next) => {
    console.error(err.stack); // 서버 콘솔에 에러 스택 출력
    const status = err.status || 500; // 에러 상태 코드, 기본값은 500
    const message = err.message || 'Something broke!'; // 에러 메시지
    res.status(status).send({ error: message }); // 클라이언트에 에러 응답 전송
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Amadeus 및 Gemini API 호출 준비 완료.');
});