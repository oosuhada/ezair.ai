// backend/routes/gemini.js
const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// Gemini AI 검색/질문 엔드포인트
router.post('/gemini-chat', async (req, res, next) => {
    const { prompt: userQuery } = req.body; // 사용자 질문을 'userQuery'로 받음

    if (!userQuery) {
        return res.status(400).json({ error: 'Missing prompt in request body.' });
    }

    try {
        // --- Gemini에게 보낼 프롬프트 구성 ---
        // Gemini에게 항공권 검색에 필요한 정보를 JSON 형태로 추출하고,
        // 해당 정보에 맞는 가상의 항공편 목록과 추천 문구를 생성하도록 지시합니다.
        const geminiPrompt = `
당신은 항공권 검색 및 추천을 돕는 AI 어시스턴트입니다.
사용자의 질문을 분석하여 항공권 검색에 필요한 다음 정보를 추출하고, **반드시 아래와 같은 JSON 형식으로 응답해주세요.**
만약 특정 정보를 추출할 수 없거나 모호한 경우, 해당 필드는 null 또는 빈 문자열로 두세요.
추출된 정보가 없거나, 검색 요청이 불가능하다고 판단되면 flights 배열은 비워두고, recommendation 필드에 사용자에게 필요한 추가 질문이나 안내를 제공해주세요.
날짜는 "YYYY-MM-DD" 형식으로, 시간은 "HH:MM" 형식으로 반환해주세요.
항공편 목록은 실제 항공편이 아닌, 사용자 쿼리를 기반으로 생성된 **가상의** 항공편 정보입니다.

**중요: 항공편 출발지와 도착지는 반드시 IATA 코드(예: 인천(ICN), 제주(CJU))로 제공하고, 해당 IATA 코드에 해당하는 도시 이름도 함께 제공해주세요.**
성인 인원수는 숫자로, 좌석 등급(travelClass)은 ECONOMY, BUSINESS, FIRST 중 하나로 제공해주세요.

현재 시간은 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} 입니다.
오늘 날짜는 ${new Date().toISOString().split('T')[0]} 입니다.

**응답 JSON 형식:**
\`\`\`json
{
  "flights": [
    {
      "airline": "항공사 이름",
      "flightNumber": "편명",
      "origin": "출발지 IATA 코드 (예: GMP)",
      "originCity": "출발 도시 이름 (예: 서울)",
      "destination": "도착지 IATA 코드 (예: CJU)",
      "destinationCity": "도착 도시 이름 (예: 제주)",
      "departDate": "YYYY-MM-DD (가는 날)",
      "departTime": "HH:MM (가는 시간)",
      "arriveDate": "YYYY-MM-DD (도착 날짜, 당일이면 출발 날짜와 동일)",
      "arriveTime": "HH:MM (도착 시간)",
      "price": 숫자 (가격),
      "stops": 숫자 (경유 횟수, 직항이면 0),
      "adults": 숫자 (성인 인원수),
      "travelClass": "ECONOMY" | "BUSINESS" | "FIRST"
    }
    // 추가 항공편 객체
  ],
  "recommendation": "사용자에게 도움이 될 만한 추가 추천 메시지 또는 모호한 경우 구체적인 질문 요청"
}
\`\`\`

**예시 1: "서울에서 제주도 다음주 금요일 가장 저렴한 항공권 찾아줘"**
\`\`\`json
{
  "flights": [
    {
      "airline": "티웨이항공",
      "flightNumber": "TW101",
      "origin": "GMP",
      "originCity": "서울",
      "destination": "CJU",
      "destinationCity": "제주",
      "departDate": "2025-06-27",
      "departTime": "09:00",
      "arriveDate": "2025-06-27",
      "arriveTime": "10:10",
      "price": 55000,
      "stops": 0,
      "adults": 1,
      "travelClass": "ECONOMY"
    },
    {
      "airline": "제주항공",
      "flightNumber": "7C202",
      "origin": "GMP",
      "originCity": "서울",
      "destination": "CJU",
      "destinationCity": "제주",
      "departDate": "2025-06-27",
      "departTime": "10:30",
      "arriveDate": "2025-06-27",
      "arriveTime": "11:40",
      "price": 62000,
      "stops": 0,
      "adults": 1,
      "travelClass": "ECONOMY"
    }
  ],
  "recommendation": "다음 주 금요일 제주도 항공권은 지금이 구매 적기이며, 오전 시간대 항공편이 인기가 많습니다."
}
\`\`\`

**예시 2: "부산 가는 항공권 알려줘" (날짜 정보 불충분)**
\`\`\`json
{
  "flights": [],
  "recommendation": "부산으로 가는 항공권을 찾아드릴 수 있지만, 날짜와 출발지를 알려주시면 더 정확한 검색이 가능합니다. 예를 들어, '서울에서 다음 주 토요일 부산 가는 항공권'처럼 말씀해주세요."
}
\`\`\`

**예시 3: "뉴욕으로 가족 여행" (정보 부족)**
\`\`\`json
{
  "flights": [],
  "recommendation": "뉴욕 가족 여행에 대한 구체적인 날짜와 출발지, 그리고 몇 분이 여행하시는지 알려주시면 항공편을 찾아드릴 수 있습니다."
}
\`\`\`

**예시 4: "다음 달 15일 런던 비즈니스석 항공권 2명"**
\`\`\`json
{
  "flights": [],
  "recommendation": "런던 비즈니스석 항공권 2인 검색을 위해 출발지를 알려주세요. 예를 들어, '서울에서 다음 달 15일 런던 비즈니스석 항공권 2명'처럼 말씀해주세요."
}
\`\`\`

**예시 5: "오늘 서울에서 부산 직항" (가는 날 오늘)**
\`\`\`json
{
  "flights": [
    {
      "airline": "대한항공",
      "flightNumber": "KE1101",
      "origin": "GMP",
      "originCity": "서울",
      "destination": "PUS",
      "destinationCity": "부산",
      "departDate": "${new Date().toISOString().split('T')[0]}",
      "departTime": "14:00",
      "arriveDate": "${new Date().toISOString().split('T')[0]}",
      "arriveTime": "15:00",
      "price": 75000,
      "stops": 0,
      "adults": 1,
      "travelClass": "ECONOMY"
    }
  ],
  "recommendation": "오늘 서울에서 부산 가는 직항 항공편입니다. 오후 시간대에 이용 가능한 항공편이 있습니다."
}
\`\`\`

사용자의 질문에 따라 JSON을 생성해주세요:
`;

        const responseText = await geminiService.generateContent(geminiPrompt);
        // Gemini 서비스에서 반환된 텍스트를 그대로 응답으로 보냅니다.
        res.json({ response: responseText });
    } catch (error) {
        console.error('Error in /api/gemini-chat route:', error.message);
        // 에러를 다음 미들웨어(에러 핸들링 미들웨어)로 전달
        next(error);
    }
});

module.exports = router;