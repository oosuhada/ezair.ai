import type { FlightSearchRequest } from '../../types/flight';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const IATA_PATTERN = /^[A-Z]{3}$/;

export type ValidationResult = { ok: true } | { ok: false; message: string };

export function validateFlightSearchRequest(request: FlightSearchRequest & { tripType?: string }): ValidationResult {
  if (!IATA_PATTERN.test(request.origin)) return { ok: false, message: '출발지 IATA 코드가 필요합니다.' };
  if (!IATA_PATTERN.test(request.destination)) return { ok: false, message: '도착지 IATA 코드가 필요합니다.' };
  if (!DATE_PATTERN.test(request.departDate)) return { ok: false, message: '출발일을 YYYY-MM-DD 형식으로 입력해 주세요.' };
  if (request.tripType === 'ROUND_TRIP' && !request.returnDate) return { ok: false, message: '왕복 검색에는 귀국일이 필요합니다.' };
  if (request.returnDate && !DATE_PATTERN.test(request.returnDate)) return { ok: false, message: '귀국일을 YYYY-MM-DD 형식으로 입력해 주세요.' };
  if (!Number.isInteger(request.adults) || request.adults < 1 || request.adults > 9) return { ok: false, message: '성인 수는 1~9명이어야 합니다.' };
  return { ok: true };
}
