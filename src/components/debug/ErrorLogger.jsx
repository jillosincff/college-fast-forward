/**
 * Error Logger - Tracks all errors and provides debugging info
 * Useful for identifying and fixing issues quickly
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Download, Trash2, XCircle } from 'lucide-react';
import { healthCheck } from '../utils/globalErrorHandler';

const ErrorLogger = () => {
  const [errors, setErrors] = useState([]);
  const [health, setHealth] = useState({ healthy: true, errorCount: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for custom error events
    const handleCustomError = (event) => {
      const { error, context } = event.detail;
      setErrors(prev => [...prev, {
        timestamp: new Date().toISOString(),
        message: error?.message || error,
        stack: error?.stack,
        context,
        id: Date.now()
      }].slice(-50)); // Keep last 50 errors
    };

    window.addEventListener('cff:error', handleCustomError);

    // Check health periodically
    const healthInterval = setInterval(() => {
      setHealth(healthCheck());
    }, 5000);

    return () => {
      window.removeEventListener('cff:error', handleCustomError);
      clearInterval(healthInterval);
    };
  }, []);

  // Keyboard shortcut to toggle error logger (Ctrl+Shift+E)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const exportErrors = () => {
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cff-errors-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearErrors = () => {
    if (window.confirm('Clear all logged errors?')) {
      setErrors([]);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant={health.healthy ? 'outline' : 'destructive'}
          className="shadow-lg"
        >
          {health.healthy ? (
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2" />
          )}
          {health.healthy ? 'System OK' : `${health.errorCount} Errors`}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-96 max-h-[600px] shadow-2xl">
      <Card className="border-2 border-slate-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Error Logger
              {!health.healthy && (
                <Badge variant="destructive" className="ml-2">
                  {health.errorCount} errors
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={exportErrors}
                disabled={errors.length === 0}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearErrors}
                disabled={errors.length === 0}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          {errors.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No errors logged</p>
              <p className="text-xs mt-1">System is healthy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-red-900">
                      {error.message}
                    </span>
                    <span className="text-red-600 text-xs">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {error.context && (
                    <div className="text-red-700 mt-1">
                      Context: {JSON.stringify(error.context, null, 2)}
                    </div>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600 hover:text-red-800">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-1 overflow-x-auto bg-red-100 p-2 rounded">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-xs text-center mt-2 text-slate-500">
        Press Ctrl+Shift+E to toggle
      </div>
    </div>
  );
};

export default ErrorLogger;