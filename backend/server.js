// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const amadeusRoutes = require('./routes/amadeus');
const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Helmet (CSP off: 정적 프로젝트에서 CDN/inline 사용) ---
app.use(helmet({ contentSecurityPolicy: false }));

// --- CORS ---
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:5173',
        'http://localhost:3000'
      ];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin not allowed — ${origin}`));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};
app.use(cors(corsOptions));

// --- JSON Body 파서 ---
app.use(express.json({ limit: '1mb' }));

// --- Rate Limit: AI 검색 endpoint ---
const aiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }
});
app.use('/api/ai', aiRateLimit);

// --- Health Check ---
app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'ezair-api', timestamp: new Date().toISOString() });
});

// --- 라우터 등록 ---
app.use('/api', geminiRoutes);
app.use('/api', amadeusRoutes);

// --- 루트 테스트 ---
app.get('/', (req, res) => {
    res.send('Welcome to the Flight Booking API Backend!');
});

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.message);
    const statusCode = err.status || 500;
    const body = { error: err.message || 'Internal Server Error', status: statusCode };
    if (process.env.NODE_ENV !== 'production') {
        body.stack = err.stack;
    }
    res.status(statusCode).json(body);
});

// --- 서버 시작 ---
app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
