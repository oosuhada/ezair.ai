import { flightSearchRequestSchema, type FlightSearchRequest } from './schemas';
import { getCache, setCache } from './cache';

const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken;
  const clientId = process.env.AMADEUS_API_KEY;
  const clientSecret = process.env.AMADEUS_API_SECRET;
  if (!clientId || !clientSecret) throw new Error('Amadeus credentials are not configured.');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetchWithTimeout(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) throw new Error('Failed to get Amadeus access token.');
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiresAt = Date.now() + Number(data.expires_in || 0) * 1000;
  return accessToken as string;
}

export async function searchLocations(keyword: string) {
  const safeKeyword = keyword.trim();
  if (safeKeyword.length < 2) throw new Error('keyword must be at least 2 characters.');
  const cacheKey = `locations:${safeKeyword.toLowerCase()}`;
  const cached = getCache<unknown>(cacheKey);
  if (cached) return cached;

  const token = await getAccessToken();
  const url = new URL(`${AMADEUS_BASE_URL}/v1/reference-data/locations`);
  url.searchParams.set('subType', 'CITY,AIRPORT');
  url.searchParams.set('keyword', safeKeyword);
  url.searchParams.set('page[limit]', '10');

  const response = await fetchWithTimeout(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Amadeus location search failed.');
  const data = await response.json();
  setCache(cacheKey, data, 7 * 24 * 60 * 60 * 1000);
  return data;
}

export async function searchFlights(input: FlightSearchRequest) {
  const request = flightSearchRequestSchema.parse(input);
  const token = await getAccessToken();
  const query = new URLSearchParams({
    originLocationCode: request.origin,
    destinationLocationCode: request.destination,
    departureDate: request.departDate,
    adults: String(request.adults),
    travelClass: request.travelClass,
    max: '10',
  });
  if (request.returnDate) query.set('returnDate', request.returnDate);
  if (request.nonStop) query.set('nonStop', 'true');

  const response = await fetchWithTimeout(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Amadeus flight search failed.');
  return response.json();
}

export function normalizeFlightOffers(amadeusResponse: any) {
  const offers = Array.isArray(amadeusResponse?.data) ? amadeusResponse.data : [];
  const carriers = amadeusResponse?.dictionaries?.carriers || {};
  return offers.map((offer: any, index: number) => {
    const itinerary = offer.itineraries?.[0];
    const segments = itinerary?.segments || [];
    const first = segments[0] || {};
    const last = segments[segments.length - 1] || first;
    const code = first.carrierCode || '';
    return {
      id: offer.id || `offer-${index}`,
      airline: carriers[code] || code || 'Unknown Airline',
      airlineCode: code,
      flightNumber: `${code}${first.number || ''}`,
      origin: first.departure?.iataCode || '',
      destination: last.arrival?.iataCode || '',
      departureTime: first.departure?.at || '',
      arrivalTime: last.arrival?.at || '',
      duration: itinerary?.duration || '',
      stops: Math.max(segments.length - 1, 0),
      direct: segments.length <= 1,
      price: {
        amount: Number(offer.price?.grandTotal || 0),
        currency: offer.price?.currency || 'KRW',
      },
      recommendation: index === 0 ? 'special' : segments.length <= 1 ? 'direct' : '',
    };
  });
}
