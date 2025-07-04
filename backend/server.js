// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');

const amadeusRoutes = require('./routes/amadeus');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.resolve(__dirname, '..');

app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', product: 'EZ AIR' });
});

app.use('/api', aiRoutes);
app.use('/api', amadeusRoutes);

for (const dir of ['style', 'script', 'image', 'video', 'pages', 'common']) {
    app.use(`/${dir}`, express.static(path.join(projectRoot, dir), { maxAge: '1h' }));
}
app.use('/dummy_flights.json', express.static(path.join(projectRoot, 'dummy_flights.json')));
app.get('/', (_req, res) => res.sendFile(path.join(projectRoot, 'index.html')));
app.get('/index.html', (_req, res) => res.sendFile(path.join(projectRoot, 'index.html')));

app.use((err, _req, res, _next) => {
    console.error('[Server Error]', err.stack || err.message);
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message || 'Internal server error', status: statusCode });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`EZ AIR running at http://0.0.0.0:${PORT}`);
});
