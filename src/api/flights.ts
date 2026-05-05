import { apiFetch } from './client';
import type { FlightSearchRequest, LocationSuggestion } from '../types/flight';

export interface LocationSearchResponse {
  data?: LocationSuggestion[];
}

export function searchLocations(keyword: string): Promise<LocationSearchResponse> {
  return apiFetch<LocationSearchResponse>(`/search-locations?keyword=${encodeURIComponent(keyword)}`, {
    method: 'GET',
  });
}

export function searchFlights(request: FlightSearchRequest): Promise<unknown> {
  return apiFetch<unknown>('/search-flights', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
