
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RegistrationAttempt } from '@/entities/RegistrationAttempt';
import { Mail, Send, CheckCircle, XCircle, Clock, RefreshCw, Undo, Clipboard, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminEmail() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState(null);
  const [manualVerificationLinks, setManualVerificationLinks] = useState([]);
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    setLoading(true);
    try {
      const data = await RegistrationAttempt.list('-created_date');
      setAttempts(data || []);
    } catch (error) {
      console.error('Error loading registration attempts:', error);
    }
    setLoading(false);
  };
  
  const handleReset = async () => {
    setLoading(true);
    const processedAttempts = attempts.filter(a => a.status === 'processed' || a.status === 'error');
    console.log(`[AdminEmail] Resetting status for ${processedAttempts.length} attempts...`);
    try {
      for (const attempt of processedAttempts) {
        await RegistrationAttempt.update(attempt.id, { status: 'pending' });
      }
      setManualVerificationLinks([]);
      await loadAttempts();
    } catch (error) {
      console.error("[AdminEmail] Failed to reset statuses", error);
    }
    setLoading(false);
  };

  const processEmails = async () => {
    setProcessing(true);
    setManualVerificationLinks([]); // Clear previous links
    const links = [];

    try {
      const pendingAttempts = attempts.filter(a => a.status === 'pending');
      
      if (pendingAttempts.length === 0) {
        setProcessing(false);
        return;
      }

      console.log(`[AdminEmail] Processing ${pendingAttempts.length} pending emails`);
      
      for (const attempt of pendingAttempts) {
        try {
          console.log(`[AdminEmail] Processing attempt:`, attempt);
          
          const response = await fetch('/api/apps/684474c5723dc90efce23588/functions/processEmails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: attempt.email,
              full_name: attempt.full_name,
              token: attempt.token
            })
          });

          const result = await response.json();
          console.log(`[pages/AdminEmail.js] Email processing result for ${attempt.email}:`, result);
          
          if (result.success) {
            // We no longer update the status here. The verification page handles it.
            console.log(`[AdminEmail] Verification link generated for ${attempt.email}. Status remains 'pending'.`);
            
            if (result.verification_link) {
              console.log(`[AdminEmail] Adding verification link for ${attempt.email}:`, result.verification_link);
              links.push({ 
                email: attempt.email, 
                full_name: attempt.full_name,
                link: result.verification_link 
              });
            } else {
              console.warn(`[AdminEmail] No verification_link in result for ${attempt.email}`);
            }
          } else {
            await RegistrationAttempt.update(attempt.id, { status: 'error' });
            console.log(`[AdminEmail] Updated ${attempt.email} to error status:`, result.error);
          }
          
        } catch (error) {
          console.error(`[AdminEmail] Error processing ${attempt.email}:`, error);
          await RegistrationAttempt.update(attempt.id, { status: 'error' });
        }
      }
      
      console.log(`[AdminEmail] Final links array:`, links);
      setManualVerificationLinks(links);
      // We don't need to call loadAttempts() here anymore, as the status doesn't change
      // await loadAttempts(); 
      
    } catch (error) {
      console.error('[AdminEmail] Error processing emails:', error);
    }
    setProcessing(false);
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000); // Clear after 2 seconds
    } catch (error) {
      console.error('Failed to copy link using Clipboard API:', error);
      // Fallback for older browsers or if Clipboard API permission is denied
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed'; // Avoid scrolling to bottom
      textArea.style.left = '-9999px'; // Move out of screen
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingCount = attempts.filter(a => a.status === 'pending').length;
  const processedCount = attempts.filter(a => a.status === 'processed').length;
  const errorCount = attempts.filter(a => a.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Email Management</h1>
          <p className="text-gray-600">Process registration verification emails and generate manual links.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed</p>
                  <p className="text-2xl font-bold text-green-600">{processedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button onClick={processEmails} disabled={processing || pendingCount === 0} className="w-full sm:w-auto">
              {processing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {processing ? 'Processing...' : `Process ${pendingCount} Pending Emails`}
            </Button>
            <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
              <Undo className="w-4 h-4 mr-2" />
              Reset Statuses
            </Button>
            <Button onClick={loadAttempts} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh List
            </Button>
          </CardContent>
        </Card>
        
        {/* Debug section - always show the links array */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manual verification links count: {manualVerificationLinks.length}</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(manualVerificationLinks, null, 2)}
            </pre>
          </CardContent>
        </Card>
        
        {manualVerificationLinks.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Manual Verification Links</CardTitle>
                <CardDescription>
                  The verification links below were generated. The user's status will remain 'pending' until they click the link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {manualVerificationLinks.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{item.full_name}</p>
                          <p className="text-sm text-gray-600">{item.email}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={copiedLink === item.link ? "secondary" : "outline"}
                          onClick={() => handleCopy(item.link)}
                          className="w-32"
                        >
                          {copiedLink === item.link ? (
                            <>
                              <ClipboardCheck className="w-4 h-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-4 h-4 mr-2" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                      <input 
                        type="text"
                        readOnly
                        value={item.link}
                        className="mt-2 w-full text-xs text-gray-500 bg-gray-100 p-2 rounded border"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Registration Attempts</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? <p>Loading...</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attempts.map(attempt => (
                      <tr key={attempt.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${getStatusColor(attempt.status)}`}>
                            {getStatusIcon(attempt.status)}
                            <span className="ml-2">{attempt.status}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{attempt.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{attempt.full_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(attempt.created_date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
