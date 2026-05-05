import { aiFlightSearchIntentSchema } from './schemas';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseFlightQuery(query: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const today = new Date().toISOString().slice(0, 10);
  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      role: 'user',
      parts: [{ text: `오늘은 ${today}입니다. 다음 한국어 자연어 항공권 검색 요청을 JSON으로 변환하세요. 요청: ${query}` }],
    }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Gemini request failed.');
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  const parsed = JSON.parse(text);
  return aiFlightSearchIntentSchema.parse(parsed);
}
