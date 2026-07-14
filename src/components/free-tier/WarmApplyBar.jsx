import { useState } from 'react';
import { Star, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';

const dm = "'DM Sans', system-ui, sans-serif";
const isUrl = (s) => /^https?:\/\//i.test((s || '').trim());

// CLIFF's Best Path: the student drops a job (link or company) and CLIFF decides
// the strongest next move inside the Job Workspace — application prep first,
// networking surfaced only when it's actually useful.
export default function WarmApplyBar() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const start = async (e) => {
    e?.preventDefault();
    const raw = input.trim();
    if (!raw || loading) return;

    if (!isUrl(raw)) {
      openCliffWorkspace({ company: raw });
      return;
    }

    // Job link: pull the company + role so the workspace opens with full context
    setLoading(true);
    let company = '';
    let role = '';
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `This is a link to a job posting: ${raw}\nLook up the posting and extract the employer company name and the job title. If you cannot determine a field, return an empty string for it.`,
        add_context_from_internet: true,
        response_json_schema: { type: 'object', properties: { company: { type: 'string' }, role: { type: 'string' } } },
      });
      company = res?.company || '';
      role = res?.role || '';
    } catch {}
    setLoading(false);
    openCliffWorkspace({ company: company || raw, role, jobUrl: raw });
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #6d28d9 100%)',
      borderRadius: 20, padding: '22px 22px 20px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(109,40,217,0.25)',
    }}>
      <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(167,139,250,0.25)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#c4b5fd', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star size={13} /> CLIFF&rsquo;s Best Path
        </p>
        <h2 style={{ fontFamily: dm, fontSize: 19, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
          Got a job in mind? Drop it here.
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', lineHeight: 1.55 }}>
          CLIFF sizes it up and picks your strongest next move — resume, application, interview prep, or a connection worth contacting.
        </p>
        <form onSubmit={start} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste a job link, or type a company (e.g. Nike)"
            disabled={loading}
            style={{
              flex: '1 1 240px', minWidth: 0, background: 'rgba(255,255,255,0.97)',
              border: 'none', borderRadius: 12, padding: '13px 16px',
              fontFamily: dm, fontSize: 14, color: '#111827', outline: 'none',
              opacity: loading ? 0.7 : 1,
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center',
              background: input.trim() && !loading ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.2)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '13px 20px',
              fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: input.trim() && !loading ? 'pointer' : 'default',
              boxShadow: input.trim() && !loading ? '0 6px 18px rgba(249,115,22,0.4)' : 'none',
              transition: 'all 0.2s', whiteSpace: 'nowrap', flex: '1 1 auto',
            }}
          >
            {loading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Reading the posting…</>
            ) : (
              <>Show me my best move <ArrowRight size={16} /></>
            )}
          </button>
        </form>
        {loading && <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>}
      </div>
    </div>
  );
}