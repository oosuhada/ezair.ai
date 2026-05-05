import type { FlightOffer, TravelClass, TripType } from './flight';

export interface AiFlightSearchIntent {
  tripType: TripType;
  originText?: string;
  destinationText?: string;
  originIata?: string;
  destinationIata?: string;
  departDate: string;
  returnDate?: string | null;
  adults: number;
  children?: number;
  infants?: number;
  travelClass: TravelClass;
  nonStop: boolean;
  sortBy: 'CHEAPEST' | 'FASTEST' | 'RECOMMENDED';
  budgetMax?: number;
  currency: 'KRW' | 'USD' | 'EUR' | 'JPY';
  flexibilityDays?: number;
  purpose?: 'LEISURE' | 'BUSINESS' | 'FAMILY' | 'UNKNOWN';
  needsClarification?: boolean;
  clarificationQuestion?: string;
}

export interface AiClarificationCandidate {
  iataCode?: string;
  name?: string;
  cityName?: string;
  countryName?: string;
  subType?: string;
}

export interface AiFlightSearchResponse {
  mode: 'MOCK' | 'RESULTS' | 'CLARIFICATION';
  aiInsight?: string;
  question?: string;
  intent?: Partial<AiFlightSearchIntent>;
  candidates?: AiClarificationCandidate[];
  flights: FlightOffer[];
  followUpActions: Array<string | { label: string; query: string }>;
  cached?: boolean;
  searchRequestId?: string;
}
