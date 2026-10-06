/**
 * Application Error Hierarchy according to rules/error-handling-standards
 */
import { NextResponse } from 'next/server';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppErrorOptions {
  code?: string;
  userMessage?: string;
  isOperational?: boolean;
  severity?: ErrorSeverity;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly isOperational: boolean;
  public readonly severity: ErrorSeverity;
  public readonly metadata?: Record<string, unknown>;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.userMessage = options.userMessage ?? 'An unexpected error occurred. Please try again.';
    this.isOperational = options.isOperational ?? true;
    this.severity = options.severity ?? 'medium';
    this.metadata = options.metadata;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, 400, {
      code: options.code ?? 'VALIDATION_ERROR',
      userMessage: options.userMessage ?? message,
      severity: options.severity ?? 'low',
      ...options,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', options: AppErrorOptions = {}) {
    super(message, 401, {
      code: options.code ?? 'AUTHENTICATION_ERROR',
      userMessage: options.userMessage ?? 'Please sign in to continue.',
      severity: options.severity ?? 'medium',
      ...options,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Permission denied', options: AppErrorOptions = {}) {
    super(message, 403, {
      code: options.code ?? 'AUTHORIZATION_ERROR',
      userMessage: options.userMessage ?? 'You do not have permission to perform this action.',
      severity: options.severity ?? 'medium',
      ...options,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', options: AppErrorOptions = {}) {
    const msg = `${resource} not found`;
    super(msg, 404, {
      code: options.code ?? 'NOT_FOUND',
      userMessage: options.userMessage ?? msg,
      severity: options.severity ?? 'low',
      ...options,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, 409, {
      code: options.code ?? 'CONFLICT_ERROR',
      userMessage: options.userMessage ?? message,
      severity: options.severity ?? 'low',
      ...options,
    });
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterSeconds?: number;

  constructor(message = 'Too many requests', retryAfterSeconds?: number, options: AppErrorOptions = {}) {
    super(message, 429, {
      code: options.code ?? 'RATE_LIMIT_EXCEEDED',
      userMessage: options.userMessage ?? 'You have made too many requests. Please slow down.',
      severity: options.severity ?? 'medium',
      metadata: { ...options.metadata, retryAfterSeconds },
      ...options,
    });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class TimeoutError extends AppError {
  constructor(operation = 'Operation', options: AppErrorOptions = {}) {
    const msg = `${operation} timed out`;
    super(msg, 504, {
      code: options.code ?? 'TIMEOUT_ERROR',
      userMessage: options.userMessage ?? 'The server took too long to respond. Please try again.',
      severity: options.severity ?? 'medium',
      ...options,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, options: AppErrorOptions = {}) {
    super(`External service error (${service}): ${message}`, 502, {
      code: options.code ?? 'EXTERNAL_SERVICE_ERROR',
      userMessage: options.userMessage ?? 'An external service failed to respond. Please try again later.',
      severity: options.severity ?? 'high',
      metadata: { ...options.metadata, service },
      ...options,
    });
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', options: AppErrorOptions = {}) {
    super(message, 500, {
      code: options.code ?? 'INTERNAL_SERVER_ERROR',
      userMessage: options.userMessage ?? 'An internal server error occurred.',
      severity: options.severity ?? 'high',
      isOperational: false,
      ...options,
    });
  }
}

/**
 * Standard API error responder for Next.js App Router Route Handlers
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        userMessage: error.userMessage,
        ...(error.metadata ? { metadata: error.metadata } : {}),
      },
      {
        status: error.statusCode,
        headers:
          error instanceof RateLimitError && error.retryAfterSeconds
            ? { 'Retry-After': String(error.retryAfterSeconds) }
            : undefined,
      }
    );
  }

  const genericMsg = error instanceof Error ? error.message : 'Unknown server error';
  return NextResponse.json(
    {
      error: genericMsg,
      code: 'INTERNAL_SERVER_ERROR',
      userMessage: 'An unexpected server error occurred.',
    },
    { status: 500 }
  );
}
