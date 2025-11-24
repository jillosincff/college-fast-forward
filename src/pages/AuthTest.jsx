import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Mail, Key, Chrome } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { generateInviteCode } from '@/functions/generateInviteCode';

export default function AuthTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    persona: 'gator'
  });

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testGoogleLogin = async () => {
    setLoading(true);
    setResult(null);
    setLogs([]);
    
    addLog('🚀 Testing Google OAuth login...');
    addLog('Redirecting to Google login...');

    try {
      base44.auth.redirectToLogin(window.location.origin + '/#Dashboard');
      addLog('✅ Redirect initiated', 'success');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      setResult({ type: 'error', message: error.message });
      setLoading(false);
    }
  };

  const testInviteCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLogs([]);

    addLog('🚀 Testing invite code generation...');
    addLog(`📧 Email: ${inviteForm.email}`);
    addLog(`👤 Name: ${inviteForm.fullName}`);
    addLog(`🎭 Persona: ${inviteForm.persona}`);

    try {
      addLog('📤 Calling generateInviteCode function...');
      
      const response = await generateInviteCode({
        admin_email: inviteForm.email,
        note: `Test invite for ${inviteForm.fullName}`,
        max_uses: 1
      });

      addLog('📥 Response received', 'success');
      addLog(`Data: ${JSON.stringify(response.data, null, 2)}`);

      if (response.data?.code) {
        setResult({ 
          type: 'success', 
          message: `Invite code generated: ${response.data.code}`,
          data: response.data
        });
        addLog(`✅ Invite code generated: ${response.data.code}`, 'success');
        addLog(`📧 Email sent: ${response.data.email_sent ? 'Yes' : 'No'}`, response.data.email_sent ? 'success' : 'error');
      } else {
        setResult({ type: 'error', message: response.data?.error || 'Failed to generate invite' });
        addLog(`❌ Failed: ${response.data?.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      addLog(`Stack: ${error.stack}`, 'error');
      setResult({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">🧪 Authentication Testing Dashboard</h1>
          <p className="text-slate-600 mt-2">Test registration and magic link flows with detailed logging</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Forms */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Test Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="oauth">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="oauth">OAuth Login</TabsTrigger>
                    <TabsTrigger value="invite">Invite Code</TabsTrigger>
                  </TabsList>

                  <TabsContent value="oauth">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Chrome className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">
                          Test Google OAuth login flow
                        </p>
                      </div>

                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription className="text-blue-800 text-sm">
                          <strong>Note:</strong> This will redirect you to Google login. Make sure you have Google SSO configured.
                        </AlertDescription>
                      </Alert>

                      <Button 
                        onClick={testGoogleLogin}
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            <Chrome className="w-4 h-4 mr-2" />
                            Test Google Login
                          </>
                        )}
                      </Button>

                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertDescription className="text-yellow-800 text-sm">
                          <strong>Facebook Login:</strong> Not currently configured. Only Google OAuth is set up.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  <TabsContent value="invite">
                    <form onSubmit={testInviteCode} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={inviteForm.fullName}
                          onChange={(e) => setInviteForm({...inviteForm, fullName: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="test@ufl.edu"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="persona">Persona</Label>
                        <select
                          id="persona"
                          value={inviteForm.persona}
                          onChange={(e) => setInviteForm({...inviteForm, persona: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="gator">Student</option>
                          <option value="parent">Parent</option>
                          <option value="alumni">Alumni</option>
                        </select>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Generate Test Invite
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {result && (
                  <Alert className={`mt-4 ${
                    result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    {result.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={
                      result.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }>
                      {result.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Logs Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Live Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg h-[500px] overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-slate-500">No logs yet. Run a test to see logs...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className={`mb-1 ${
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'success' ? 'text-green-400' : 
                        'text-slate-300'
                      }`}>
                        <span className="text-slate-500">[{log.timestamp}]</span> {log.message}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <p>🔐 <strong>OAuth Test:</strong> Tests Google login flow (Facebook not configured)</p>
                <p>📧 <strong>Invite Code Test:</strong> Generates invite code and attempts to send email</p>
                <p>📊 All function calls are logged in real-time</p>
                <p>🔍 Check the browser console for additional details</p>
                <p className="pt-2 border-t">
                  💡 <strong>Tip:</strong> After testing, check Code → Functions → generateInviteCode → Logs
                </p>
                <p className="pt-2 border-t text-yellow-700 bg-yellow-50 p-2 rounded">
                  ⚠️ <strong>Known Issues:</strong>
                  <br />• Facebook OAuth not configured (only Google works)
                  <br />• Some users report not receiving invite codes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

AuthTest.isPublic = true;