import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  TimeoutError,
  ExternalServiceError,
  InternalError,
  handleApiError,
} from './errors';

describe('Error Hierarchy & handleApiError', () => {
  it('instantiates AppError with correct defaults', () => {
    const error = new AppError('Something happened', 500);
    expect(error.message).toBe('Something happened');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.severity).toBe('medium');
  });

  it('instantiates ValidationError with 400 status', () => {
    const error = new ValidationError('Invalid input data');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.severity).toBe('low');
  });

  it('instantiates AuthenticationError with 401 status', () => {
    const error = new AuthenticationError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('AUTHENTICATION_ERROR');
  });

  it('instantiates AuthorizationError with 403 status', () => {
    const error = new AuthorizationError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('AUTHORIZATION_ERROR');
  });

  it('instantiates NotFoundError with 404 status', () => {
    const error = new NotFoundError('Bookmark');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Bookmark not found');
    expect(error.code).toBe('NOT_FOUND');
  });

  it('instantiates RateLimitError with 429 status and retryAfterSeconds', () => {
    const error = new RateLimitError('Too many requests', 60);
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect(error.retryAfterSeconds).toBe(60);
  });

  it('handleApiError formats AppError into json response correctly', async () => {
    const error = new ValidationError('Invalid email format', { metadata: { field: 'email' } });
    const response = handleApiError(error);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid email format');
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.metadata).toEqual({ field: 'email' });
  });

  it('handleApiError handles generic Error gracefully with 500 status', async () => {
    const generic = new Error('Database connection failed');
    const response = handleApiError(generic);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.error).toBe('Database connection failed');
  });
});
