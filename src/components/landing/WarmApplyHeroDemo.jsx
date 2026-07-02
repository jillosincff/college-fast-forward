import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Sparkles, Check } from 'lucide-react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';

const JOB_URL = 'linkedin.com/jobs/nike-apm-4381';

// A different school each loop — this works for any campus
const SCENES = [
  { school: 'UF', name: 'Sarah M.', initials: 'SM', line: 'UF Alum · Product Manager at Nike', message: 'Hi Sarah — fellow Gator here! I just applied to the APM role on your team and would love 15 min to hear about your path from UF to Nike…' },
  { school: 'Penn State', name: 'David K.', initials: 'DK', line: 'Penn State Alum · Sr. Analyst at Nike', message: 'Hi David — fellow Nittany Lion here! I just applied to the APM role and would love 15 min to hear about your path from Penn State to Nike…' },
  { school: 'USC', name: 'Priya R.', initials: 'PR', line: 'USC Alum · Marketing Lead at Nike', message: 'Hi Priya — fellow Trojan here! I just applied to the APM role and would love 15 min to hear about your path from USC to Nike…' },
  { school: 'Ohio State', name: 'Marcus T.', initials: 'MT', line: 'Ohio State Alum · Program Manager at Nike', message: 'Hi Marcus — fellow Buckeye here! I just applied to the APM role and would love 15 min to hear about your path from Ohio State to Nike…' },
];

// Looping demo: paste job link → warm connection found → intro drafted → tracked
export default function WarmApplyHeroDemo() {
  const [phase, setPhase] = useState(0); // 0 typing url, 1 searching, 2 match, 3 message
  const [sceneIdx, setSceneIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [msgTyped, setMsgTyped] = useState('');
  const scene = SCENES[sceneIdx];
  const MESSAGE = scene.message;

  // Phase clock
  useEffect(() => {
    const durations = [2600, 1800, 2200, 5200];
    const t = setTimeout(() => {
      setPhase(p => (p + 1) % 4);
      if (phase === 3) {
        setTyped('');
        setMsgTyped('');
        setSceneIdx(i => (i + 1) % SCENES.length);
      }
    }, durations[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  // Type the job URL during phase 0
  useEffect(() => {
    if (phase !== 0) return;
    if (typed.length >= JOB_URL.length) return;
    const t = setTimeout(() => setTyped(JOB_URL.slice(0, typed.length + 1)), 55);
    return () => clearTimeout(t);
  }, [phase, typed]);

  // Type the outreach message during phase 3
  useEffect(() => {
    if (phase !== 3) return;
    if (msgTyped.length >= MESSAGE.length) return;
    const t = setTimeout(() => setMsgTyped(MESSAGE.slice(0, msgTyped.length + 3)), 28);
    return () => clearTimeout(t);
  }, [phase, msgTyped]);

  return (
    <div style={{
      width: '100%', maxWidth: 400, background: '#fff', borderRadius: 20,
      border: '1px solid rgba(109,40,217,0.15)',
      boxShadow: '0 24px 48px rgba(109,40,217,0.16), 0 4px 12px rgba(0,0,0,0.08)',
      padding: 20, fontFamily: SF, position: 'relative', overflow: 'hidden', minHeight: 330,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={15} color="#fff" />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0 }}>Apply with a warm intro</p>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Paste any job link</p>
        </div>
      </div>

      {/* Input with typing URL */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9ff',
        border: `1.5px solid ${phase === 0 ? INDIGO : '#e2e8f0'}`, borderRadius: 12,
        padding: '11px 14px', marginBottom: 14, transition: 'border-color 0.3s',
      }}>
        <Link2 size={14} color={phase === 0 ? INDIGO : '#94a3b8'} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: typed ? '#334155' : '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {typed || 'Paste a job link…'}
          {phase === 0 && <span style={{ borderRight: `2px solid ${INDIGO}`, marginLeft: 1, animation: 'wa-caret 0.8s step-end infinite' }} />}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* Searching */}
        {phase === 1 && (
          <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 4px' }}>
            <div style={{ width: 18, height: 18, border: '2.5px solid rgba(109,40,217,0.2)', borderTopColor: INDIGO, borderRadius: '50%', animation: 'wa-spin 0.7s linear infinite', flexShrink: 0 }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: 0 }}>Searching {scene.school} alumni &amp; parents at Nike…</p>
          </motion.div>
        )}

        {/* Match found */}
        {(phase === 2 || phase === 3) && (
          <motion.div key="match" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 100, padding: '3px 10px', marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', animation: 'wa-pulse 1.5s infinite' }} />
              <span style={{ fontSize: 10.5, fontWeight: 800, color: '#0891b2', letterSpacing: '0.04em' }}>WARM CONNECTION FOUND</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#f8f9ff', border: '1px solid rgba(109,40,217,0.15)', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{scene.initials}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{scene.name}</p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '1px 0 0' }}>{scene.line}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drafted message */}
      <AnimatePresence>
        {phase === 3 && (
          <motion.div key="msg" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 12 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.04em', margin: '0 0 6px' }}>✍️ YOUR INTRO — WRITTEN FOR YOU</p>
            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '14px 14px 14px 4px', padding: '11px 14px', minHeight: 74 }}>
              <p style={{ fontSize: 12, color: '#334155', margin: 0, lineHeight: 1.55 }}>{msgTyped}</p>
            </div>
            {msgTyped.length >= MESSAGE.length && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 100, padding: '5px 12px', marginTop: 10 }}>
                <Check size={12} color="#0891b2" strokeWidth={3} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0891b2' }}>Application tracked</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes wa-caret { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes wa-spin { to { transform: rotate(360deg); } }
        @keyframes wa-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </div>
  );
}