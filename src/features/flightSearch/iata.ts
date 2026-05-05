export function extractIataCodeFromInput(input: string): string {
  const trimmed = input.trim().toUpperCase();
  const match = trimmed.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;
  return trimmed;
}
