export interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
  issues?: unknown[];
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
