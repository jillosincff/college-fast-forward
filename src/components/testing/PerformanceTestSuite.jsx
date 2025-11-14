import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode, FileImage, Palette, Loader2 } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import logger from '@/components/utils/logger';

// A small component to display a single performance metric.
const PerfMetric = ({ name, value, status, unit = 'ms' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex justify-between items-center py-2 border-b">
      <span className="text-slate-600">{name}</span>
      <div className="flex items-center gap-3">
        <span className={`font-bold ${value === 'Unavailable' ? 'text-sm text-slate-400' : ''}`}>{value}{value !== 'Unavailable' && unit}</span>
        <span className={`text-sm font-semibold ${getStatusColor()}`}>{status}</span>
      </div>
    </div>
  );
};

// A component to display a row in the resource breakdown.
const ResourceRow = ({ icon, type, count, size }) => (
    <div className="flex items-center gap-4 py-2">
        <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
        <div className="flex-1">
            <p className="font-semibold text-slate-800">{type}</p>
            <p className="text-sm text-slate-500">{count} files</p>
        </div>
        <div className="font-medium text-slate-700">{size}</div>
    </div>
);

const PerformanceTestSuite = () => {
  const [loadTimes, setLoadTimes] = useState(null);
  const [bundleSize, setBundleSize] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = () => {
    setIsRunning(true);
    setLoadTimes(null);
    setBundleSize(null);
    trackEvent('test_run', { test: 'performance_suite' });

    // Use a timeout to ensure all performance entries are available.
    // This makes the test more reliable.
    setTimeout(() => {
      try {
        setLoadTimes(runLoadTimesTest());
        setBundleSize(runBundleSizeTest());
      } catch (error) {
        logger.error('Performance test suite failed', { error });
        setLoadTimes({ status: 'ERROR', note: 'Could not run load time tests.' });
        setBundleSize({ status: 'ERROR', note: 'Could not run bundle size tests.' });
      } finally {
        setIsRunning(false);
      }
    }, 1000); // Wait 1 second for metrics to be ready.
  };
  
  const runLoadTimesTest = () => {
    if (!performance || !performance.timing) {
      return { status: 'UNAVAILABLE' };
    }

    const timing = performance.timing;
    const results = {};

    const dns = timing.domainLookupEnd - timing.domainLookupStart;
    results.dns = { value: dns, status: dns < 100 ? 'Excellent' : 'Good' };

    const tcp = timing.connectEnd - timing.connectStart;
    results.tcp = { value: tcp, status: tcp < 100 ? 'Excellent' : 'Good' };

    const ttfb = timing.responseStart - timing.requestStart;
    results.ttfb = { value: ttfb, status: ttfb < 200 ? 'Excellent' : ttfb < 500 ? 'Good' : 'Poor' };

    const domLoad = timing.domContentLoadedEventEnd - timing.navigationStart;
    results.domLoad = { value: domLoad > 0 ? domLoad : 'Unavailable', status: domLoad < 2000 ? 'Good' : 'Poor' };

    const windowLoad = timing.loadEventEnd - timing.navigationStart;
    results.windowLoad = { value: windowLoad > 0 ? windowLoad : 'Unavailable', status: windowLoad < 3000 ? 'Good' : 'Poor' };

    return results;
  };

  const runBundleSizeTest = () => {
    const resources = performance.getEntriesByType("resource");
    if (!resources || resources.length === 0) {
      return { totalSize: 0, js: { count: 0, size: 0 }, css: { count: 0, size: 0 }, images: { count: 0, size: 0 }, status: 'UNAVAILABLE' };
    }

    let totalSize = 0;
    const js = { count: 0, size: 0 };
    const css = { count: 0, size: 0 };
    const images = { count: 0, size: 0 };

    resources.forEach(res => {
      const size = res.transferSize || 0;
      totalSize += size;

      if (res.initiatorType === 'script' || res.name.endsWith('.js')) {
        js.count++;
        js.size += size;
      } else if (res.initiatorType === 'css' || res.name.endsWith('.css')) {
        css.count++;
        css.size += size;
      } else if (res.initiatorType === 'img') {
        images.count++;
        images.size += size;
      }
    });

    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    const targetSizeMB = 1.2;
    
    return { totalSize: totalSizeMB, js, css, images, status: totalSizeMB <= targetSizeMB ? 'PASS' : 'FAIL' };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Test Suite</CardTitle>
        <CardDescription>Analyze page load times and resource sizes. Results may vary slightly on each run.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={runAllTests} disabled={isRunning} className="w-full mb-6 h-11">
          {isRunning ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Running...</>
          ) : (
            'Run Load Time & Bundle Analysis'
          )}
        </Button>
        
        {loadTimes && loadTimes.status !== 'ERROR' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Load Times</h3>
            <div className="mt-2 space-y-1">
              <PerfMetric name="DNS" {...loadTimes.dns} />
              <PerfMetric name="TCP" {...loadTimes.tcp} />
              <PerfMetric name="TTFB" {...loadTimes.ttfb} />
              <PerfMetric name="DOM Load" {...loadTimes.domLoad} />
              <PerfMetric name="Window Load" {...loadTimes.windowLoad} />
            </div>
          </div>
        )}

        {bundleSize && bundleSize.status !== 'ERROR' && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-800 pt-4 mt-4 border-t">Bundle Size Analysis</h3>
                <div className="flex justify-between items-baseline p-4 bg-slate-50 rounded-lg">
                    <div>
                        <p className="text-sm text-slate-600">Total Bundle Size</p>
                        <p className="text-3xl font-bold text-slate-900">{bundleSize.totalSize}MB</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Target: 1.2 MB</p>
                        <p className={`font-semibold ${bundleSize.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>Status: {bundleSize.status}</p>
                    </div>
                </div>

                <div className="mt-4 space-y-1">
                    <ResourceRow icon={<FileCode className="h-5 w-5 text-blue-600"/>} type="JavaScript" count={bundleSize.js.count} size={`${(bundleSize.js.size / 1024).toFixed(2)} KB`} />
                    <ResourceRow icon={<Palette className="h-5 w-5 text-purple-600"/>} type="CSS" count={bundleSize.css.count} size={`${(bundleSize.css.size / 1024).toFixed(2)} KB`} />
                    <ResourceRow icon={<FileImage className="h-5 w-5 text-orange-600"/>} type="Images" count={bundleSize.images.count} size={`${(bundleSize.images.size / 1024).toFixed(2)} KB`} />
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceTestSuite;