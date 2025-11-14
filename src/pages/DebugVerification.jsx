import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerUser } from '@/functions/registerUser';
import { processVerification } from '@/functions/processVerification';
import { SendEmail } from '@/integrations/Core';
import { Bug, Send, TestTube, CheckCircle } from 'lucide-react';

export default function DebugVerification() {
  const [email, setEmail] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (step, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      step,
      status, // 'success', 'error', 'info'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testFullWorkflow = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('START', 'info', 'Starting end-to-end verification test');

      // Step 1: Register user
      addResult('REGISTER', 'info', 'Calling registerUser function...');
      const registerResponse = await registerUser({
        email: email,
        password: 'TestPassword123!',
        full_name: 'Test User'
      });

      if (registerResponse.data.success) {
        addResult('REGISTER', 'success', 'Registration successful', registerResponse.data);
        
        const verificationLink = registerResponse.data.verificationLink;
        const token = registerResponse.data.token;
        
        addResult('LINK', 'info', `Generated link: ${verificationLink}`);

        // Step 2: Send test email
        addResult('EMAIL', 'info', 'Sending verification email...');
        try {
          await SendEmail({
            to: email,
            subject: 'TEST - Verify Your Email',
            body: `
              <h2>Test Verification Email</h2>
              <p>Click this link to verify: <a href="${verificationLink}">${verificationLink}</a></p>
              <p>Token: ${token}</p>
            `
          });
          addResult('EMAIL', 'success', 'Test verification email sent');
        } catch (emailError) {
          addResult('EMAIL', 'error', `Email sending failed: ${emailError.message}`);
        }

        // Step 3: Test token verification directly
        addResult('VERIFY', 'info', 'Testing token verification...');
        try {
          const verifyResponse = await processVerification({ token });
          if (verifyResponse.data.success) {
            addResult('VERIFY', 'success', 'Token verification successful', verifyResponse.data);
          } else {
            addResult('VERIFY', 'error', `Verification failed: ${verifyResponse.data.error}`);
          }
        } catch (verifyError) {
          addResult('VERIFY', 'error', `Verification error: ${verifyError.message}`, verifyError.response?.data);
        }

      } else {
        addResult('REGISTER', 'error', `Registration failed: ${registerResponse.data.error}`);
      }

    } catch (error) {
      addResult('ERROR', 'error', `Test failed: ${error.message}`, error.response?.data);
    }

    setIsLoading(false);
  };

  const testLinkDirectly = () => {
    if (testResults.length === 0) {
      alert('Run the full test first to generate a link');
      return;
    }

    const linkResult = testResults.find(r => r.step === 'LINK');
    if (linkResult && linkResult.data?.verificationLink) {
      window.open(linkResult.data.verificationLink, '_blank');
    } else {
      alert('No verification link found in test results');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="w-6 h-6" />
            Email Verification Debug Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter email for testing"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testFullWorkflow} disabled={isLoading}>
              <TestTube className="w-4 h-4 mr-2" />
              {isLoading ? 'Testing...' : 'Run Full Test'}
            </Button>
            <Button variant="outline" onClick={testLinkDirectly}>
              <Send className="w-4 h-4 mr-2" />
              Test Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  result.status === 'success' ? 'border-green-500 bg-green-50' :
                  result.status === 'error' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {result.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {result.status === 'error' && <Bug className="w-4 h-4 text-red-600" />}
                    {result.status === 'info' && <TestTube className="w-4 h-4 text-blue-600" />}
                    <span className="font-medium">{result.step}</span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <p className="text-sm">{result.message}</p>
                  {result.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-600">View Data</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}