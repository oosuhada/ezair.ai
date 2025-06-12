// server.js
// Install: npm install express node-fetch dotenv
// Create a .env file in the 'backend' folder: AMADEUS_API_KEY=YOUR_KEY AMADEUS_API_SECRET=YOUR_SECRET

require('dotenv').config(); // .env 파일에서 환경 변수를 로드합니다.
const express = require('express');
// const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000; // .env 파일의 PORT 변수 사용 (기본값 3000)

app.use(express.json()); // JSON 형식의 요청 본문을 파싱하기 위한 미들웨어

// CORS 설정: 개발 환경에서 프론트엔드와 백엔드가 다른 포트에서 실행될 때 필수
// 실제 운영 환경에서는 특정 도메인으로 제한하는 것이 보안상 좋습니다.
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // 모든 출처에서의 요청 허용 (개발용)
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 허용할 HTTP 메서드 명시
    next();
});

let amadeusAccessToken = null; // Amadeus 액세스 토큰을 저장할 변수
let tokenExpiryTime = 0;      // 토큰 만료 시간을 저장할 변수 (밀리초 단위)

// Amadeus Access Token을 가져오는 비동기 함수
// 토큰이 만료되었거나, 만료 예정이라면 새로 발급받습니다.
async function getAmadeusAccessToken() {
    // 현재 토큰이 유효하고, 만료까지 1분 이상 남았다면 기존 토큰 사용
    if (amadeusAccessToken && Date.now() < tokenExpiryTime - 60000) {
        return amadeusAccessToken;
    }

    const clientId = process.env.AMADEUS_API_KEY;
    const clientSecret = process.env.AMADEUS_API_SECRET;

    // .env 파일에 키 또는 시크릿이 설정되지 않았다면 오류 출력
    if (!clientId || !clientSecret) {
        console.error('\n--- 환경 변수 오류 ---');
        console.error('AMADEUS_API_KEY 또는 AMADEUS_API_SECRET가 .env 파일에 설정되지 않았습니다.');
        console.error('backend 폴더의 .env 파일을 확인해주세요.');
        console.error('---------------------\n');
        return null;
    }

    try {
        // Amadeus 토큰 발급 API 호출 (테스트 환경)
        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded' // 폼 데이터 형식으로 전송
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });

        if (!response.ok) {
            // 응답이 성공(2xx)이 아니면 오류 처리
            const errorText = await response.text();
            console.error('\n--- Amadeus 토큰 발급 실패 ---');
            console.error(`HTTP 상태 코드: ${response.status}`);
            console.error(`응답 메시지: ${errorText}`);
            console.error('Amadeus API 키/시크릿이 올바른지, 또는 네트워크 문제인지 확인해주세요.');
            console.error('---------------------------\n');
            throw new Error(`Failed to get Amadeus token: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        amadeusAccessToken = data.access_token;
        tokenExpiryTime = Date.now() + (data.expires_in * 1000); // 만료 시간을 현재 시간 + 유효 기간으로 설정
        console.log('Amadeus token obtained successfully.'); // 성공 로그
        return amadeusAccessToken;

    } catch (error) {
        // 네트워크 오류 등 예외 발생 시 처리
        console.error('Error getting Amadeus token (catch block):', error.message);
        return null;
    }
}

// -----------------------------------------------------
// API 엔드포인트 정의
// -----------------------------------------------------

// 공항/도시 검색 엔드포인트
app.get('/api/search-locations', async (req, res) => {
    const { keyword } = req.query; // 쿼리 파라미터에서 검색어 추출

    if (!keyword || keyword.length < 2) {
        return res.status(400).json({ error: 'Please enter at least 2 characters for search.' });
    }

    // Amadeus 액세스 토큰 획득 시도
    const accessToken = await getAmadeusAccessToken();
    if (!accessToken) {
        // 토큰 획득 실패 시 500 에러 응답
        return res.status(500).json({ error: 'Could not obtain Amadeus access token for location search. Check server logs.' });
    }

    try {
        // Amadeus 위치 검색 API 호출 (CITY 또는 AIRPORT 서브타입)
        const amadeusResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(keyword)}&page%5Boffset%5D=0&page%5Blimit%5D=10`, {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Authorization 헤더에 토큰 포함
            }
        });

        if (!amadeusResponse.ok) {
            // Amadeus API에서 오류 응답 시 처리
            const errorDetail = await amadeusResponse.json();
            console.error('Amadeus Location API error:', errorDetail);
            return res.status(amadeusResponse.status).json({ error: 'Amadeus Location API error', details: errorDetail });
        }

        const data = await amadeusResponse.json();
        res.json(data); // 프론트엔드로 Amadeus API 응답 전달

    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ error: 'Internal server error during location search.' });
    }
});


// 항공편 검색 엔드포인트
app.post('/api/search-flights', async (req, res) => {
    const { origin, destination, departDate, returnDate, adults, travelClass, nonStop } = req.body;

    // 필수 파라미터 누락 시 400 에러 응답
    if (!origin || !destination || !departDate || !adults) {
        return res.status(400).json({ error: 'Missing required search parameters.' });
    }

    // Amadeus 액세스 토큰 획득 시도
    const accessToken = await getAmadeusAccessToken();
    if (!accessToken) {
        // 토큰 획득 실패 시 500 에러 응답
        return res.status(500).json({ error: 'Could not obtain Amadeus access token for flight search. Check server logs.' });
    }

    // Amadeus API 쿼리 파라미터 구성
    const queryParams = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departDate,
        adults: adults,
        'travelClass': travelClass,
        'max': 10 // 결과 수 제한
    });

    if (returnDate) {
        queryParams.append('returnDate', returnDate);
    }
    if (nonStop) {
        queryParams.append('nonStop', 'true');
    }

    try {
        // Amadeus 항공편 검색 API 호출
        const amadeusResponse = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!amadeusResponse.ok) {
            // Amadeus API에서 오류 응답 시 처리
            const errorDetail = await amadeusResponse.json();
            console.error('Amadeus API error:', errorDetail);
            return res.status(amadeusResponse.status).json({ error: 'Amadeus API error', details: errorDetail });
        }

        const data = await amadeusResponse.json();
        res.json(data); // 프론트엔드로 Amadeus API 응답 전달

    } catch (error) {
        console.error('Error searching flights:', error);
        res.status(500).json({ error: 'Internal server error during flight search.' });
    }
});

// -----------------------------------------------------
// 서버 시작
// -----------------------------------------------------

// Express 서버를 지정된 포트에서 시작
app.listen(PORT, async () => { // async 키워드를 추가하여 비동기 함수 호출 가능하게 함
    console.log(`Server running on http://localhost:${PORT}`);
    
    // 서버 시작 시 Amadeus Access Token을 미리 획득 시도
    // 이 과정에서 실패하면, .env 파일이나 네트워크 연결에 문제가 있음을 바로 알 수 있습니다.
    const initialToken = await getAmadeusAccessToken();
    if (initialToken) {
        console.log('Amadeus token obtained successfully on startup. Ready for API calls.');
    } else {
        console.error('!!!! Amadeus 토큰 획득 실패. .env 파일 (API 키/시크릿) 및 네트워크 연결을 확인해주세요. !!!!');
    }
});