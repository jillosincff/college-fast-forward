import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function LinkStudentStep({ user, onNext, onSkip }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);

  const handleLink = async () => {
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: email.trim() });
      const data = res.data;

      if (data.success) {
        setLinked(true);
        const msg = data.linked
          ? `Connected! ${data.student_name || 'Your student'} will get boosted.`
          : `Saved! We'll auto-connect when ${email.split('@')[0]} joins.`;
        toast({ title: '✅ Student linked!', description: msg, duration: 3000 });
        // Auto-advance after brief pause
        setTimeout(() => onNext({ studentEmail: email.trim(), linked: data.linked }), 1500);
      }
    } catch (error) {
      toast({ 
        title: 'Link failed', 
        description: error?.response?.data?.error || 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0021A5] to-[#003DCE] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Link2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          🐊 Link Your Student
        </h2>
        <p className="text-slate-600">
          Enter your student's UF email so we can connect your Family Karma to their profile. Every time you help a student on CFF, <strong>YOUR student's questions get boosted</strong> in the feed.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Student's Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="gator@ufl.edu"
          onKeyDown={(e) => e.key === 'Enter' && handleLink()}
          className="text-base"
          disabled={linked}
        />
        
        <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
          <p>ⓘ No confirmation needed — we'll link you automatically. If your student hasn't signed up yet, we'll connect you as soon as they join.</p>
        </div>
      </div>

      {linked ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-green-700 font-semibold">✅ Student linked successfully!</p>
          <p className="text-sm text-green-600 mt-1">Redirecting...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={handleLink}
            disabled={loading || !email.trim()}
            className="w-full py-6 text-lg font-bold"
            style={{ backgroundColor: '#0021A5' }}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Linking...</>
            ) : (
              <>Link My Student <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </Button>

          <button
            onClick={() => onSkip()}
            className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}