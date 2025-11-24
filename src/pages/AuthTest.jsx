import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Mail, Lock, User } from 'lucide-react';
import { registerUser } from '@/functions/registerUser';
import { sendMagicLink } from '@/functions/sendMagicLink';

export default function AuthTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    fullName: '',
    persona: 'student'
  });

  const [magicLinkEmail, setMagicLinkEmail] = useState('');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLogs([]);
    
    addLog('🚀 Starting registration test...');
    addLog(`📧 Email: ${registerForm.email}`);
    addLog(`👤 Name: ${registerForm.fullName}`);

    try {
      addLog('📤 Calling registerUser function...');
      
      const response = await registerUser({
        email: registerForm.email,
        password: registerForm.password,
        full_name: registerForm.fullName,
        persona: registerForm.persona
      });

      addLog('📥 Response received', 'success');
      addLog(`Status: ${response.status}`);
      addLog(`Data: ${JSON.stringify(response.data, null, 2)}`);

      if (response.data?.success) {
        setResult({ type: 'success', message: 'Registration successful! Check your email for verification link.' });
        addLog('✅ Registration completed successfully!', 'success');
      } else {
        setResult({ type: 'error', message: response.data?.error || 'Registration failed' });
        addLog(`❌ Registration failed: ${response.data?.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      addLog(`Stack: ${error.stack}`, 'error');
      setResult({ type: 'error', message: error.message || 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const testMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setLogs([]);

    addLog('🚀 Starting magic link test...');
    addLog(`📧 Email: ${magicLinkEmail}`);

    try {
      addLog('📤 Calling sendMagicLink function...');
      
      const response = await sendMagicLink({ email: magicLinkEmail });

      addLog('📥 Response received', 'success');
      addLog(`Data: ${JSON.stringify(response.data, null, 2)}`);

      if (response.data?.success) {
        setResult({ type: 'success', message: 'Magic link sent! Check your email.' });
        addLog('✅ Magic link sent successfully!', 'success');
      } else {
        setResult({ type: 'error', message: response.data?.error || 'Failed to send magic link' });
        addLog(`❌ Failed: ${response.data?.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
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
                <Tabs defaultValue="register">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="register">Registration</TabsTrigger>
                    <TabsTrigger value="magic">Magic Link</TabsTrigger>
                  </TabsList>

                  <TabsContent value="register">
                    <form onSubmit={testRegistration} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={registerForm.fullName}
                            onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="test@ufl.edu"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Min 6 characters"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                            className="pl-10"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="persona">Persona</Label>
                        <select
                          id="persona"
                          value={registerForm.persona}
                          onChange={(e) => setRegisterForm({...registerForm, persona: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="student">Student</option>
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
                          'Test Registration'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="magic">
                    <form onSubmit={testMagicLink} className="space-y-4">
                      <div>
                        <Label htmlFor="magicEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="magicEmail"
                            type="email"
                            placeholder="test@ufl.edu"
                            value={magicLinkEmail}
                            onChange={(e) => setMagicLinkEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Magic Link'
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
                <p>📝 <strong>Registration Test:</strong> Creates a user and sends verification email</p>
                <p>🔗 <strong>Magic Link Test:</strong> Sends a passwordless login link</p>
                <p>📊 All function calls are logged in real-time</p>
                <p>🔍 Check the browser console for additional details</p>
                <p className="pt-2 border-t">
                  💡 <strong>Tip:</strong> After testing, check Code → Functions → Logs for backend logs
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