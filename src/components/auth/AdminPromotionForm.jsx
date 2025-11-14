
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminPromotionForm() {
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
      
      // Make direct HTTP request to the function
      const response = await fetch('/functions/promoteToAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          adminSetupKey: adminKey.trim()
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: data.message,
          user: data.user
        });
        setEmail('');
        setAdminKey('');
      } else {
        setResult({
          type: 'error',
          message: data.error || data.details || 'Failed to promote user'
        });
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      setResult({
        type: 'error',
        message: `Network error: ${error.message}`
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-5 h-5 text-blue-600" />
          Admin Setup Tool
        </CardTitle>
        <CardDescription>
          Promote a user to administrator status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePromoteToAdmin} className="space-y-4">
          <div>
            <Label htmlFor="promo-email">User Email</Label>
            <Input
              id="promo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="promo-adminKey">Admin Setup Key</Label>
            <Input
              id="promo-adminKey"
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

          <Button type="submit" className="w-full" disabled={isLoading}>
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
      </CardContent>
    </Card>
  );
}
