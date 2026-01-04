/**
 * Centralized Logging Service
 * Provides structured logging with production error tracking hooks
 */

export interface LogContext {
  component?: string;
  metadata?: Record<string, any>;
}

class Logger {
  /**
   * Debug level logging (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (__DEV__) {
      console.log(
        `[DEBUG] ${message}`,
        context ? JSON.stringify(context, null, 2) : ''
      );
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    console.log(
      `[INFO] ${message}`,
      context ? JSON.stringify(context, null, 2) : ''
    );
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    console.warn(
      `[WARN] ${message}`,
      context ? JSON.stringify(context, null, 2) : ''
    );
  }

  /**
   * Error level logging with optional Error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    // Only log if we have an actual error
    if (!error) {
      return; // Silently return if no error
    }

    const errorDetails =
      error instanceof Error
        ? `\n${error.message}\n${error.stack}`
        : `\n${String(error)}`;

    console.error(
      `[ERROR] ${message}`,
      errorDetails,
      context ? JSON.stringify(context, null, 2) : ''
    );

    // Hook for production error tracking (Sentry, LogRocket, etc.)
    if (!__DEV__ && error instanceof Error) {
      this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * Performance logging
   */
  performance(label: string, duration: number, context?: LogContext): void {
    if (__DEV__) {
      console.log(
        `[PERF] ${label}: ${duration}ms`,
        context ? JSON.stringify(context, null, 2) : ''
      );
    }

    // Hook for production performance monitoring
    if (!__DEV__) {
      this.sendToMonitoring(label, duration, context);
    }
  }

  /**
   * Send to production error tracking service
   * TODO: Integrate with Sentry or similar service
   */
  private sendToErrorTracking(
    message: string,
    error: Error,
    context?: LogContext
  ): void {
    // Example: Sentry.captureException(error, { extra: { message, ...context } });
  }

  /**
   * Send to production monitoring service
   * TODO: Integrate with performance monitoring
   */
  private sendToMonitoring(
    label: string,
    duration: number,
    context?: LogContext
  ): void {
    // Example: analytics.track('performance', { label, duration, ...context });
  }
}

export const logger = new Logger();
