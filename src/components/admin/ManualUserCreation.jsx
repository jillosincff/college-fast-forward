import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function ManualUserCreation() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [persona, setPersona] = useState('gator');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    if (!email || !fullName || !persona) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const invite_type = persona === 'gator' ? 'admin_to_gator' : 'admin_to_parent';
      const response = await base44.functions.invoke('generateInviteCode', { invite_type });
      if (response.data?.code) {
        setInviteCode(response.data.code);
        toast({ title: "✅ Invite Code Generated!", description: `Send this code to ${fullName}`, duration: 10000 });
        alert(`Invite Code Generated!\n\nCode: ${response.data.code}\n\nSend this code to ${email}.`);
      } else {
        throw new Error(response.data?.error || 'Failed to generate invite');
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Generate Invite Code</CardTitle>
        <p className="text-sm text-slate-600 mt-2">Create a single-use invite code for a user who's having trouble signing up.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateInvite} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Full Name *</label>
            <input type="text" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Email Address *</label>
            <input type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">User Type *</label>
            <select value={persona} onChange={(e) => setPersona(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="gator">Student (Gator)</option>
              <option value="parent">Parent</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          {inviteCode && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 mb-2">Invite Code Generated:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-green-200 text-lg font-mono text-green-900">{inviteCode}</code>
                <Button type="button" size="sm" onClick={() => { navigator.clipboard.writeText(inviteCode); toast({ title: "Copied!" }); }}>Copy</Button>
              </div>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2"><strong>📋 Instructions for the user:</strong></p>
            <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
              <li>Go to the app's landing page</li>
              <li>Click "Request Invite" or enter the invite code</li>
              <li>Enter the code you provide them</li>
              <li>Complete registration by logging in with Google or Facebook</li>
            </ol>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Code...</> : <><UserPlus className="w-4 h-4 mr-2" />Generate Invite Code</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}