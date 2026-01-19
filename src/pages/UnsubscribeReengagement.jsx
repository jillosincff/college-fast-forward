import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { unsubscribeReengagement } from '@/functions/unsubscribeReengagement';
import { navigate } from '@/components/utils/navigation';

export default function UnsubscribeReengagement() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const userId = urlParams.get('userId');

    if (!userId) {
      setStatus('error');
      setErrorMessage('Invalid unsubscribe link');
      return;
    }

    handleUnsubscribe(userId);
  }, []);

  const handleUnsubscribe = async (userId) => {
    try {
      const response = await unsubscribeReengagement({ userId });
      if (response.data?.success) {
        setStatus('success');
      } else {
        throw new Error(response.data?.error || 'Unknown error');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Failed to unsubscribe');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900">Processing...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You've been unsubscribed</h1>
            <p className="text-gray-600 mb-6">
              You won't receive any more "students need help" reminder emails.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              You'll still receive notifications when students reply to your answers.
            </p>
            <Button onClick={() => navigate('ParentDashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Button onClick={() => navigate('LandingPage')}>
              Go to Homepage
            </Button>
          </>
        )}
      </div>
    </div>
  );
}