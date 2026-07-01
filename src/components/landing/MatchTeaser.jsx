import { useState } from 'react';
import { Lock, Users, Search, Sparkles } from 'lucide-react';
import { getLandingTeaser } from '@/functions/getLandingTeaser';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';

const QUICK_SCHOOLS = ['UF', 'USC', 'UGA', 'Ohio State', 'Michigan', 'Tulane'];

export default function MatchTeaser({ go }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState('');

  const search = async (school) => {
    const q = (school || query).trim();
    if (!q || loading) return;
    setLoading(true);
    setSearched(q);
    try {
      const res = await getLandingTeaser({ school: q });
      setResult(res.data);
    } catch {
      setResult({ found: false, count: 0 });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 'clamp(48px, 10vw, 80px) clamp(20px, 5vw, 40px)', background: 'linear-gradient(160deg, #f5f3ff 0%, #ffffff 60%, #f0f9ff 100%)', borderTop: '1px solid #f1f5f9' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.20)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
          <Sparkles size={13} color={INDIGO} />
          <span style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: INDIGO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Try it right now — no signup</span>
        </div>
        <h2 style={{ fontFamily: SF, fontSize: 'clamp(24px, 6vw, 40px)', fontWeight: 900, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
          Who's already waiting to<br />
          <span style={{ background: GRAD_INDIGO, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>help you at your school?</span>
        </h2>
        <p style={{ fontFamily: SF, fontSize: 'clamp(14px, 3.5vw, 16px)', color: TEXT2, margin: '0 0 24px', lineHeight: 1.6 }}>
          Enter your school and see real parents & alumni ready to open doors.
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
            <span className="teaser-btn-label">Check</span>
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

        {/* Loading */}
        {loading && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(109,40,217,0.2)', borderTopColor: INDIGO, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontFamily: SF, fontSize: 13, color: TEXT3, margin: 0 }}>Scanning the {searched} network…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Results */}
        {!loading && result && result.found && result.count > 0 && (
          <div style={{ marginTop: 28, textAlign: 'left' }}>
            <p style={{ fontFamily: SF, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 800, color: TEXT, margin: '0 0 14px', textAlign: 'center' }}>
              <span style={{ color: INDIGO }}>{result.count} parents & alumni</span> in the {result.school_code} network are ready to help
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 460, margin: '0 auto' }}>
              {result.matches.map((m, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 12px rgba(109,40,217,0.08)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(109,40,217,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={18} color={INDIGO} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, filter: 'blur(4px)', userSelect: 'none' }} aria-hidden="true">Sarah Mitchell</p>
                    <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 600, color: TEXT2, margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.persona} · {m.company}</p>
                  </div>
                  <Lock size={15} color={TEXT3} style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button onClick={go} style={{
                fontFamily: SF, fontSize: 16, fontWeight: 700, color: '#fff', background: GRAD_INDIGO,
                border: 'none', borderRadius: 999, padding: '15px 36px', cursor: 'pointer', minHeight: 52,
                boxShadow: '0 12px 32px rgba(109,40,217,0.35)', transition: 'all 0.2s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >Create a free account to see who →</button>
              <p style={{ fontFamily: SF, fontSize: 12, color: TEXT3, margin: '10px 0 0' }}>Free · No card required · 2 minutes</p>
            </div>
          </div>
        )}

        {/* No matches fallback */}
        {!loading && result && (!result.found || result.count === 0) && (
          <div style={{ marginTop: 28, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', maxWidth: 460, margin: '28px auto 0' }}>
            <p style={{ fontFamily: SF, fontSize: 15, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>Your school's network is just getting started</p>
            <p style={{ fontFamily: SF, fontSize: 13, color: TEXT2, margin: '0 0 14px', lineHeight: 1.6 }}>4,100+ parents are already in the CFF network — join free and we'll match you as your campus grows, plus you get the full AI toolkit today.</p>
            <button onClick={go} style={{
              fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#fff', background: GRAD_INDIGO,
              border: 'none', borderRadius: 999, padding: '13px 30px', cursor: 'pointer', minHeight: 48,
              boxShadow: '0 8px 24px rgba(109,40,217,0.30)',
            }}>Start Free →</button>
          </div>
        )}
      </div>
    </div>
  );
}