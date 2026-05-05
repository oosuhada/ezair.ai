// services/flightIntentSchema.js
const { z } = require('zod');

const iataCode = z.string().length(3).transform(v => v.toUpperCase()).optional();
const iataDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다.').optional();

const flightIntentSchema = z.object({
    tripType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']).default('ONE_WAY'),
    originText: z.string().optional(),
    destinationText: z.string().optional(),
    originIata: iataCode,
    destinationIata: iataCode,
    departDate: iataDate,
    returnDate: iataDate.nullable().optional(),
    adults: z.coerce.number().int().min(1).max(9).default(1),
    children: z.coerce.number().int().min(0).max(9).optional(),
    infants: z.coerce.number().int().min(0).max(9).optional(),
    travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
    nonStop: z.coerce.boolean().default(false),
    sortBy: z.enum(['CHEAPEST', 'FASTEST', 'RECOMMENDED']).default('RECOMMENDED'),
    budgetMax: z.number().positive().optional(),
    currency: z.enum(['KRW', 'USD', 'EUR', 'JPY']).default('KRW'),
    flexibilityDays: z.coerce.number().int().min(0).max(7).optional(),
    purpose: z.enum(['LEISURE', 'BUSINESS', 'FAMILY', 'UNKNOWN']).default('UNKNOWN'),
    needsClarification: z.coerce.boolean().default(false),
    clarificationQuestion: z.string().optional()
});

function normalizeIntent(input) {
    const result = flightIntentSchema.safeParse(input);
    if (!result.success) {
        return { ok: false, issues: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) };
    }

    const data = { ...result.data };
    const missing = [];
    if (!data.originIata && !data.originText) missing.push('출발지');
    if (!data.destinationIata && !data.destinationText) missing.push('도착지');
    if (!data.departDate) missing.push('출발일');

    if (missing.length > 0) {
        data.needsClarification = true;
        data.clarificationQuestion = `${missing.join(', ')} 정보를 조금 더 알려주세요.`;
    }

    return { ok: true, data };
}

module.exports = { flightIntentSchema, normalizeIntent };
