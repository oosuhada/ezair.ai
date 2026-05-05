import { searchFlights } from './api/flights';
import { aiFlightSearch } from './api/ai';

console.info('[EZ AIR] Vite/TypeScript scaffold loaded', {
  hasSearchFlights: typeof searchFlights === 'function',
  hasAiFlightSearch: typeof aiFlightSearch === 'function',
});
