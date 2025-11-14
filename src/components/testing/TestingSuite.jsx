import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Shield
} from 'lucide-react';

export default function TestingSuite() {
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState(new Set());

  const runTest = async (testId, testName) => {
    console.log(`Starting test: ${testId}`);
    
    setRunningTests(prev => new Set(prev).add(testId));
    setTestResults(prev => ({
      ...prev,
      [testId]: { status: 'running', startTime: Date.now() }
    }));

    try {
      // Make the API call to the backend function
      const response = await fetch('/functions/runE2ETests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          testConfig: {}
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Test result:', result);

      setTestResults(prev => ({
        ...prev,
        [testId]: {
          ...result,
          endTime: Date.now()
        }
      }));

    } catch (error) {
      console.error('Test execution error:', error);
      
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: 'failed',
          details: `Test execution failed: ${error.message}`,
          error: error.message,
          endTime: Date.now()
        }
      }));
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running...</Badge>;
      default: return <Badge variant="outline">Ready</Badge>;
    }
  };

  const testCategories = [
    {
      title: 'Core User Flows',
      icon: <Shield className="w-5 h-5" />,
      tests: [
        {
          id: 'auth-flow',
          name: 'Authentication Flow',
          description: 'Tests user login, session management, and authorization'
        },
        {
          id: 'onboarding-flow',
          name: 'User Onboarding',
          description: 'Tests new user registration and setup process'
        },
        {
          id: 'job-request-flow',
          name: 'Job Request Creation',
          description: 'Tests creating and managing job requests'
        },
        {
          id: 'connection-flow',
          name: 'Connection Making',
          description: 'Tests user-to-user connections and messaging'
        }
      ]
    },
    {
      title: 'Security Tests',
      icon: <Shield className="w-5 h-5" />,
      tests: [
        {
          id: 'xss-protection',
          name: 'XSS Protection',
          description: 'Tests against cross-site scripting vulnerabilities'
        },
        {
          id: 'auth-bypass',
          name: 'Auth Bypass Prevention',
          description: 'Tests that protected routes require authentication'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            CFF Testing Suite
          </h1>
          <p className="text-slate-600">
            Automated end-to-end testing for College Fast Forward platform
          </p>
        </div>

        <div className="space-y-8">
          {testCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.tests.map((test) => {
                    const result = testResults[test.id];
                    const isRunning = runningTests.has(test.id);
                    
                    return (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(result?.status)}
                          <div>
                            <h3 className="font-semibold text-slate-900">{test.name}</h3>
                            <p className="text-sm text-slate-600">{test.description}</p>
                            {result?.details && (
                              <p className="text-xs text-slate-500 mt-1">{result.details}</p>
                            )}
                            {result?.steps && (
                              <div className="mt-2 space-y-1">
                                {result.steps.map((step, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    {step.status === 'passed' ? (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : step.status === 'failed' ? (
                                      <XCircle className="w-3 h-3 text-red-500" />
                                    ) : (
                                      <Clock className="w-3 h-3 text-gray-400" />
                                    )}
                                    <span className="capitalize">{step.step.replace('-', ' ')}</span>
                                    {step.details && <span className="text-slate-500">- {step.details}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(result?.status)}
                          <Button
                            onClick={() => runTest(test.id, test.name)}
                            disabled={isRunning}
                            size="sm"
                          >
                            {isRunning ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(testResults).map(([testId, result]) => (
                  <div key={testId} className="flex items-center justify-between text-sm">
                    <span>{testId}</span>
                    <span className={result.status === 'passed' ? 'text-green-600' : 'text-red-600'}>
                      {result.status === 'passed' ? '✓ Passed' : '✗ Failed'}
                      {result.duration && ` (${result.duration}ms)`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}