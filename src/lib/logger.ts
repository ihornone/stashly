/**
 * Structured JSON Logging according to rules/logging-standards
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  critical: 50,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'key',
  'apikey',
  'credentials',
  'telegram_bot_token',
  'clerk_secret_key',
]);

function redactSensitiveData(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj.replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]');
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        cleaned[key] = '[REDACTED]';
      } else {
        cleaned[key] = redactSensitiveData(value, depth + 1);
      }
    }
    return cleaned;
  }

  return obj;
}

export interface LogContext {
  event: string;
  requestId?: string;
  userId?: string | number;
  service?: string;
  durationMs?: number;
  statusCode?: number;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private minLevel: LogLevel;
  private serviceName: string;

  constructor(serviceName = 'stashly-web') {
    this.serviceName = serviceName;
    const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';
    this.minLevel = LOG_LEVEL_SEVERITY[envLevel] ? envLevel : 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_SEVERITY[level] >= LOG_LEVEL_SEVERITY[this.minLevel];
  }

  private emit(level: LogLevel, context: LogContext, message?: string) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: context.service || this.serviceName,
      message: message || context.event,
      ...context,
    };

    const sanitized = redactSensitiveData(logEntry) as Record<string, unknown>;
    const jsonString = JSON.stringify(sanitized);

    if (level === 'error' || level === 'critical') {
      console.error(jsonString);
    } else if (level === 'warn') {
      console.warn(jsonString);
    } else {
      console.log(jsonString);
    }
  }

  debug(context: LogContext, message?: string) {
    this.emit('debug', context, message);
  }

  info(context: LogContext, message?: string) {
    this.emit('info', context, message);
  }

  warn(context: LogContext, message?: string) {
    this.emit('warn', context, message);
  }

  error(context: LogContext, message?: string) {
    this.emit('error', context, message);
  }

  critical(context: LogContext, message?: string) {
    this.emit('critical', context, message);
  }
}

export const logger = new StructuredLogger('stashly-app');
