import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const HELPER_PLEDGES = [
  { key: 'respond', title: 'Respond when a student reaches out to me', sub: "Even a short answer can change someone's direction." },
  { key: 'share', title: 'Share my expertise and experience', sub: 'What took me years to learn could save a student months of confusion.' },
  { key: 'intros', title: 'Make introductions when I can', sub: 'One email from me is worth 100 cold applications from them.' },
  { key: 'help_others', title: "Help other people's kids the way I'd want someone to help mine", sub: "Because every student in this network is someone's son or daughter." },
];

const SEEKER_PLEDGES = [
  { key: 'respond', title: 'Respond when someone reaches out to me', sub: 'Even seekers can pay it forward.' },
  { key: 'genuine', title: 'Be genuine and respectful in every interaction', sub: 'Real people are taking time to help you.' },
  { key: 'grow', title: 'Use this network to grow, not just to take', sub: 'Share what you learn along the way.' },
  { key: 'forward', title: 'Pay it forward when I land on my feet', sub: "Come back and help the next student when you're ready." },
];

export default function AlumniStep6Pledge({ user, intent, onComplete, onBack }) {
  const isSeeker = intent === 'seeking_help';
  const items = isSeeker ? SEEKER_PLEDGES : HELPER_PLEDGES;

  const initChecks = {};
  items.forEach(i => { initChecks[i.key] = false; });

  const [checks, setChecks] = useState(initChecks);
  const [submitting, setSubmitting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const doneRef = useRef(false);

  const anyChecked = Object.values(checks).some(Boolean);

  const handleCheck = (key) => {
    if (submitting || celebrated) return;
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePledge = async () => {
    if (!anyChecked || submitting || doneRef.current) return;
    doneRef.current = true;
    setSubmitting(true);

    await base44.auth.updateMe({ pledge_taken: true, pledge_taken_at: new Date().toISOString() });

    try {
      base44.analytics.track({ eventName: 'alumni_pledge_completed', properties: { user_id: user?.id, intent } });
    } catch {}

    setCelebrated(true);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#E85D20', '#0821A5', '#FFD700'] });

    setTimeout(() => onComplete(), 1800);
  };

  const firstName = (() => {
    const name = user?.full_name || '';
    if (name.includes(',')) return name.split(',')[1]?.trim().split(/\s+/)[0] || 'there';
    return name.split(/\s+/)[0] || 'there';
  })();

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start', padding: '40px 20px 60px',
      background: '#ffffff', overflowY: 'auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <span style={{ fontSize: 48, marginBottom: 16 }}>🤝</span>

        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#1a1a1a',
          textAlign: 'center', marginBottom: 12, letterSpacing: '-0.01em',
        }}>
          The College Fast Forward Pledge
        </h1>

        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#666', textAlign: 'center', lineHeight: 1.6, maxWidth: 480, marginBottom: 8 }}>
          Before you enter the network, we ask every member to make the same promise.
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#666', textAlign: 'center', lineHeight: 1.6, maxWidth: 480, marginBottom: 8 }}>
          This is what makes College Fast Forward different. <strong style={{ color: '#333' }}>We're a community that actually shows up for each other.</strong>
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#666', textAlign: 'center', lineHeight: 1.6, maxWidth: 480, marginBottom: 32 }}>
          And it only works if everyone shows up.
        </p>

        {/* Pledge card */}
        <div style={{
          width: '100%', background: '#fff', borderRadius: 20,
          border: anyChecked ? '2px solid #E85D20' : '2px solid #e5e7eb',
          padding: '28px 28px 24px', marginBottom: 24,
          boxShadow: anyChecked ? '0 0 20px rgba(232,93,32,0.08)' : 'none',
          transition: 'all 0.3s',
        }}>
          <p style={{
            fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 20,
          }}>
            I, <span style={{ fontFamily: playfair, fontStyle: 'italic', color: '#E85D20' }}>{firstName}</span>, pledge to:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => handleCheck(item.key)}
                disabled={submitting || celebrated}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 12px',
                  borderRadius: 12, textAlign: 'left', border: 'none', width: '100%',
                  background: checks[item.key] ? 'rgba(232,93,32,0.04)' : 'transparent',
                  cursor: submitting || celebrated ? 'default' : 'pointer',
                  borderBottom: idx < items.length - 1 ? '1px solid #f0f0f0' : 'none',
                  minHeight: 'auto', transition: 'background 0.2s',
                }}
              >
                <motion.div
                  animate={{
                    backgroundColor: checks[item.key] ? '#E85D20' : '#fff',
                    borderColor: checks[item.key] ? '#E85D20' : '#ccc',
                  }}
                  style={{
                    width: 26, height: 26, borderRadius: 6, border: '2px solid #ccc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}
                >
                  {checks[item.key] && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}
                    >✓</motion.span>
                  )}
                </motion.div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 }}>
                    {item.title}
                  </p>
                  <p style={{
                    fontFamily: dmSans, fontSize: 13, fontWeight: 300, fontStyle: 'italic',
                    color: checks[item.key] ? '#666' : '#aaa', margin: 0, lineHeight: 1.4,
                  }}>
                    {item.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <AnimatePresence mode="wait">
          {celebrated ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: '100%', maxWidth: 400, textAlign: 'center', padding: '16px 32px',
                borderRadius: 14, background: '#E85D20', color: '#fff',
                fontFamily: dmSans, fontWeight: 700, fontSize: 17,
              }}
            >
              Welcome to the family ✨
            </motion.div>
          ) : (
            <div style={{ width: '100%', display: 'flex', gap: 12 }}>
              <button onClick={onBack} style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 600, padding: '0 24px', height: 52,
                borderRadius: 12, border: '2px solid #e5e7eb', background: '#fff', color: '#555',
                cursor: 'pointer', minHeight: 'auto',
              }}>
                ← Back
              </button>
              <motion.button
                onClick={handlePledge}
                disabled={!anyChecked || submitting}
                whileTap={anyChecked ? { scale: 0.97 } : {}}
                style={{
                  fontFamily: dmSans, fontSize: 16, fontWeight: 700, flex: 1, height: 52,
                  borderRadius: 12, border: 'none',
                  background: anyChecked ? '#E85D20' : '#e5e7eb',
                  color: anyChecked ? '#fff' : '#aaa',
                  cursor: anyChecked ? 'pointer' : 'not-allowed',
                  boxShadow: anyChecked ? '0 4px 15px rgba(232,93,32,0.3)' : 'none',
                }}
              >
                {submitting ? (
                  <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
                ) : (
                  'I Care. I Pledge. Let Me In. →'
                )}
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        <p style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa',
          textAlign: 'center', marginTop: 16, maxWidth: 400,
        }}>
          This isn't a legal contract — it's a promise to a community that's counting on each other.
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}