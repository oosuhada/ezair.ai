// server.js
require('dotenv').config();
const express = require('express');
// const cors = require('cors'); // 이 라인은 완전히 제거하거나 주석 처리되어 있어야 합니다!

const amadeusRoutes = require('./routes/amadeus');
const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

// --- JSON Body 파서 ---
app.use(express.json());
console.log('[Server] JSON 바디 파서 설정 완료');

// --- ✅ OPTIONS 요청을 최우선으로 직접 처리 (가장 강력한 해결책 시도) ---
// /api/gemini-chat 경로에 대한 OPTIONS 요청이 들어오면, 다른 어떤 라우터보다 먼저 여기서 처리합니다.
app.options('/api/gemini-chat', (req, res) => {
    console.log('✅ SERVER.JS: OPTIONS /api/gemini-chat 요청 직접 처리 시작!');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5500'); // ✅ 프론트엔드 주소와 포트 정확히 일치 확인!
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // ✅ POST와 OPTIONS 모두 허용
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // ✅ Content-Type 헤더 허용
    res.sendStatus(200); // 200 OK 상태 코드 반환
    console.log('✅ SERVER.JS: OPTIONS /api/gemini-chat 응답 완료 (200 OK)');
});
// ----------------------------------------------------------------------


// --- 라우터 등록 (위의 app.options() 라우트보다 뒤에 있어야 합니다) ---
// 순서는 이제 중요하지 않습니다. 왜냐하면 /api/gemini-chat에 대한 OPTIONS 요청은 위에서 이미 처리됐기 때문입니다.
app.use('/api', geminiRoutes);
console.log('[Server] /api/gemini 경로 라우트 등록 완료');

app.use('/api', amadeusRoutes);
console.log('[Server] /api/amadeus 경로 라우트 등록 완료');


// --- 루트 테스트 엔드포인트 ---
app.get('/', (req, res) => {
    console.log('[Server] 루트 경로 (/) 요청 수신됨');
    res.send('Welcome to the Flight Booking API Backend!');
});

// --- 에러 핸들링 미들웨어 ---
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).send({
        error: err.message || 'Something broke!',
        status: statusCode
    });
});
console.log('[Server] 에러 핸들링 미들웨어 등록 완료');

// --- 서버 시작 ---
app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});