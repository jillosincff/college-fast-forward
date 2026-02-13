import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { testEmailSend } from '@/functions/testEmailSend';

const EMAIL_TYPES = [
  { id: 'welcome', label: '1. Welcome Email', num: 1 },
  { id: 'answer_notification', label: '2. Answer Notification', num: 2 },
  { id: 'nudge_24h', label: '3. 24h Nudge', num: 3 },
  { id: 'nudge_48h', label: '4. 48h Nudge', num: 4 },
  { id: 'thank_you', label: '5. Thank You Notification', num: 5 },
  { id: 'daily_digest', label: '6. Daily Match Digest', num: 6 },
  { id: 'parent_joined', label: '7. Parent Joined Notification', num: 7 },
  { id: 'weekly_digest', label: '8. Weekly Digest', num: 8 },
  { id: 'reengagement_7d', label: '9. Re-engagement (7d)', num: 9 },
  { id: 'reengagement_21d', label: '10. Re-engagement (21d)', num: 10 },
  { id: 'reengagement_45d', label: '11. Re-engagement (45d)', num: 11 },
];

export default function EmailTestPanel() {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('support@collegefastforward.com');
  const [testPersona, setTestPersona] = useState('parent');
  const [sendingStates, setSendingStates] = useState({});
  const [results, setResults] = useState({});
  const [lastSent, setLastSent] = useState(null);

  const handleSend = async (emailType) => {
    setSendingStates(prev => ({ ...prev, [emailType]: true }));
    setResults(prev => ({ ...prev, [emailType]: 'sending' }));

    try {
      const response = await testEmailSend({
        emailType,
        testEmail,
        testPersona,
      });

      if (response.data?.success || response.data?.emailSent) {
        setResults(prev => ({ ...prev, [emailType]: 'success' }));
        setLastSent({ type: emailType, email: testEmail, time: new Date() });
        toast({
          title: `Sent: ${EMAIL_TYPES.find(e => e.id === emailType)?.label}`,
          description: `Check ${testEmail}`,
        });
      } else if (response.data?.skipped) {
        setResults(prev => ({ ...prev, [emailType]: 'skipped' }));
        toast({
          title: 'Skipped',
          description: response.data.reason || 'Rate limited or unsubscribed',
          variant: 'destructive',
        });
      } else {
        throw new Error(response.data?.error || 'Send failed');
      }
    } catch (error) {
      console.error(`Test ${emailType} failed:`, error);
      setResults(prev => ({ ...prev, [emailType]: 'error' }));
      toast({
        title: 'Send Failed',
        description: error.message || 'Could not send test email',
        variant: 'destructive',
      });
    } finally {
      setSendingStates(prev => ({ ...prev, [emailType]: false }));
    }
  };

  const getStatusIcon = (emailType) => {
    const status = results[emailType];
    if (!status) return <Clock className="w-4 h-4 text-slate-300" />;
    if (status === 'sending') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'skipped') return <Clock className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (emailType) => {
    const status = results[emailType];
    if (!status) return 'Not sent';
    if (status === 'sending') return 'Sending...';
    if (status === 'success') return 'Sent';
    if (status === 'skipped') return 'Skipped';
    return 'Failed';
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Email Test Panel
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Send real email templates to a test address. Each button calls the actual email function with real data.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Send to:</label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="support@collegefastforward.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Test as:</label>
            <Select value={testPersona} onValueChange={setTestPersona}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="gator">Student (Gator)</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Email buttons */}
        <div className="border rounded-lg divide-y">
          {EMAIL_TYPES.map((emailDef) => (
            <div
              key={emailDef.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button
                  size="sm"
                  onClick={() => handleSend(emailDef.id)}
                  disabled={sendingStates[emailDef.id] || !testEmail}
                  className="whitespace-nowrap"
                >
                  {sendingStates[emailDef.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send
                </Button>
                <span className="text-sm font-medium text-slate-700 truncate">
                  {emailDef.label}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {getStatusIcon(emailDef.id)}
                <span className={`text-xs font-medium ${
                  results[emailDef.id] === 'success' ? 'text-green-600' :
                  results[emailDef.id] === 'error' ? 'text-red-600' :
                  results[emailDef.id] === 'skipped' ? 'text-yellow-600' :
                  'text-slate-400'
                }`}>
                  {getStatusText(emailDef.id)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Last sent info */}
        <div className="text-sm text-slate-500 text-center">
          {lastSent ? (
            <span>
              Last sent: <strong>{EMAIL_TYPES.find(e => e.id === lastSent.type)?.label}</strong> to{' '}
              <strong>{lastSent.email}</strong> at {lastSent.time.toLocaleTimeString()}
            </span>
          ) : (
            <span>— no emails sent yet —</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}