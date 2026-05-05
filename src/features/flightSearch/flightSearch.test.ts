import { describe, expect, it } from 'vitest';
import { extractIataCodeFromInput, formatKoreanTime, validateFlightSearchRequest } from './index';

describe('flight search utilities', () => {
  it('extracts IATA from Korean label', () => {
    expect(extractIataCodeFromInput('서울 (ICN)')).toBe('ICN');
  });

  it('accepts raw IATA', () => {
    expect(extractIataCodeFromInput('icn')).toBe('ICN');
  });

  it('fails when departDate is missing', () => {
    const result = validateFlightSearchRequest({
      origin: 'ICN',
      destination: 'CJU',
      departDate: '',
      adults: 1,
      travelClass: 'ECONOMY',
      nonStop: false,
    });
    expect(result.ok).toBe(false);
  });

  it('fails round trip without return date', () => {
    const result = validateFlightSearchRequest({
      tripType: 'ROUND_TRIP',
      origin: 'ICN',
      destination: 'CJU',
      departDate: '2026-05-15',
      adults: 1,
      travelClass: 'ECONOMY',
      nonStop: false,
    });
    expect(result.ok).toBe(false);
  });

  it('fails when adults is zero', () => {
    const result = validateFlightSearchRequest({
      origin: 'ICN',
      destination: 'CJU',
      departDate: '2026-05-15',
      adults: 0,
      travelClass: 'ECONOMY',
      nonStop: false,
    });
    expect(result.ok).toBe(false);
  });

  it('formats Korean time', () => {
    expect(formatKoreanTime('2026-05-15T09:30:00')).toMatch(/09|오전/);
  });
});
