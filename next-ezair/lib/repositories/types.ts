export interface SaveSearchRequestInput {
  queryText?: string;
  parsedParams?: unknown;
  originIata?: string;
  destinationIata?: string;
  departDate?: string;
  returnDate?: string | null;
  adults?: number;
  travelClass?: string;
  nonStop?: boolean;
}

export interface FeedbackInput {
  searchRequestId: string;
  rating: number;
  comment?: string;
  selectedOfferId?: string;
}
