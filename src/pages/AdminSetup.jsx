import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { promoteToAdmin } from '@/functions/promoteToAdmin';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromoteToAdmin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      console.log('Calling admin promotion function...');
      
      const response = await promoteToAdmin({
        email: email.trim(),
        adminSetupKey: adminKey.trim()
      });

      console.log('Response data:', response.data);

      if (response.data.success) {
        setResult({
          type: 'success',
          message: response.data.message,
          user: response.data.user
        });
        setEmail('');
        setAdminKey('');
      } else {
        setResult({
          type: 'error',
          message: response.data.error || response.data.details || 'Failed to promote user'
        });
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      setResult({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Failed to promote user'
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Admin Setup
          </CardTitle>
          <p className="text-slate-600">
            Promote a user to administrator status
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromoteToAdmin} className="space-y-4">
            <div>
              <Label htmlFor="email">User Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="adminKey">Admin Setup Key</Label>
              <Input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin setup key"
                required
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Default key: college-fast-forward-admin-2024
              </p>
            </div>

            {result && (
              <Alert className={result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <div className="flex items-start gap-2">
                  {result.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  )}
                  <AlertDescription className={result.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                    {result.user && (
                      <div className="mt-2 text-sm">
                        <strong>User:</strong> {result.user.full_name} ({result.user.email})
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Promoting...
                </>
              ) : (
                'Promote to Admin'
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. Enter the email of your logged-in account</li>
              <li>2. Use the default admin setup key</li>
              <li>3. Click "Promote to Admin"</li>
              <li>4. Log out and log back in to see admin features</li>
            </ol>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              This page is only for initial admin setup.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

AdminSetup.isPublic = true;