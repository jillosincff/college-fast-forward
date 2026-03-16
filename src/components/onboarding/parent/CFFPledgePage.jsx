import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const dmSans = "'DM Sans', sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const PLEDGES = [
  {
    title: 'Respond when a student reaches out to me',
    subtitle: 'Even a short answer can change someone\'s direction.',
  },
  {
    title: 'Share my expertise and experience',
    subtitle: 'What took me years to learn could save a student months of confusion.',
  },
  {
    title: 'Make introductions when I can',
    subtitle: 'One email from me is worth 100 cold applications from them.',
  },
  {
    title: 'Help other people\'s kids the way I\'d want someone to help mine',
    subtitle: 'Because every student in this network is someone\'s son or daughter.',
  },
];

export default function CFFPledgePage({ user, onComplete }) {
  const [checked, setChecked] = useState([false, false, false, false]);
  const [parentCount, setParentCount] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const allChecked = checked.every(Boolean);
  const userName = user?.full_name?.split(' ')[0] || 'Parent';

  useEffect(() => {
    // Get actual parent count from the platform
    const fetchCount = async () => {
      try {
        const users = await base44.entities.User.list('-created_date', 1);
        // Use GlobalCounter if available, otherwise fall back
        try {
          const counters = await base44.entities.GlobalCounter.filter({ counter_name: 'total_parents' });
          if (counters.length > 0 && counters[0].count > 0) {
            setParentCount(counters[0].count);
            return;
          }
        } catch {}
        // Fallback: count users with parent persona
        try {
          const parents = await base44.entities.User.filter({ persona: 'parent' });
          setParentCount(parents.length || 0);
        } catch {
          setParentCount(0);
        }
      } catch {
        setParentCount(0);
      }
    };
    fetchCount();
  }, []);

  const toggleCheck = (index) => {
    setChecked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    try {
      await base44.auth.updateMe({ pledge_taken: true, pledge_taken_at: new Date().toISOString() });
      base44.analytics.track({ eventName: 'pledge_completed', properties: { persona: 'parent' } });
      onComplete();
    } catch (err) {
      console.error('Pledge save failed:', err);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .pledge-check { cursor: pointer; transition: all 0.15s ease; }
        .pledge-check:hover { border-color: ${orange} !important; }
      `}</style>

      <div style={{ maxWidth: 640, width: '100%' }}>
        {/* Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 32, color: '#1a1a2e', marginBottom: 12, lineHeight: 1.3 }}>
            The College Fast Forward Pledge
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
            Before you enter the network, we ask every parent to make the same promise.
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#444', lineHeight: 1.7 }}>
            This is what makes College Fast Forward different from LinkedIn, from job boards, from everything else out there. We're not a platform. <strong>We're a community of parents who actually care about each other's kids.</strong>
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: orange, marginTop: 12 }}>
            And it only works if everyone shows up.
          </p>
        </motion.div>

        {/* Pledge card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: '#fff', borderRadius: 16, padding: '32px 28px',
            border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            marginBottom: 28,
          }}
        >
          <p style={{ fontFamily: dmSans, fontSize: 16, color: '#1a1a2e', marginBottom: 24 }}>
            I, <span style={{ color: orange, fontWeight: 600 }}>{userName}</span>, pledge to:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {PLEDGES.map((pledge, i) => (
              <div
                key={i}
                className="pledge-check"
                onClick={() => toggleCheck(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  border: checked[i] ? `2px solid ${orange}` : '2px solid #ccc',
                  background: checked[i] ? orange : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {checked[i] && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#1a1a2e', marginBottom: 2, lineHeight: 1.4 }}>
                    {pledge.title}
                  </p>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', fontStyle: 'italic', lineHeight: 1.5 }}>
                    {pledge.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Social proof */}
        {parentCount !== null && parentCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center', marginBottom: 24 }}
          >
            <p style={{ fontFamily: dmSans, fontSize: 14, color: '#555' }}>
              <span style={{ color: orange, fontWeight: 700 }}>{parentCount.toLocaleString()} parents</span> have already made this promise.
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888' }}>
              Your student is already benefiting from their generosity.
            </p>
          </motion.div>
        )}

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'rgba(232,93,32,0.04)', borderRadius: 12,
            padding: '20px 24px', marginBottom: 32,
            borderLeft: `3px solid ${orange}`,
          }}
        >
          <p style={{ fontFamily: playfair, fontSize: 15, fontStyle: 'italic', color: '#444', lineHeight: 1.7, marginBottom: 8 }}>
            "I joined College Fast Forward because someone helped my daughter land her first internship. Now I've helped 4 students I've never met. That's the deal."
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: orange }}>
            — A College Fast Forward Parent
          </p>
        </motion.div>

        {/* Instruction hint */}
        {!allChecked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 16 }}
          >
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: orange }}>
              ☝️ Check all four boxes above to continue
            </p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <button
            onClick={handleSubmit}
            disabled={!allChecked || submitting}
            style={{
              width: '100%', maxWidth: 480, padding: '16px 32px',
              borderRadius: 100, border: 'none',
              background: allChecked ? orange : '#ddd',
              color: allChecked ? '#fff' : '#999',
              fontFamily: dmSans, fontSize: 16, fontWeight: 600,
              cursor: allChecked ? 'pointer' : 'default',
              transition: 'all 0.2s', minHeight: 'auto',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Saving...' : allChecked ? 'I Care. I Pledge. Let Me In. →' : 'Check all pledges above to continue'}
          </button>

          {/* Skip option */}
          <button
            onClick={async () => {
              setSubmitting(true);
              await base44.auth.updateMe({ pledge_taken: true, pledge_skipped: true, pledge_taken_at: new Date().toISOString() });
              onComplete();
            }}
            disabled={submitting}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
              marginTop: 16, padding: '8px 16px', textDecoration: 'underline',
              minHeight: 'auto',
            }}
          >
            Skip for now →
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', marginTop: 8 }}>
            This isn't a legal contract — it's a promise to a community of parents who are counting on each other.
          </p>
        </motion.div>
      </div>
    </div>
  );
}