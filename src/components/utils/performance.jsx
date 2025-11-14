// Performance monitoring and optimization utilities

export const performanceMonitor = {
  // Mark performance points
  mark: (name) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },

  // Measure performance between marks
  measure: (name, startMark, endMark) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measure = window.performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
        return measure.duration;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
    return 0;
  },

  // Get Core Web Vitals
  getCoreWebVitals: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      return {
        fcp: performanceMonitor.getFCP(),
        lcp: performanceMonitor.getLCP(),
        fid: performanceMonitor.getFID(),
        cls: performanceMonitor.getCLS()
      };
    }
    return null;
  },

  // First Contentful Paint
  getFCP: () => {
    const fcpEntry = window.performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry ? fcpEntry.startTime : null;
  },

  // Largest Contentful Paint
  getLCP: () => {
    let lcp = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      lcp = entries[entries.length - 1].startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    return lcp;
  },

  // First Input Delay
  getFID: () => {
    let fid = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      fid = entries[0].processingStart - entries[0].startTime;
    }).observe({ entryTypes: ['first-input'] });
    return fid;
  },

  // Cumulative Layout Shift
  getCLS: () => {
    let cls = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
    return cls;
  }
};

// Debounce utility for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    console.log('Memory Usage:', {
      used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
    });
    
    // Warn if memory usage is high
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) {
      console.warn(`High memory usage detected: ${usagePercent.toFixed(1)}%`);
    }
  }
};

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  // Check if we're in development by looking for common dev indicators
  const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('dev') ||
    window.location.search.includes('debug=true')
  );

  if (isDevelopment) {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      if (script.src.includes('chunk')) {
        fetch(script.src, { method: 'HEAD' })
          .then(response => {
            const size = parseInt(response.headers.get('content-length'), 10);
            totalSize += size || 0;
            console.log(`Script: ${script.src.split('/').pop()} - ${(size / 1024).toFixed(2)} KB`);
          })
          .catch(() => {
            // Silently fail if we can't fetch script info
          });
      }
    });
    
    setTimeout(() => {
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }, 1000);
  }
};