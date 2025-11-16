import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  TestTube, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Users,
  UserPlus,
  Copy,
  ExternalLink,
  Database,
  Ticket
} from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function TestingDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [inviteTestResults, setInviteTestResults] = useState(null);
  const [isRunningInviteTest, setIsRunningInviteTest] = useState(false);
  const [creatingTestUser, setCreatingTestUser] = useState(false);
  const [testUserInfo, setTestUserInfo] = useState(null);
  const [creatingSampleParents, setCreatingSampleParents] = useState(false);
  const [sampleParentsResult, setSampleParentsResult] = useState(null);
  
  // New state for custom invite code generation
  const [customCode, setCustomCode] = useState('');
  const [generatingCustomCode, setGeneratingCustomCode] = useState(false);
  const [generatedCodeInfo, setGeneratedCodeInfo] = useState(null);

  useEffect(() => {
    if (!user || !user.roles?.includes('admin')) {
      navigate('Dashboard');
    }
  }, [user]);

  const runE2ETests = async () => {
    setIsRunning(true);
    setTestResults(null);

    try {
      const response = await base44.functions.invoke('runE2ETests', {});
      setTestResults(response.data);

      if (response.data.success) {
        toast({
          title: "✅ All Tests Passed",
          description: "Critical user flows are working correctly",
        });
      } else {
        toast({
          title: "⚠️ Some Tests Failed",
          description: "Check the results below for details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('E2E test failed:', error);
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runCommunityInviteTests = async () => {
    setIsRunningInviteTest(true);
    setInviteTestResults(null);

    try {
      const response = await base44.functions.invoke('testCommunityInvite', {
        action: 'full'
      });

      setInviteTestResults(response.data.results);

      if (response.data.success) {
        toast({
          title: "✅ All Tests Passed!",
          description: `${response.data.results.summary.passed}/${response.data.results.summary.total} tests successful`,
        });
      } else {
        toast({
          title: "⚠️ Some Tests Failed",
          description: `${response.data.results.summary.failed} test(s) failed`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Community invite test failed:', error);
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunningInviteTest(false);
    }
  };

  const generateCustomInviteCode = async () => {
    if (!customCode.trim()) {
      toast({ 
        title: "Please enter a code name", 
        variant: "destructive" 
      });
      return;
    }

    setGeneratingCustomCode(true);
    setGeneratedCodeInfo(null);

    try {
      const response = await base44.functions.invoke('generateCommunityInvite', {
        custom_code: customCode.trim().toUpperCase(),
        group_name: 'Admin Testing',
        target_role: 'parent',
        max_uses: 5000,
        expiration_days: 365
      });

      if (response.data.success) {
        setGeneratedCodeInfo(response.data);
        toast({
          title: "✅ Custom Code Generated!",
          description: `Code "${response.data.code}" is ready to use`,
        });
        setCustomCode('');
      } else {
        throw new Error(response.data.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Generate custom code failed:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGeneratingCustomCode(false);
    }
  };

  const getTestInstructions = async () => {
    setCreatingTestUser(true);
    setTestUserInfo(null);

    try {
      const response = await base44.functions.invoke('createTestUser', {}); 

      if (response.data.success) {
        setTestUserInfo(response.data);
        toast({
          title: "✅ Test Instructions Ready!",
          description: "Follow the steps below to test InviteRequired page",
        });
      } else {
        throw new Error(response.data.error || 'Failed to get test instructions');
      }
    } catch (error) {
      console.error('Get test instructions failed:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreatingTestUser(false);
    }
  };

  const createSampleParents = async () => {
    setCreatingSampleParents(true);
    setSampleParentsResult(null);

    try {
      const response = await base44.functions.invoke('createSampleParents', {});

      if (response.data.success) {
        setSampleParentsResult(response.data);
        toast({
          title: "✅ Sample Parents Created!",
          description: `${response.data.created} parent profiles created/updated`,
        });
      } else {
        throw new Error(response.data.error || 'Failed to create sample parents');
      }
    } catch (error) {
      console.error('Create sample parents failed:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setCreatingSampleParents(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  if (!user || !user.roles?.includes('admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TestTube className="w-8 h-8 text-blue-600" />
            Testing Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Run automated tests and get instructions for manual testing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generate Custom Invite Code - NEW */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                Generate Custom Invite Code
              </CardTitle>
              <CardDescription>
                Create your own custom invite code (e.g., "UFPARENTS", "GATORS2025")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-code">Custom Code Name</Label>
                <Input
                  id="custom-code"
                  placeholder="UFPARENTS"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  maxLength={20}
                  disabled={generatingCustomCode}
                />
                <p className="text-xs text-slate-500">
                  Letters and numbers only, automatically converted to uppercase
                </p>
              </div>
              
              <Button
                onClick={generateCustomInviteCode}
                disabled={generatingCustomCode || !customCode.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generatingCustomCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 mr-2" />
                    Generate Code
                  </>
                )}
              </Button>

              {generatedCodeInfo && (
                <div className="space-y-3 mt-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Code Generated Successfully!
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white p-3 rounded border">
                        <span className="font-mono text-xl font-bold text-purple-900">
                          {generatedCodeInfo.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedCodeInfo.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-purple-700">
                        • Valid for {generatedCodeInfo.max_uses} uses
                      </p>
                      <p className="text-xs text-purple-700">
                        • Type: {generatedCodeInfo.invite_type}
                      </p>
                      <p className="text-xs text-purple-700">
                        • Expires: {new Date(generatedCodeInfo.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      📋 Share URL:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-white p-2 rounded flex-1 overflow-x-auto">
                        {generatedCodeInfo.share_url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedCodeInfo.share_url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* E2E Tests Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                End-to-End Tests
              </CardTitle>
              <CardDescription>
                Run automated tests for critical user flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runE2ETests}
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run E2E Tests
                  </>
                )}
              </Button>

              {testResults && (
                <div className="mt-4 space-y-2">
                  {Object.entries(testResults.tests || {}).map(([testName, result]) => (
                    <div
                      key={testName}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{testName}</span>
                        {result.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {result.error && (
                        <p className="text-xs text-red-600 mt-1">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Invite Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Community Invite System
              </CardTitle>
              <CardDescription>
                Test the new community invite code functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={runCommunityInviteTests}
                disabled={isRunningInviteTest}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isRunningInviteTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Community Invite Tests
                  </>
                )}
              </Button>

              {inviteTestResults && (
                <div className="space-y-3 mt-4">
                  <div className={`p-4 rounded-lg ${
                    inviteTestResults.summary.failed === 0
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">
                        Test Summary
                      </span>
                      <span className={`text-lg font-bold ${
                        inviteTestResults.summary.failed === 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {inviteTestResults.summary.success_rate}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-slate-600">Total:</span>
                        <span className="ml-2 font-bold">{inviteTestResults.summary.total}</span>
                      </div>
                      <div>
                        <span className="text-green-600">Passed:</span>
                        <span className="ml-2 font-bold">{inviteTestResults.summary.passed}</span>
                      </div>
                      <div>
                        <span className="text-red-600">Failed:</span>
                        <span className="ml-2 font-bold">{inviteTestResults.summary.failed}</span>
                      </div>
                    </div>
                  </div>

                  {inviteTestResults.test_code && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Test Code Generated:</p>
                      <p className="font-mono text-lg font-bold text-blue-900">
                        {inviteTestResults.test_code}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        You can test this code on the InviteRequired page
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Test Results:</p>
                    {inviteTestResults.tests.map((test, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          test.status === 'PASS'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {test.status === 'PASS' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium text-sm">
                                {test.name}
                              </span>
                            </div>
                            {test.error && (
                              <p className="text-xs text-red-600 ml-6">
                                Error: {test.error}
                              </p>
                            )}
                            {test.data && (
                              <details className="ml-6 mt-2">
                                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                                  View Details
                                </summary>
                                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
                                  {JSON.stringify(test.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            test.status === 'PASS'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {test.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Sample Parents Card */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Create Sample Parents
              </CardTitle>
              <CardDescription>
                Generate 5 parent profiles with diverse expertise for testing Directory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={createSampleParents}
                disabled={creatingSampleParents}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {creatingSampleParents ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Create Sample Parents
                  </>
                )}
              </Button>

              {sampleParentsResult && (
                <div className="space-y-3 mt-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Success!
                    </p>
                    <p className="text-sm text-green-800">
                      Created {sampleParentsResult.created} parent profile(s)
                    </p>
                    {sampleParentsResult.errors && sampleParentsResult.errors.length > 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        Errors: {sampleParentsResult.errors.length}
                      </p>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      👥 Sample Parents Created:
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Sarah Chen - Product Manager @ Google</li>
                      <li>• Michael Rodriguez - MD @ Goldman Sachs</li>
                      <li>• Jennifer Williams - CMO @ Nike</li>
                      <li>• David Patel - Principal Engineer @ AWS</li>
                      <li>• Lisa Martinez - Healthcare Admin @ Mayo Clinic</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      🧪 Next Steps:
                    </p>
                    <p className="text-xs text-purple-800">
                      Go to <strong>Gator Directory</strong> → Use filters to search by expertise, ways to help, or referral availability
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Testing Instructions Card */}
          <Card className="lg:col-span-2 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-600" />
                Manual Testing: InviteRequired Page
              </CardTitle>
              <CardDescription>
                Get step-by-step instructions for testing the invite code flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={getTestInstructions}
                disabled={creatingTestUser}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {creatingTestUser ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Testing Instructions
                  </>
                )}
              </Button>

              {testUserInfo && (
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                    <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Follow These Steps:
                    </p>
                    
                    <ol className="space-y-3 text-sm text-slate-700">
                      <li className="flex gap-3">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          1
                        </span>
                        <div className="flex-1">
                          <strong>Open Incognito Window</strong>
                          <p className="text-slate-600 mt-1">
                            Press Ctrl+Shift+N (Windows) or Cmd+Shift+N (Mac)
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          2
                        </span>
                        <div className="flex-1">
                          <strong>Sign Up with a Fresh Email</strong>
                          <p className="text-slate-600 mt-1">
                            Use any new Gmail account (e.g., testparent{Math.floor(Math.random() * 10000)}@gmail.com)
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            💡 Real Gmail accounts work best for testing OAuth flow
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          3
                        </span>
                        <div className="flex-1">
                          <strong>Complete Google Sign-In</strong>
                          <p className="text-slate-600 mt-1">
                            Click "Sign In with Google" and authenticate
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          4
                        </span>
                        <div className="flex-1">
                          <strong>You'll Land on InviteRequired Page! 🎉</strong>
                          <p className="text-slate-600 mt-1">
                            New accounts automatically have no persona/roles, triggering the invite flow
                          </p>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          5
                        </span>
                        <div className="flex-1">
                          <strong>Test Your UFPARENTS Code</strong>
                          <div className="mt-2 bg-white p-3 rounded border-2 border-purple-200">
                            <p className="text-xs text-slate-600 mb-1">Enter this code:</p>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-lg font-bold text-purple-900">
                                UFPARENTS
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard('UFPARENTS')}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          6
                        </span>
                        <div className="flex-1">
                          <strong>Check Your Email</strong>
                          <p className="text-slate-600 mt-1">
                            You should receive a notification about the new member joining via UFPARENTS! ✉️
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">
                      ⚡ Quick Tip:
                    </p>
                    <p className="text-sm text-yellow-800">
                      You can create unlimited Gmail aliases for testing: yourname+test1@gmail.com, yourname+test2@gmail.com, etc. They all deliver to your main inbox!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}