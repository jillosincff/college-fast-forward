import { useState, useEffect, useRef } from 'react';
import { Lock, Search, Sparkles, FileText, Send, CalendarClock, Check, Zap } from 'lucide-react';
import { getLandingTeaser } from '@/functions/getLandingTeaser';
import { base44 } from '@/api/base44Client';

const track = (eventName, properties = {}) => {
  try { base44.analytics.track({ eventName, properties }); } catch {}
};

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const GREEN = '#059669';

const QUICK_SCHOOLS = ['UF', 'USC', 'UGA', 'Ohio State', 'Michigan', 'Tulane'];

const WORKING_STEPS = [
  'Scanning your school\u2019s alumni network\u2026',
  'Finding open roles that match\u2026',
  'Tailoring a resume for ATS\u2026',
  'Drafting your warm intro\u2026',
];

function WorkItem({ icon: Icon, title, detail, locked, delay, show }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 16,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 2px 12px rgba(109,40,217,0.08)',
      opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)',
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(5,150,105,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={GREEN} />
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Check size={14} color={GREEN} strokeWidth={3} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </p>
        <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: TEXT2, margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...(locked ? { filter: 'blur(4px)', userSelect: 'none' } : {}) }} aria-hidden={locked ? 'true' : undefined}>
          {detail}
        </p>
      </div>
      {locked && <Lock size={15} color={TEXT3} style={{ flexShrink: 0 }} />}
    </div>
  );
}

export default function MatchTeaser({ go }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [workingStep, setWorkingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const stepTimer = useRef(null);

  useEffect(() => () => clearInterval(stepTimer.current), []);

  const search = async (school) => {
    const q = (school || query).trim();
    if (!q || loading) return;
    setLoading(true);
    setResult(null);
    setRevealed(false);
    setWorkingStep(0);
    track('teaser_searched', { school: q });
    try { localStorage.setItem('cff_teaser_school', q); } catch {}

    // Cycle the "agent working" steps while data loads (min ~2.8s so it feels like real work)
    stepTimer.current = setInterval(() => {
      setWorkingStep((s) => Math.min(s + 1, WORKING_STEPS.length - 1));
    }, 700);

    const [res] = await Promise.all([
      getLandingTeaser({ school: q }).catch(() => ({ data: { found: false, count: 0 } })),
      new Promise((r) => setTimeout(r, 2800)),
    ]);

    clearInterval(stepTimer.current);
    const data = res.data || { found: false, count: 0 };
    setResult(data);
    setLoading(false);
    track('teaser_revealed', { school: q, school_code: data.school_code || null, found: !!data.found, network_count: data.count || 0 });
    requestAnimationFrame(() => setRevealed(true));
  };

  const hasNetwork = result?.found && result.count > 0 && result.matches?.length > 0;
  const topCompany = hasNetwork ? result.matches[0].company : null;
  const persona = hasNetwork ? result.matches[0].persona : 'Alum';
  const schoolLabel = result?.school_code || 'your school';

  return (
    <div style={{ padding: 'clamp(48px, 10vw, 80px) clamp(20px, 5vw, 40px)', background: 'linear-gradient(160deg, #f5f3ff 0%, #ffffff 60%, #f0f9ff 100%)', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Sparkles size={13} color={INDIGO} />
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Watch it work — no signup</span>
        </div>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
          Type your school.<br />
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CLIFF does the rest.</span>
        </h2>
        <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
          Resume tailored, warm intro drafted, follow-up scheduled — before you finish your coffee.
        </p>

        {/* Search input */}
        <form onSubmit={(e) => { e.preventDefault(); search(); }} style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto 12px' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. University of Florida"
            style={{ flex: 1, minWidth: 0, fontFamily: SF, fontSize: 15, padding: '14px 18px', borderRadius: 14, border: '1.5px solid #e2e8f0', outline: 'none', background: '#fff', color: TEXT, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            onFocus={(e) => { e.target.style.borderColor = INDIGO; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
          />
          <button type="submit" disabled={loading} style={{
            fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff', background: GRAD_INDIGO,
            border: 'none', borderRadius: 14, padding: '0 22px', cursor: 'pointer', minHeight: 48,
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, opacity: loading ? 0.7 : 1,
            boxShadow: '0 6px 20px rgba(109,40,217,0.30)',
          }}>
            <Search size={16} />
            Go
          </button>
        </form>

        {/* Quick picks */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          {QUICK_SCHOOLS.map((s) => (
            <button key={s} onClick={() => { setQuery(s); search(s); }} style={{
              fontFamily: SF, fontSize: 12, fontWeight: 600, color: TEXT2, background: '#fff',
              border: '1px solid #e2e8f0', borderRadius: 100, padding: '8px 14px', cursor: 'pointer',
              minHeight: 36, transition: 'all 0.15s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = INDIGO; e.currentTarget.style.color = INDIGO; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = TEXT2; }}
            >{s}</button>
          ))}
        </div>

        {/* Agent working */}
        {loading && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(109,40,217,0.2)', borderTopColor: INDIGO, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 600, color: INDIGO, margin: 0 }}>{WORKING_STEPS[workingStep]}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Done-for-you package reveal */}
        {!loading && result && (
          <div style={{ marginTop: 28, maxWidth: 460, margin: '28px auto 0', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>Done. Here's what CLIFF built:</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: SF, fontSize: 12, fontWeight: 700, color: GREEN, background: 'rgba(5,150,105,0.10)', borderRadius: 100, padding: '5px 12px' }}>
                <Zap size={12} /> 47 seconds
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <WorkItem
                icon={FileText}
                title="Resume tailored & ATS-scored"
                detail="Optimized for the role — scored 87/100"
                locked delay={0} show={revealed}
              />
              <WorkItem
                icon={Send}
                title={hasNetwork ? `Warm intro drafted — ${topCompany}` : 'Warm intro drafted to your alumni'}
                detail={hasNetwork ? `To a ${schoolLabel} ${persona.toLowerCase()} on the team there` : 'CLIFF finds your alumni at any company you name'}
                locked delay={150} show={revealed}
              />
              <WorkItem
                icon={CalendarClock}
                title="Follow-up scheduled"
                detail="Auto-reminder set for day 4 if no reply"
                locked delay={300} show={revealed}
              />
            </div>

            {hasNetwork && (
              <p style={{ fontFamily: SF, fontSize: 13, color: TEXT2, margin: '14px 0 0', textAlign: 'center' }}>
                Plus <span style={{ fontWeight: 800, color: INDIGO }}>{result.count} {schoolLabel} parents & alumni</span> in the network ready to open doors.
              </p>
            )}

            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button onClick={() => { track('teaser_cta_clicked', { school_code: result?.school_code || null }); go(); }} style={{
                fontFamily: SF, fontSize: 16, fontWeight: 700, color: '#fff', background: GRAD_INDIGO,
                border: 'none', borderRadius: 999, padding: '15px 36px', cursor: 'pointer', minHeight: 52,
                boxShadow: '0 12px 32px rgba(109,40,217,0.35)', transition: 'all 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >You didn't lift a finger. Claim it free →</button>
              <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '10px 0 0' }}>Free · No card required · 2 minutes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}