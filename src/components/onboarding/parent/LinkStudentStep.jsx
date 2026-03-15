import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';
const orangeHover = '#d44e14';

function ChainLinkSVG({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M16 24l8-8M12 20L8 24a5.66 5.66 0 008 8l4-4M20 12l4-4a5.66 5.66 0 018 8l-4 4" stroke={orange} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LightningSVGSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M9 1L3 9h6l-2 6 8-9H9l2-5z" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const fieldStyle = {
  width: '100%', background: '#fff',
  border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
  padding: '12px 16px', fontFamily: dmSans, fontSize: 14, fontWeight: 300,
  color: '#1a1a1a', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function LinkStudentStep({ user, onNext, onSkip }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [linked, setLinked] = useState(false);

  const handleLink = async () => {
    if (!email.trim()) return;

    if (!isValidEmail(email.trim())) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: email.trim() });
      const data = res.data;

      if (data.success) {
        setLinked(true);
        const msg = data.linked
          ? `Connected! ${data.student_name || 'Your student'} will get boosted.`
          : `Saved! We'll auto-connect when they join.`;
        toast({ title: 'Student linked!', description: msg, duration: 3000 });
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
    <div style={{ textAlign: 'center', animation: 'parentFadeUp 0.5s ease both' }}>
      <style>{`
        @keyframes parentFadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .ls-field:focus { border-color: rgba(232,93,32,0.4) !important; }
        .ls-field::placeholder { color: rgba(0,0,0,0.25); }
      `}</style>

      {/* Chain link icon */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
        <ChainLinkSVG />
      </div>

      <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 8 }}>
        Link Your Student
      </h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#555', lineHeight: 1.65, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
        Enter your student's email so we can connect your Family Karma to their profile. Every time you help a student on <span style={{ fontWeight: 500, color: '#1a1a1a' }}>College Fast Forward, your student's questions get boosted</span> in the feed.
      </p>

      <div style={{ textAlign: 'left', marginBottom: 16 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>
          Student's Email
        </label>
        <input
          className="ls-field"
          style={fieldStyle}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your student's email address"
          onKeyDown={e => e.key === 'Enter' && handleLink()}
          disabled={linked}
        />
      </div>

      {/* Info box */}
      <div style={{
        background: 'rgba(232,93,32,0.04)', border: '0.5px solid rgba(232,93,32,0.12)',
        borderRadius: 10, padding: '12px 14px', marginBottom: 24,
        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
      }}>
        <div style={{ flexShrink: 0, marginTop: 2 }}><LightningSVGSmall /></div>
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', lineHeight: 1.6, margin: 0 }}>
          We'll match you to your student automatically. If they haven't joined yet, we'll link you the moment they do.
        </p>
      </div>

      {linked ? (
        <div style={{
          background: 'rgba(74,222,128,0.08)', border: '0.5px solid rgba(74,222,128,0.3)',
          borderRadius: 14, padding: 16, textAlign: 'center',
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#16a34a' }}>Student linked successfully!</p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', marginTop: 4 }}>Redirecting...</p>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleLink}
            disabled={loading || !email.trim()}
            style={{
              width: '100%', padding: 14, borderRadius: 100, border: 'none',
              background: email.trim() ? orange : 'rgba(0,0,0,0.06)',
              color: email.trim() ? '#fff' : '#bbb',
              fontFamily: dmSans, fontSize: 15, fontWeight: 500,
              cursor: email.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', minHeight: 'auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (email.trim()) e.currentTarget.style.background = orangeHover; }}
            onMouseLeave={e => { if (email.trim()) e.currentTarget.style.background = orange; }}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Linking...</> : 'Link My Student →'}
          </button>

          <button
            type="button"
            onClick={() => onSkip()}
            style={{
              background: 'none', border: 'none',
              fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#aaa',
              cursor: 'pointer', marginTop: 12, transition: 'color 0.2s',
              minHeight: 'auto', width: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#888'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; }}
          >
            Skip for now
          </button>
        </>
      )}
    </div>
  );
}