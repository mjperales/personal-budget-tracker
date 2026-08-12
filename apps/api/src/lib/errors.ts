export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404),

  validation: (details: unknown) =>
    new AppError('VALIDATION_ERROR', 'Request body is invalid', 400, details),

  internal: () =>
    new AppError('INTERNAL_ERROR', 'An unexpected error occurred', 500),
};
