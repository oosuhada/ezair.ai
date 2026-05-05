import type { FlightSearchRequest, TravelClass } from '../../types/flight';
import { extractIataCodeFromInput } from './iata';

export interface FormLikeState {
  originInput: string;
  destinationInput: string;
  departDate: string;
  returnDate?: string | null;
  adults?: number | string;
  travelClass?: TravelClass;
  nonStop?: boolean;
}

export function buildFlightSearchRequestFromFormLikeState(state: FormLikeState): FlightSearchRequest {
  return {
    origin: extractIataCodeFromInput(state.originInput),
    destination: extractIataCodeFromInput(state.destinationInput),
    departDate: state.departDate,
    returnDate: state.returnDate || undefined,
    adults: Number(state.adults || 1),
    travelClass: state.travelClass || 'ECONOMY',
    nonStop: Boolean(state.nonStop),
  };
}

export { extractIataCodeFromInput } from './iata';
export { validateFlightSearchRequest } from './validation';
export { formatKoreanDate, formatKoreanTime } from './format';
