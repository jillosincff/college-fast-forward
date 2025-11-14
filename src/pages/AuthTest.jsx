import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/entities/User';
import { useAuth } from '@/components/auth/AuthContext';

export default function AuthTest() {
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState('');
  const { user, refreshUser } = useAuth();

  const runDiagnostics = () => {
    const info = {
      currentUrl: window.location.href,
      origin: window.location.origin,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      hash: window.location.hash,
      userAgent: navigator.userAgent.substring(0, 100),
      timestamp: new Date().toISOString()
    };
    
    setDiagnostics(JSON.stringify(info, null, 2));
  };

  const handleTestLogin = async () => {
    setLoading(true);
    
    try {
      console.log('=== AUTHENTICATION DIAGNOSTICS ===');
      console.log('Current URL:', window.location.href);
      console.log('Origin:', window.location.origin);
      console.log('Attempting User.login()...');
      
      // Try the standard login
      await User.login();
      console.log('Login call completed successfully');
      
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      // Try to extract more details from the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    setLoading(false);
  };

  const handleTestMe = async () => {
    setLoading(true);
    
    try {
      console.log('=== TESTING User.me() ===');
      const currentUser = await User.me();
      console.log('User.me() result:', currentUser);
    } catch (error) {
      console.error('=== User.me() ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
    }
    setLoading(false);
  };

  const testDirectApiCall = async () => {
    setLoading(true);
    
    try {
      console.log('=== TESTING DIRECT API ACCESS ===');
      
      // Try to access the base44 API directly
      const response = await fetch('/api/entities/User', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct API response status:', response.status);
      const data = await response.text();
      console.log('Direct API response:', data);
      
    } catch (error) {
      console.error('Direct API call failed:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Base44 Authentication Diagnostics</h1>
          
          {user && (
            <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
              <p className="text-green-800 font-medium">✅ Currently logged in as:</p>
              <p className="text-green-700">{user.email}</p>
              <p className="text-green-700 text-sm">{user.full_name}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button onClick={handleTestLogin} disabled={loading}>
              {loading ? 'Testing...' : 'Test User.login()'}
            </Button>
            
            <Button onClick={handleTestMe} variant="outline" disabled={loading}>
              {loading ? 'Testing...' : 'Test User.me()'}
            </Button>
            
            <Button onClick={testDirectApiCall} variant="outline" disabled={loading}>
              {loading ? 'Testing...' : 'Test Direct API'}
            </Button>
            
            <Button onClick={runDiagnostics} variant="ghost">
              Show Environment Info
            </Button>
          </div>

          <div className="space-y-4">
            <Button 
              variant="link" 
              onClick={() => window.location.hash = '#LandingPage'}
              className="w-full"
            >
              ← Back to Landing Page
            </Button>
          </div>
        </div>

        {diagnostics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Environment Information</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {diagnostics}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Open your browser's Developer Console (F12)</p>
            <p>2. Click each test button above</p>
            <p>3. Check the console for detailed error messages</p>
            <p>4. Share any error messages with the base44 support team</p>
          </div>
        </div>
      </div>
    </div>
  );
}