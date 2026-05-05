export type TravelClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type TripType = 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string | null;
  adults: number;
  travelClass: TravelClass;
  nonStop: boolean;
}

export interface LocationSuggestion {
  iataCode?: string;
  name: string;
  subType?: 'CITY' | 'AIRPORT' | string;
  address?: {
    cityName?: string;
    countryName?: string;
  };
}

export interface FlightPrice {
  amount: number;
  currency: string;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineCode?: string;
  airlineLogo?: string;
  flightNumber?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops?: number;
  direct?: boolean;
  price: FlightPrice;
  recommendation?: string;
  recommendationScore?: number;
  recommendationReason?: string;
}
