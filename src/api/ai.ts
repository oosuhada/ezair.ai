import { apiFetch } from './client';
import type { AiFlightSearchResponse } from '../types/ai';

export function aiFlightSearch(query: string): Promise<AiFlightSearchResponse> {
  return apiFetch<AiFlightSearchResponse>('/ai/flight-search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}
