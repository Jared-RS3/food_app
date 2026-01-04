// performance.ts - Performance optimization utilities
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce hook for search and input fields
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle function for scroll handlers
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Hook for throttled callbacks
 * @param callback - Callback function
 * @param delay - Delay in milliseconds
 * @returns Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const throttledFn = useRef<ReturnType<typeof throttle> | null>(null);

  useEffect(() => {
    throttledFn.current = throttle(callback, delay);
  }, [callback, delay]);

  return useCallback((...args: Parameters<T>) => {
    throttledFn.current?.(...args);
  }, []);
}

/**
 * Hook to detect if component is mounted
 * Useful for preventing state updates on unmounted components
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

/**
 * Safely execute async operations
 * @param asyncFn - Async function to execute
 * @param onError - Optional error handler
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      console.error('Async operation failed:', error);
    }
    return null;
  }
}

/**
 * Image cache helper for better performance
 */
export const ImageCache = {
  cache: new Map<string, string>(),

  async prefetch(uri: string): Promise<void> {
    if (!this.cache.has(uri)) {
      // Prefetch logic here
      this.cache.set(uri, uri);
    }
  },

  clear(): void {
    this.cache.clear();
  },
};

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static start(label: string): void {
    this.marks.set(label, Date.now());
  }

  static end(label: string): number | null {
    const start = this.marks.get(label);
    if (!start) return null;

    const duration = Date.now() - start;
    console.log(`[Performance] ${label}: ${duration}ms`);
    this.marks.delete(label);
    return duration;
  }
}
