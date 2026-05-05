import type { FeedbackInput, SaveSearchRequestInput } from './types';

const searches = new Map<string, SaveSearchRequestInput & { id: string; createdAt: string }>();
const snapshots = new Map<string, unknown[]>();
const feedback = new Map<string, FeedbackInput & { id: string; createdAt: string }>();

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveSearchRequest(input: SaveSearchRequestInput) {
  const id = createId('search');
  searches.set(id, { ...input, id, createdAt: new Date().toISOString() });
  return { id };
}

export async function saveFlightOfferSnapshots(searchRequestId: string, flights: unknown[]) {
  snapshots.set(searchRequestId, flights);
  return { count: flights.length };
}

export async function saveFeedback(input: FeedbackInput) {
  const id = createId('feedback');
  feedback.set(id, { ...input, id, createdAt: new Date().toISOString() });
  return { id };
}

export function getRepositoryStats() {
  return { searches: searches.size, snapshots: snapshots.size, feedback: feedback.size };
}
