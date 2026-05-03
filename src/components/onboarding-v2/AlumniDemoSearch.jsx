import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { dmSans, ORANGE, BORDER, SURFACE, TEXT, MUTED, FAINT, SUCCESS } from './theme';

const buildQuery = (answers) => {
  const roles = answers.targetRoles || [];
  const companies = answers.targetCompanies || [];
  const industries = answers.targetIndustries || [];

  const role = roles[0] || industries[0] || 'professional';
  const company = companies[0];
  if (company) return `${role} at ${company}`;
  if (industries[0]) return `${role} in ${industries[0]}`;
  return role;
};

/**
 * Live alumni search powered by exaService. Auto-runs once on mount using a
 * query derived from the user's Act 1 answers — no input required from the
 * user. They tap a result to advance to the draft preview.
 */
export default function AlumniDemoSearch({ schoolName, answers, search, searching, results, error, onPick }) {
  const [phase, setPhase] = useState(searching ? 'loading' : results.length > 0 ? 'results' : 'idle');
  const triedRef = useRef(false);

  useEffect(() => {
    if (triedRef.current) return;
    if (!schoolName) return;
    triedRef.current = true;
    const q = buildQuery(answers);
    setPhase('loading');
    search(q).then((profiles) => {
      setPhase(profiles.length > 0 ? 'results' : 'empty');
    });
     
  }, [schoolName]);

  useEffect(() => {
    if (searching) setPhase('loading');
    else if (results.length > 0) setPhase('results');
    else if (triedRef.current) setPhase('empty');
  }, [searching, results.length]);

  const retry = async () => {
    triedRef.current = true;
    setPhase('loading');
    const q = buildQuery(answers);
    const profiles = await search(q);
    setPhase(profiles.length > 0 ? 'results' : 'empty');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '32px 20px 40px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.16em',
        color: ORANGE, margin: '0 0 12px',
      }}>
        Live · {schoolName || 'Your school'}
      </p>
      <h1 style={{
        fontFamily: dmSans, fontSize: 24, fontWeight: 700,
        color: TEXT, lineHeight: 1.25, margin: '0 0 8px', letterSpacing: '-0.01em',
      }}>
        {phase === 'loading' && 'Scanning your alumni network…'}
        {phase === 'results' && 'Pick the one you want to message first.'}
        {phase === 'empty' && "Couldn't find strong matches yet."}
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 13, color: MUTED, margin: '0 0 24px' }}>
        Searching: <span style={{ color: TEXT }}>{buildQuery(answers)}</span>
      </p>

      {phase === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
              style={{
                background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
                padding: 16, display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(232,93,32,0.18)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
                <div style={{ height: 10, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {phase === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map((alum, i) => {
            const initials = (alum.full_name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <motion.button
                key={alum.cff_user_id || alum.linkedin_url || `${alum.full_name}-${i}`}
                onClick={() => onPick(alum)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                style={{
                  width: '100%', textAlign: 'left',
                  background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', minHeight: 'auto', color: TEXT,
                  transition: 'border-color 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ORANGE; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: ORANGE,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: TEXT, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: TEXT, margin: '0 0 2px' }}>
                    {alum.full_name}
                  </p>
                  <p style={{
                    fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.62)',
                    margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {alum.headline?.split('·')[0]?.trim() || ''}{alum.company ? ` · ${alum.company}` : ''}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 11, color: SUCCESS, margin: '4px 0 0', fontWeight: 600 }}>
                    🎓 {schoolName} alum
                  </p>
                </div>
                <span style={{ color: ORANGE, fontFamily: dmSans, fontSize: 13, fontWeight: 600 }}>→</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {phase === 'empty' && (
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
          padding: 24, textAlign: 'center',
        }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '0 0 16px' }}>
            {error
              ? "Network hiccup. Let's try that again."
              : "We couldn't find a strong match for that exact target. Try a broader role or industry."}
          </p>
          <button
            onClick={retry}
            style={{
              background: ORANGE, border: 'none', borderRadius: 999, padding: '10px 22px',
              color: TEXT, fontFamily: dmSans, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Try again
          </button>
        </div>
      )}

      {phase === 'results' && (
        <p style={{ fontFamily: dmSans, fontSize: 12, color: FAINT, textAlign: 'center', margin: '20px 0 0' }}>
          Tap any alum to draft your first message.
        </p>
      )}
    </motion.div>
  );
}
