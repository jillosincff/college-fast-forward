import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import WarmApplyFlow from './WarmApplyFlow';

const dm = "'DM Sans', system-ui, sans-serif";

// The dashboard's primary action: paste a job link or company name and CFF
// runs the full chain — warm connection → outreach draft → tracked → resume.
export default function WarmApplyBar({ user }) {
  const [input, setInput] = useState('');
  const [flowInput, setFlowInput] = useState(null);

  const start = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setFlowInput(input.trim());
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #6d28d9 100%)',
        borderRadius: 20, padding: '22px 22px 20px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(109,40,217,0.25)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(167,139,250,0.25)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={13} /> Apply the warm way
          </p>
          <h2 style={{ fontFamily: dm, fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            Got a job in mind? Drop it here.
          </h2>
          <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', lineHeight: 1.55 }}>
            CFF finds your warm connection there, writes your outreach, and tracks it — in one motion.
          </p>
          <form onSubmit={start} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste a job link, or type a company (e.g. Nike)"
              style={{
                flex: '1 1 240px', minWidth: 0, background: 'rgba(255,255,255,0.97)',
                border: 'none', borderRadius: 12, padding: '13px 16px',
                fontFamily: dm, fontSize: 14, color: '#111827', outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center',
                background: input.trim() ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.2)',
                color: '#fff', border: 'none', borderRadius: 12, padding: '13px 20px',
                fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: input.trim() ? 'pointer' : 'default',
                boxShadow: input.trim() ? '0 6px 18px rgba(249,115,22,0.4)' : 'none',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              Find my way in <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {flowInput && (
        <WarmApplyFlow
          rawInput={flowInput}
          user={user}
          onClose={() => { setFlowInput(null); setInput(''); }}
        />
      )}
    </>
  );
}