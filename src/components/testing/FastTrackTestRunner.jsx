import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, Loader2, Play, Trash2 } from 'lucide-react';

export default function FastTrackTestRunner() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const runTests = async (testGroup = null) => {
    setIsRunning(true);
    setTestResults(null);
    try {
      const response = await base44.functions.invoke('runFastTrackTests', {
        testGroup: testGroup,
      });
      setTestResults(response.data);
    } catch (error) {
      setTestResults({ error: error.message, results: [] });
    }
    setIsRunning(false);
  };

  const cleanupTestData = async () => {
    setIsCleaning(true);
    try {
      // Clean up all test- prefixed data
      const profiles = await base44.asServiceRole.entities.FastTrackProfile.filter({});
      const testProfiles = profiles.filter(p => p.user_email?.includes('cff.dev'));
      for (const p of testProfiles) {
        await base44.asServiceRole.entities.FastTrackProfile.delete(p.id);
      }

      const logs = await base44.asServiceRole.entities.InteractionLog.filter({});
      const testLogs = logs.filter(l => l.student_email?.includes('cff.dev'));
      for (const l of testLogs) {
        await base44.asServiceRole.entities.InteractionLog.delete(l.id);
      }

      const notifs = await base44.asServiceRole.entities.Notification.filter({});
      const testNotifs = notifs.filter(n => n.user_email?.includes('cff.dev'));
      for (const n of testNotifs) {
        await base44.asServiceRole.entities.Notification.delete(n.id);
      }

      const emailLogs = await base44.asServiceRole.entities.EmailLog.filter({});
      const testEmails = emailLogs.filter(e => e.user_email?.includes('cff.dev'));
      for (const e of testEmails) {
        await base44.asServiceRole.entities.EmailLog.delete(e.id);
      }

      alert(`Cleaned up: ${testProfiles.length} profiles, ${testLogs.length} interactions, ${testNotifs.length} notifications, ${testEmails.length} email logs`);
    } catch (error) {
      alert('Cleanup error: ' + error.message);
    }
    setIsCleaning(false);
  };

  const getIcon = (status) => {
    if (status === 'pass') return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
    if (status === 'fail') return <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />;
    return <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />;
  };

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader>
        <CardTitle className="text-indigo-900">🚀 Fast Track System Tests</CardTitle>
        <CardDescription>Validate interaction logging, feedback, tier advancement, and coaching flows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => runTests('1')}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Run Test 1.1: Completion</>
            )}
          </Button>
          <Button
            onClick={() => runTests('1.2')}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="w-4 h-4 mr-2" /> Run Test 1.2: No-Show
          </Button>
          <Button
            onClick={() => runTests('1.3')}
            disabled={isRunning}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="w-4 h-4 mr-2" /> Run Test 1.3: 3rd No-Show
          </Button>
          <Button
            onClick={() => runTests('2.1')}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" /> 2.1: Positive
          </Button>
          <Button
            onClick={() => runTests('2.2')}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" /> 2.2: Negative
          </Button>
          <Button
            onClick={() => runTests('2.3')}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" /> 2.3: Follow-Up
          </Button>
          <Button
            onClick={() => runTests('2.4')}
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" /> 2.4: Would Hire
          </Button>
          <Button
            onClick={() => runTests('3.1')}
            disabled={isRunning}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Play className="w-4 h-4 mr-2" /> 3.1: → Momentum
          </Button>
          <Button
            onClick={() => runTests('3.2')}
            disabled={isRunning}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Play className="w-4 h-4 mr-2" /> 3.2: → Rising
          </Button>
          <Button
            onClick={() => runTests('3.3')}
            disabled={isRunning}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Play className="w-4 h-4 mr-2" /> 3.3: → Fast Tracked
          </Button>
          <Button
            onClick={() => runTests('3.4')}
            disabled={isRunning}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Play className="w-4 h-4 mr-2" /> 3.4: Coaching Gate
          </Button>
          <Button
            onClick={() => runTests('3.5')}
            disabled={isRunning}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Play className="w-4 h-4 mr-2" /> 3.5: No Downgrade
          </Button>
          <Button
            onClick={() => runTests('4.1')}
            disabled={isRunning}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Play className="w-4 h-4 mr-2" /> 4.1: Report Card
          </Button>

          <Button
            onClick={cleanupTestData}
            disabled={isCleaning}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isCleaning ? 'Cleaning...' : 'Cleanup Test Data'}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-3">
            {/* Summary */}
            <div className={`p-3 rounded-lg border ${
              testResults.error ? 'bg-red-50 border-red-200' :
              testResults.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              {testResults.error ? (
                <p className="text-red-700 text-sm font-medium">Error: {testResults.error}</p>
              ) : (
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold">
                    {testResults.failed === 0 ? '✅ All tests passed' : `⚠️ ${testResults.failed} test(s) failed`}
                  </span>
                  <span className="text-green-700">{testResults.passed} passed</span>
                  <span className="text-red-700">{testResults.failed} failed</span>
                  <span className="text-gray-500">{testResults.total} total</span>
                </div>
              )}
            </div>

            {/* Individual results */}
            {testResults.results?.length > 0 && (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {testResults.results.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2 rounded text-xs ${
                      r.status === 'pass' ? 'bg-green-50' :
                      r.status === 'fail' ? 'bg-red-50' : 'bg-white'
                    }`}
                  >
                    {getIcon(r.status)}
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-gray-500 mr-2">{r.testId}</span>
                      <span className={r.status === 'fail' ? 'text-red-800 font-medium' : 'text-gray-700'}>
                        {r.message}
                      </span>
                      {r.details && (
                        <pre className="mt-1 text-gray-500 text-[10px] overflow-auto">
                          {JSON.stringify(r.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}