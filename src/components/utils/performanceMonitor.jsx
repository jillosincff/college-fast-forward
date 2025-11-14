/**
 * Performance monitoring utilities for tracking critical metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.startTimes = new Map();
  }

  // Mark the start of an operation
  start(operationName) {
    this.startTimes.set(operationName, performance.now());
  }

  // Mark the end of an operation and log duration
  end(operationName) {
    const startTime = this.startTimes.get(operationName);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operationName);

    const metric = {
      operation: operationName,
      duration: Math.round(duration),
      timestamp: new Date().toISOString()
    };

    this.metrics.push(metric);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${operationName} took ${Math.round(duration)}ms`);
    } else if (duration > 500) {
      console.log(`⏱️ ${operationName} took ${Math.round(duration)}ms`);
    }

    return metric;
  }

  // Get all recorded metrics
  getMetrics() {
    return this.metrics;
  }

  // Get average duration for an operation
  getAverage(operationName) {
    const filtered = this.metrics.filter(m => m.operation === operationName);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return Math.round(sum / filtered.length);
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
    this.startTimes.clear();
  }

  // Report performance summary
  report() {
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    console.group('📊 Performance Report');
    operations.forEach(op => {
      const avg = this.getAverage(op);
      const count = this.metrics.filter(m => m.operation === op).length;
      console.log(`${op}: ${avg}ms avg (${count} calls)`);
    });
    console.groupEnd();
  }
}

// Global instance
export const perfMonitor = new PerformanceMonitor();

// Utility to measure async operations
export async function measureAsync(operationName, asyncFn) {
  perfMonitor.start(operationName);
  try {
    const result = await asyncFn();
    perfMonitor.end(operationName);
    return result;
  } catch (error) {
    perfMonitor.end(operationName);
    throw error;
  }
}

// Report Web Vitals
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  // Log Core Web Vitals when available
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎨 LCP:', Math.round(lastEntry.startTime), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Silently fail if not supported
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('⚡ FID:', Math.round(entry.processingStart - entry.startTime), 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Silently fail if not supported
    }
  }

  // Log when page is fully loaded
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('📄 Page Load Time:', Math.round(pageLoadTime), 'ms');
  });
}