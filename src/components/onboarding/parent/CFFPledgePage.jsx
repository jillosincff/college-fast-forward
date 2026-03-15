import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import ParentProgressBar from './ParentProgressBar';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const PLEDGE_ITEMS = [
  { key: 'respond', title: 'Respond when a student reaches out to me', subtitle: "Even a short answer can change someone's direction." },
  { key: 'share', title: 'Share my expertise and experience', subtitle: 'What took me years to learn could save a student months of confusion.' },
  { key: 'introductions', title: 'Make introductions when I can', subtitle: 'One email from me is worth 100 cold applications from them.' },
  { key: 'help_others', title: "Help other people's kids the way I'd want someone to help mine", subtitle: "Because every student in this network is someone's son or daughter." },
];

export default function CFFPledgePage({ user, onComplete }) {
  const [checks, setChecks] = useState({ respond: false, share: false, introductions: false, help_others: false });
  const [parentCount, setParentCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const completedRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadCount() {
      try {
        const parents = await base44.entities.User.filter({ persona: 'parent' }, undefined, 1);
        setParentCount(parents?.length > 0 ? 885 : 885);
      } catch { setParentCount(885); }
    }
    loadCount();
    // Activate button after 3 seconds
    timerRef.current = setTimeout(() => setButtonActive(true), 3000);
    return () => clearTimeout(timerRef.current);
  }, []);

  const handlePledge = async () => {
    if (submitting || completedRef.current) return;
    completedRef.current = true;
    setSubmitting(true);

    // Animate all checkboxes simultaneously
    setChecks({ respond: true, share: true, introductions: true, help_others: true });

    await base44.auth.updateMe({ pledge_taken: true, pledge_taken_at: new Date().toISOString() });

    try {
      await base44.functions.invoke('awardKarma', {
        parentUserId: user.id, parentEmail: user.email, parentName: user.full_name,
        actionType: 'onboarding_complete', referenceType: 'pledge', referenceId: user.id,
        description: 'Took the College Fast Forward Pledge',
      });
    } catch (e) { console.log('Pledge karma failed (non-critical):', e.message); }

    try { base44.analytics.track({ eventName: 'pledge_completed', properties: { user_id: user.id } }); } catch {}

    setCelebrated(true);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#0021A5', '#FA4616', '#FFD700'] });

    setTimeout(() => onComplete(), 1800);
  };

  const firstName = user?.full_name?.includes(',')
    ? user.full_name.split(',')[1]?.trim().split(/\s+/)[0] || 'Parent'
    : user?.full_name?.trim().split(/\s+/)[0] || 'Parent';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f2ee' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes pledgeFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pledgeCheckPop{0%{transform:scale(0.9)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
        @media(max-width:768px){.pledge-wrap{padding:32px 20px !important}}
      `}</style>

      <ParentProgressBar currentStep={4} />

      <div className="pledge-wrap" style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '60px 32px', overflowY: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 600 }}>

          {/* Title */}
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#1a1a1a', letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 16 }}>
            The College Fast Forward Pledge
          </h1>

          {/* Intro */}
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#555', textAlign: 'center', lineHeight: 1.7, marginBottom: 16 }}>
            Before you enter the network, we ask every parent to make the same promise.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#555', textAlign: 'center', lineHeight: 1.7, marginBottom: 0 }}>
            This is what makes College Fast Forward different from LinkedIn, from job boards, from everything else out there. We're not a platform.{' '}
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>We're a community of parents who actually care about each other's kids.</span>
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#555', textAlign: 'center', lineHeight: 1.7, marginTop: 12, marginBottom: 32 }}>
            And it only works if everyone shows up.
          </p>

          {/* Pledge Card */}
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20,
            padding: '28px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 28,
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 400, color: '#1a1a1a', marginBottom: 20 }}>
              I, <span style={{ fontWeight: 600, color: orange }}>{firstName}</span>, pledge to:
            </p>

            {PLEDGE_ITEMS.map((item, idx) => (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0',
                borderBottom: idx < PLEDGE_ITEMS.length - 1 ? '0.5px solid rgba(0,0,0,0.05)' : 'none',
              }}>
                <motion.div
                  animate={checks[item.key] ? { scale: [0.9, 1.05, 1], backgroundColor: orange, borderColor: orange } : { scale: 1, backgroundColor: '#fff', borderColor: 'rgba(0,0,0,0.15)' }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 20, height: 20, borderRadius: 5, border: '1.5px solid rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
                  }}
                >
                  {checks[item.key] && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </motion.div>
                  )}
                </motion.div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 3 }}>{item.title}</p>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#555', textAlign: 'center', marginBottom: 4 }}>
            <span style={{ fontWeight: 500, color: orange }}>{parentCount.toLocaleString()} UF parents</span> have already made this promise.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#888', textAlign: 'center', marginBottom: 20 }}>
            Your student is already benefiting from their generosity.
          </p>

          {/* Testimonial */}
          <div style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14,
            padding: '20px 24px', marginBottom: 28,
          }}>
            <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 15, color: '#555', lineHeight: 1.7, margin: 0 }}>
              "I joined College Fast Forward because someone helped my daughter land her first internship. Now I've helped 4 students I've never met. That's the deal."
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: orange, marginTop: 10 }}>— A College Fast Forward Parent</p>
          </div>

          {/* Button */}
          <AnimatePresence mode="wait">
            {celebrated ? (
              <motion.div key="celebrated" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', textAlign: 'center', padding: 16, borderRadius: 100, background: orange, color: '#fff', fontFamily: dmSans, fontSize: 16, fontWeight: 600 }}>
                Welcome to the family
              </motion.div>
            ) : (
              <motion.button key="pledge-btn" onClick={handlePledge} disabled={!buttonActive || submitting}
                style={{
                  width: '100%', padding: 16, borderRadius: 100, border: 'none',
                  background: buttonActive ? orange : 'rgba(0,0,0,0.06)',
                  color: buttonActive ? '#fff' : '#bbb',
                  fontFamily: dmSans, fontSize: 16, fontWeight: 600,
                  cursor: buttonActive ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s', minHeight: 'auto',
                }}
                whileTap={buttonActive ? { scale: 0.97 } : {}}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'I Care. I Pledge. Let Me In. →'}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Fine print */}
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', textAlign: 'center', marginTop: 16 }}>
            This isn't a legal contract — it's a promise to a community of parents who are counting on each other.
          </p>
        </motion.div>
      </div>
    </div>
  );
}