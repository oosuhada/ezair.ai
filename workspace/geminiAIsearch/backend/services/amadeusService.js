// backend/services/amadeusService.js
require('dotenv').config();
const fetch = require('node-fetch'); // fetch를 사용하려면 npm install node-fetch 필요

let amadeusAccessToken = null;
let tokenExpiryTime = 0;

// Amadeus Access Token을 가져오는 비동기 함수
async function getAmadeusAccessToken() {
    if (amadeusAccessToken && Date.now() < tokenExpiryTime - 60000) { // 만료 1분 전까지 유효
        return amadeusAccessToken;
    }

    const clientId = process.env.AMADEUS_API_KEY;
    const clientSecret = process.env.AMADEUS_API_SECRET;

    if (!clientId || !clientSecret) {
        const error = new Error('AMADEUS_API_KEY or AMADEUS_API_SECRET is not set in .env file.');
        error.status = 500;
        throw error;
    }

    try {
        const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });

        if (!response.ok) {
            const errorText = await response.text();
            const error = new Error(`Failed to get Amadeus token: ${response.status} - ${errorText}`);
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        amadeusAccessToken = data.access_token;
        tokenExpiryTime = Date.now() + (data.expires_in * 1000);
        console.log('Amadeus token obtained successfully.');
        return amadeusAccessToken;

    } catch (error) {
        console.error('Error getting Amadeus token:', error.message);
        // 에러 객체에 status를 추가하여 상위 호출자에게 전달
        if (!error.status) error.status = 500;
        throw error;
    }
}

// 공항/도시 검색
async function searchLocations(keyword) {
    const accessToken = await getAmadeusAccessToken();
    if (!accessToken) {
        const error = new Error('Could not obtain Amadeus access token for location search.');
        error.status = 500;
        throw error;
    }

    try {
        const amadeusResponse = await fetch(`https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${encodeURIComponent(keyword)}&page%5Boffset%5D=0&page%5Blimit%5D=10`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!amadeusResponse.ok) {
            const errorDetail = await amadeusResponse.json();
            const error = new Error('Amadeus Location API error');
            error.status = amadeusResponse.status;
            error.details = errorDetail;
            throw error;
        }

        return await amadeusResponse.json();

    } catch (error) {
        console.error('Error searching locations in Amadeus service:', error.message);
        if (!error.status) error.status = 500;
        throw error;
    }
}

// 항공편 검색
async function searchFlights({ origin, destination, departDate, returnDate, adults, travelClass, nonStop }) {
    const accessToken = await getAmadeusAccessToken();
    if (!accessToken) {
        const error = new Error('Could not obtain Amadeus access token for flight search.');
        error.status = 500;
        throw error;
    }

    const queryParams = new URLSearchParams({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departDate,
        adults: adults,
        'travelClass': travelClass || 'ECONOMY', // 기본값 설정
        'max': 10
    });

    if (returnDate) {
        queryParams.append('returnDate', returnDate);
    }
    if (nonStop) {
        queryParams.append('nonStop', 'true');
    }

    try {
        const amadeusResponse = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!amadeusResponse.ok) {
            const errorDetail = await amadeusResponse.json();
            const error = new Error('Amadeus Flight API error');
            error.status = amadeusResponse.status;
            error.details = errorDetail;
            throw error;
        }

        return await amadeusResponse.json();

    } catch (error) {
        console.error('Error searching flights in Amadeus service:', error.message);
        if (!error.status) error.status = 500;
        throw error;
    }
}

module.exports = {
    searchLocations,
    searchFlights
};