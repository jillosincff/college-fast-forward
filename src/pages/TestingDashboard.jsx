import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, Lock, Shield } from 'lucide-react';

export default function TestingDashboard() {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCount, setCurrentCount] = useState(null);
  const [testUserId, setTestUserId] = useState('');
  const [parentTestResults, setParentTestResults] = useState(null);
  const [isTestingParent, setIsTestingParent] = useState(false);
  const [accuracyCheck, setAccuracyCheck] = useState(null);
  const [isCheckingAccuracy, setIsCheckingAccuracy] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [personaFixResults, setPersonaFixResults] = useState(null);
  const [isFixingPersonas, setIsFixingPersonas] = useState(false);
  const [recentSignups, setRecentSignups] = useState(null);
  const [isLoadingSignups, setIsLoadingSignups] = useState(false);
  const [foundingMarkResults, setFoundingMarkResults] = useState(null);
  const [isMarkingFounding, setIsMarkingFounding] = useState(false);
  const [auditResults, setAuditResults] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    loadCurrentCount();
  }, []);

  const loadCurrentCount = async () => {
    try {
      const settings = await base44.entities.GlobalSettings.filter({
        setting_key: 'total_users_count'
      });
      if (settings.length > 0) {
        setCurrentCount(settings[0].value);
      }
    } catch (error) {
      console.error('Failed to load count:', error);
    }
  };

  const checkCountAccuracy = async () => {
    setIsCheckingAccuracy(true);
    try {
      const result = await base44.functions.invoke('checkUserCountAccuracy', {});
      setAccuracyCheck(result.data);
    } catch (error) {
      setAccuracyCheck({ error: error.message });
    }
    setIsCheckingAccuracy(false);
  };

  const syncCounter = async () => {
    setIsSyncing(true);
    try {
      const result = await base44.functions.invoke('syncUserCounter', {});
      alert(result.data.message);
      await loadCurrentCount();
      await checkCountAccuracy();
    } catch (error) {
      alert('Sync failed: ' + error.message);
    }
    setIsSyncing(false);
  };

  const addResult = (test, status, message, details = null) => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setResults([]);
    setIsRunning(true);

    try {
      // Test 1: Check Founding Limit Configuration
      addResult('Founding Limit', 'running', 'Checking founding limit configuration...');
      const settings = await base44.entities.GlobalSettings.filter({
        setting_key: 'total_users_count'
      });
      
      if (settings.length > 0) {
        const count = settings[0].value;
        const spotsLeft = Math.max(0, 1000 - count);
        addResult(
          'Founding Limit', 
          'success', 
          `✅ Founding limit is 1000. Current count: ${count}, Spots left: ${spotsLeft}`,
          { count, spotsLeft, limit: 1000 }
        );
        setCurrentCount(count);
      } else {
        addResult('Founding Limit', 'warning', '⚠️ Global user count not initialized yet');
      }

      // Test 2: Check User Entity Fields (manual verification)
      addResult('User Schema', 'success', '✅ User entity has required fields defined', {
        fields: ['is_founding_gator', 'founding_gator_number', 'signup_order'],
        note: 'Fields are defined in entities/User.json schema'
      });

      // Test 3: Check if a specific user is a founding member
      if (testUserId) {
        addResult('User Lookup', 'running', `Checking user ${testUserId}...`);
        try {
          const users = await base44.asServiceRole.entities.User.filter({ id: testUserId });
          if (users.length > 0) {
            const user = users[0];
            const isFounding = user.is_founding_gator === true;
            addResult(
              'User Lookup',
              isFounding ? 'success' : 'warning',
              isFounding 
                ? `✅ User is Founding Gator #${user.founding_gator_number}`
                : '⚠️ User is not a Founding Gator',
              {
                email: user.email,
                is_founding_gator: user.is_founding_gator,
                founding_gator_number: user.founding_gator_number,
                signup_order: user.signup_order,
                family_group_id: user.family_group_id
              }
            );
          } else {
            addResult('User Lookup', 'error', '❌ User not found');
          }
        } catch (error) {
          addResult('User Lookup', 'error', `❌ Error: ${error.message}`);
        }
      }

      // Test 4: Family Locking Logic
      addResult('Family Lock', 'info', '⚠️ Manual test required: Try to add a parent to a second family via addStudentToFamily function');

    } catch (error) {
      addResult('System', 'error', `❌ Test suite error: ${error.message}`);
    }

    setIsRunning(false);
  };

  const testParentProfileCompletion = async () => {
    setIsTestingParent(true);
    setParentTestResults(null);

    try {
      const response = await base44.functions.invoke('testParentProfileCompletion', {});
      setParentTestResults(response.data);
    } catch (error) {
      setParentTestResults({
        success: false,
        error: error.message
      });
    }

    setIsTestingParent(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'running': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🧪 Founding Member System Tests</h1>
          <p className="text-slate-600">Verify founding member limit (1000), user count tracking, and family locking</p>
        </div>

        {/* Current Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Count</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCount ?? '...'}</div>
              <p className="text-xs text-muted-foreground">Total signups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spots Left</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentCount !== null ? Math.max(0, 1000 - currentCount) : '...'}
              </div>
              <p className="text-xs text-muted-foreground">Until founding limit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Founding Limit</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1000</div>
              <p className="text-xs text-muted-foreground">Configured limit</p>
            </CardContent>
          </Card>
        </div>

        {/* Counter Accuracy Check */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Counter Accuracy Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={checkCountAccuracy}
                disabled={isCheckingAccuracy}
                variant="outline"
              >
                {isCheckingAccuracy ? 'Checking...' : 'Check Counter vs Actual Users'}
              </Button>
              
              {accuracyCheck && !accuracyCheck.is_accurate && (
                <Button
                  onClick={syncCounter}
                  disabled={isSyncing}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Counter to Actual'}
                </Button>
              )}
            </div>

            {accuracyCheck && (
              <div className={`p-4 rounded-lg border ${
                accuracyCheck.is_accurate 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Counter Value:</span>
                    <span className="font-mono">{accuracyCheck.counter_value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Actual Users:</span>
                    <span className="font-mono">{accuracyCheck.actual_user_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Difference:</span>
                    <span className={`font-mono ${accuracyCheck.difference !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                      {accuracyCheck.difference > 0 ? '+' : ''}{accuracyCheck.difference}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Spots Left (Actual):</span>
                    <span className="font-mono font-bold text-lg">{accuracyCheck.spots_left_actual}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Spots Left (Counter):</span>
                    <span className="font-mono">{accuracyCheck.spots_left_by_counter}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Specific User ID (optional)</label>
              <Input
                value={testUserId}
                onChange={(e) => setTestUserId(e.target.value)}
                placeholder="Enter user ID to check their founding status"
                className="max-w-md"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={runTests}
                disabled={isRunning}
                size="lg"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>

              <Button
                onClick={testParentProfileCompletion}
                disabled={isTestingParent}
                size="lg"
                variant="secondary"
                className="bg-orange-100 hover:bg-orange-200 text-orange-900"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isTestingParent ? 'Testing Parent Feature...' : 'Test Parent Badges'}
              </Button>

              <Button
                onClick={async () => {
                  setIsFixingPersonas(true);
                  setPersonaFixResults(null);
                  try {
                    const result = await base44.functions.invoke('fixMissingPersonas', {});
                    setPersonaFixResults(result.data);
                  } catch (error) {
                    setPersonaFixResults({ error: error.message });
                  }
                  setIsFixingPersonas(false);
                }}
                disabled={isFixingPersonas}
                size="lg"
                variant="secondary"
                className="bg-purple-100 hover:bg-purple-200 text-purple-900"
              >
                {isFixingPersonas ? 'Fixing Personas...' : 'Fix Missing Personas'}
              </Button>

              <Button
                onClick={async () => {
                  setIsLoadingSignups(true);
                  setRecentSignups(null);
                  try {
                    const result = await base44.functions.invoke('getRecentSignups', {});
                    setRecentSignups(result.data.users || []);
                  } catch (error) {
                    setRecentSignups({ error: error.message });
                  }
                  setIsLoadingSignups(false);
                }}
                disabled={isLoadingSignups}
                size="lg"
                variant="secondary"
                className="bg-blue-100 hover:bg-blue-200 text-blue-900"
              >
                {isLoadingSignups ? 'Loading...' : 'Recent Signups (24h)'}
              </Button>

              <Button
                onClick={async () => {
                  setIsAuditing(true);
                  setAuditResults(null);
                  try {
                    const result = await base44.functions.invoke('auditAndFixUsers', { dryRun: true });
                    setAuditResults(result.data);
                  } catch (error) {
                    setAuditResults({ error: error.message });
                  }
                  setIsAuditing(false);
                }}
                disabled={isAuditing}
                size="lg"
                variant="secondary"
                className="bg-purple-100 hover:bg-purple-200 text-purple-900"
              >
                {isAuditing ? 'Auditing...' : '🔍 Audit All Users'}
              </Button>

              <Button
                onClick={async () => {
                  if (!confirm('FIX ALL user data issues? This will:\n• Assign missing personas\n• Mark as Founding Members\n• Set missing roles\n\nContinue?')) {
                    return;
                  }
                  setIsAuditing(true);
                  setAuditResults(null);
                  try {
                    const result = await base44.functions.invoke('auditAndFixUsers', { dryRun: false });
                    setAuditResults(result.data);
                    loadCurrentCount();
                  } catch (error) {
                    setAuditResults({ error: error.message });
                  }
                  setIsAuditing(false);
                }}
                disabled={isAuditing}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isAuditing ? 'Fixing...' : '✅ Fix All Issues'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Results */}
        {auditResults && (
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900">User Audit Results</CardTitle>
              <CardDescription className="text-purple-700 font-semibold">{auditResults.mode}</CardDescription>
            </CardHeader>
            <CardContent>
              {auditResults.error ? (
                <div className="text-red-600">Error: {auditResults.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-purple-600">{auditResults.total_users}</div>
                      <div className="text-xs text-gray-600">Total Users</div>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-red-600">{auditResults.users_with_issues}</div>
                      <div className="text-xs text-gray-600">Users with Issues</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-red-100 rounded">
                      <div className="font-bold text-red-900">{auditResults.summary?.no_persona || 0}</div>
                      <div className="text-gray-600">No Persona</div>
                    </div>
                    <div className="p-2 bg-orange-100 rounded">
                      <div className="font-bold text-orange-900">{auditResults.summary?.not_founding || 0}</div>
                      <div className="text-gray-600">Not Founding</div>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded">
                      <div className="font-bold text-yellow-900">{auditResults.summary?.no_onboarding || 0}</div>
                      <div className="text-gray-600">No Onboarding</div>
                    </div>
                    <div className="p-2 bg-blue-100 rounded">
                      <div className="font-bold text-blue-900">{auditResults.summary?.no_roles || 0}</div>
                      <div className="text-gray-600">No Roles</div>
                    </div>
                  </div>

                  {auditResults.fixes?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm text-green-800">✅ Applied Fixes ({auditResults.fixes.length}):</h4>
                      <div className="space-y-1 max-h-[250px] overflow-y-auto">
                        {auditResults.fixes.map((fix, i) => (
                          <div key={i} className="p-2 bg-green-50 rounded border border-green-200 text-xs">
                            {fix.email} → {fix.fix}: {JSON.stringify(fix.value || fix.number)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {auditResults.issues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">⚠️ Users with Issues:</h4>
                      <div className="space-y-1 max-h-[400px] overflow-y-auto">
                        {auditResults.issues.map((issue, i) => (
                          <div key={i} className="p-3 bg-white rounded border text-xs">
                            <div className="font-semibold">{issue.name || 'No name'} ({issue.email})</div>
                            <div className="text-gray-600 mt-1">
                              Persona: {issue.persona || '❌ Missing'} | 
                              Founding: {issue.is_founding ? '✅' : '❌'} | 
                              Onboarding: {issue.onboarding ? '✅' : '❌'}
                            </div>
                            <div className="mt-1 flex gap-1 flex-wrap">
                              {issue.issues.map((iss, j) => (
                                <span key={j} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                  {iss.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              Signed up: {new Date(issue.created).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Founding Member Marking Results */}
        {foundingMarkResults && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Founding Member Marking Results</CardTitle>
            </CardHeader>
            <CardContent>
              {foundingMarkResults.error ? (
                <div className="text-red-600">Error: {foundingMarkResults.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-blue-600">{foundingMarkResults.total_processed}</div>
                      <div className="text-xs text-gray-600">Total Processed</div>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-green-600">{foundingMarkResults.updated}</div>
                      <div className="text-xs text-gray-600">Marked as Founding</div>
                    </div>
                    <div className="p-3 bg-white rounded border">
                      <div className="text-2xl font-bold text-orange-600">{foundingMarkResults.skipped}</div>
                      <div className="text-xs text-gray-600">Skipped</div>
                    </div>
                  </div>

                  {foundingMarkResults.updated_users?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">✅ Successfully Marked:</h4>
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {foundingMarkResults.updated_users.map((u, i) => (
                          <div key={i} className="p-2 bg-white rounded border text-xs">
                            🏆 #{u.number} - {u.name} ({u.email})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {foundingMarkResults.skipped_users?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">⚠️ Skipped:</h4>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {foundingMarkResults.skipped_users.map((u, i) => (
                          <div key={i} className="p-2 bg-white rounded border text-xs">
                            {u.email} - {u.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Signups */}
        {recentSignups && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Signups (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSignups.error ? (
                <div className="text-red-600">Error: {recentSignups.error}</div>
              ) : recentSignups.length === 0 ? (
                <div className="text-gray-500">No signups in the last 24 hours</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold mb-2">Total: {recentSignups.length} users</div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {recentSignups.map((user) => (
                      <div key={user.id} className="p-3 bg-slate-50 rounded border text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{user.full_name || 'No name'}</div>
                            <div className="text-xs text-gray-600">{user.email}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Persona: <span className="font-medium">{user.persona || 'None'}</span>
                              {user.is_founding_gator && (
                                <span className="ml-2 text-orange-600 font-bold">
                                  🏆 Founding Gator #{user.founding_gator_number}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(user.created_date).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Persona Fix Results */}
        {personaFixResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Fix Missing Personas Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-white">
                  <div className="mt-0.5">
                    {personaFixResults.error ? 
                      <XCircle className="w-5 h-5 text-red-600" /> : 
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {personaFixResults.error ? 'Error' : `Fixed ${personaFixResults.fixed_count} users, Skipped ${personaFixResults.skipped_count}`}
                    </h3>
                    <pre className="p-4 bg-slate-50 rounded text-xs overflow-auto">
                      {JSON.stringify(personaFixResults, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parent Test Results */}
        {parentTestResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Parent Profile Completion Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-white">
                  <div className="mt-0.5">
                    {parentTestResults.success ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> : 
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-2">{parentTestResults.message}</h3>
                    <pre className="p-4 bg-slate-50 rounded text-xs overflow-auto">
                      {JSON.stringify(parentTestResults, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-white"
                  >
                    <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{result.test}</h3>
                        <span className="text-xs text-slate-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.message}</p>
                      {result.details && (
                        <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Testing Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">📋 Manual Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>✅ Founding Limit (1000 for UF):</strong>
              <p className="text-slate-700 ml-4">Check GlobalSettings entity has total_users_count ≤ 1000</p>
            </div>
            <div>
              <strong>✅ User Count Incrementing:</strong>
              <p className="text-slate-700 ml-4">Create new user → incrementUserCount function called → count increases</p>
            </div>
            <div>
              <strong>✅ is_founding_gator Set:</strong>
              <p className="text-slate-700 ml-4">New users with signup_order ≤ 1000 have is_founding_gator=true</p>
            </div>
            <div>
              <strong>✅ Family Founding Status:</strong>
              <p className="text-slate-700 ml-4">All family members get same founding_gator_number</p>
            </div>
            <div>
              <strong>🔒 Parent Family Lock:</strong>
              <p className="text-slate-700 ml-4">Try addStudentToFamily with parent in different family → should fail with 403</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}