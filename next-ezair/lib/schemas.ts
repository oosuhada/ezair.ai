import { z } from 'zod';

export const travelClassSchema = z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']);

export const flightSearchRequestSchema = z.object({
  origin: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  destination: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  travelClass: travelClassSchema.default('ECONOMY'),
  nonStop: z.coerce.boolean().default(false),
});

export const aiFlightSearchIntentSchema = z.object({
  tripType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']).default('ONE_WAY'),
  originText: z.string().optional(),
  destinationText: z.string().optional(),
  originIata: z.string().regex(/^[A-Z]{3}$/).optional(),
  destinationIata: z.string().regex(/^[A-Z]{3}$/).optional(),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  children: z.coerce.number().int().min(0).max(9).optional(),
  infants: z.coerce.number().int().min(0).max(9).optional(),
  travelClass: travelClassSchema.default('ECONOMY'),
  nonStop: z.coerce.boolean().default(false),
  sortBy: z.enum(['CHEAPEST', 'FASTEST', 'RECOMMENDED']).default('RECOMMENDED'),
  budgetMax: z.coerce.number().positive().optional(),
  currency: z.enum(['KRW', 'USD', 'EUR', 'JPY']).default('KRW'),
  flexibilityDays: z.coerce.number().int().min(0).max(7).optional(),
  purpose: z.enum(['LEISURE', 'BUSINESS', 'FAMILY', 'UNKNOWN']).default('UNKNOWN'),
  needsClarification: z.boolean().default(false),
  clarificationQuestion: z.string().optional(),
});

export type FlightSearchRequest = z.infer<typeof flightSearchRequestSchema>;
export type AiFlightSearchIntent = z.infer<typeof aiFlightSearchIntentSchema>;
