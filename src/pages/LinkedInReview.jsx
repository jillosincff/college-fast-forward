import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { analyzeLinkedIn } from '@/functions/analyzeLinkedIn';
import LinkedInLoader from '@/components/linkedin/LinkedInLoader';
import LinkedInResults from '@/components/linkedin/LinkedInResults';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function LinkedInReview() {
  const { user } = useAuth();
  const [step, setStep] = useState('mode'); // mode | input | loading | results
  const [mode, setMode] = useState(null); // review | build
  const [pastedContent, setPastedContent] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [rawMaterial, setRawMaterial] = useState({ experience: '', skills: '', looking: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [additions, setAdditions] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Resume.filter({ student_email: user.email, is_active: true }, '-created_date', 1)
      .then(r => { if (r[0]?.parsed_text) setHasResume(true); }).catch(() => {});
  }, [user?.email]);

  const handleAnalyze = async () => {
    setStep('loading');
    setError(null);
    try {
      const payload = mode === 'build'
        ? { mode: 'build', targetRole, rawMaterial: hasResume ? additions : `Experience: ${rawMaterial.experience}\nSkills: ${rawMaterial.skills}\nLooking for: ${rawMaterial.looking}` }
        : { mode: 'review', pastedContent, targetRole };
      const res = await analyzeLinkedIn(payload);
      if (res.data?.success) {
        setResult(res.data);
        setStep('results');
      } else {
        setError(res.data?.error || 'Analysis failed.');
        setStep('input');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setStep('input');
    }
  };

  if (user === undefined) return null;
  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <p style={{ fontFamily: dmSans, color: '#888' }}>Sign in to review your LinkedIn</p>
    </div>
  );

  if (step === 'loading') return <LinkedInLoader mode={mode} />;
  if (step === 'results' && result) return <LinkedInResults result={result} mode={mode} onStartOver={() => { setStep('mode'); setResult(null); setPastedContent(''); }} />;

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
          LinkedIn <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Profile</em>
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginTop: 4, marginBottom: 28 }}>
          A strong LinkedIn profile is your digital handshake. FASTIQ will tell you exactly what to fix.
        </p>

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Mode Selection */}
        {step === 'mode' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { key: 'review', icon: '🔍', title: 'Review my profile', desc: "Paste your LinkedIn profile and FASTIQ will score it and tell you exactly what to improve." },
              { key: 'build', icon: '✨', title: 'Build my profile', desc: "No LinkedIn yet? FASTIQ will build your complete profile using your resume and background." },
            ].map(m => (
              <div key={m.key} onClick={() => { setMode(m.key); setStep('input'); }} style={{
                background: '#fff', borderRadius: 14, padding: '24px 20px', cursor: 'pointer',
                border: `2px solid ${mode === m.key ? '#E85D20' : 'rgba(0,0,0,0.08)'}`,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (mode !== m.key) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                onMouseLeave={e => { if (mode !== m.key) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
                <h3 style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>{m.title}</h3>
                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0, lineHeight: 1.5 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Review Input */}
        {step === 'input' && mode === 'review' && (
          <div>
            <div style={{ background: 'rgba(232,93,32,0.04)', border: '0.5px solid rgba(232,93,32,0.12)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#1a1a1a', margin: '0 0 8px' }}>How to copy your LinkedIn profile:</p>
              <ol style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
                <li>Go to your LinkedIn profile page</li>
                <li>Click "More" → "Save to PDF" OR select all text and copy</li>
                <li>Paste everything below — headline, about, experience, skills, all of it</li>
              </ol>
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginTop: 8, marginBottom: 0 }}>The more you paste, the better FASTIQ's analysis will be.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Paste your LinkedIn profile here</label>
              <textarea
                value={pastedContent}
                onChange={e => setPastedContent(e.target.value)}
                placeholder="Paste your full LinkedIn profile here — headline, about section, experience, skills, education, everything..."
                rows={12}
                style={{ width: '100%', padding: '16px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#1a1a1a', lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
              />
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa', marginTop: 4, textAlign: 'right' }}>{pastedContent.length} characters</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>What kind of role are you targeting? (optional)</label>
              <input
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Marketing internship, UX designer, Investment banking analyst"
                style={{ width: '100%', padding: '12px 14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontFamily: dmSans, fontSize: 14, boxSizing: 'border-box' }}
              />
              <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginTop: 4 }}>FASTIQ will tailor suggestions to this specific role.</p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!pastedContent.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 100, border: 'none',
                background: pastedContent.trim() ? '#E85D20' : 'rgba(0,0,0,0.1)',
                color: pastedContent.trim() ? '#fff' : '#aaa',
                fontFamily: dmSans, fontSize: 15, fontWeight: 500, cursor: pastedContent.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              Analyze my LinkedIn →
            </button>

            <button onClick={() => { setStep('mode'); setMode(null); }} style={{
              display: 'block', margin: '16px auto 0', fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              color: '#888', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto',
            }}>
              ← Back
            </button>
          </div>
        )}

        {/* Build Input */}
        {step === 'input' && mode === 'build' && (
          <div>
            {hasResume ? (
              <div>
                <div style={{ background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.15)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                  <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#2e7d32', margin: 0 }}>
                    ✓ I'll use your resume on file as the starting point.
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Want to add anything I might have missed?</label>
                  <textarea
                    value={additions}
                    onChange={e => setAdditions(e.target.value)}
                    placeholder="Any clubs, volunteer work, side projects, or skills not on your resume..."
                    rows={4}
                    style={{ width: '100%', padding: '14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontFamily: dmSans, fontSize: 14, fontWeight: 300, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#555', marginBottom: 20, lineHeight: 1.6 }}>
                  No LinkedIn yet — no problem. FASTIQ will build your complete profile. First, tell me a bit about yourself.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>What have you done?</label>
                  <textarea
                    value={rawMaterial.experience}
                    onChange={e => setRawMaterial(p => ({ ...p, experience: e.target.value }))}
                    placeholder="Any jobs, internships, volunteer work, clubs, class projects, research — anything that involved doing something real. Even babysitting or retail counts."
                    rows={4}
                    style={{ width: '100%', padding: '14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontFamily: dmSans, fontSize: 14, fontWeight: 300, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>What are you good at?</label>
                  <textarea
                    value={rawMaterial.skills}
                    onChange={e => setRawMaterial(p => ({ ...p, skills: e.target.value }))}
                    placeholder="Skills, tools, software, languages, anything you've learned how to do — in class or on your own."
                    rows={3}
                    style={{ width: '100%', padding: '14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontFamily: dmSans, fontSize: 14, fontWeight: 300, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>What are you looking for?</label>
              <input
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Marketing internship, UX design role, finance analyst position"
                style={{ width: '100%', padding: '12px 14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontFamily: dmSans, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!hasResume && !rawMaterial.experience.trim()}
              style={{
                width: '100%', padding: '14px', borderRadius: 100, border: 'none',
                background: (hasResume || rawMaterial.experience.trim()) ? '#E85D20' : 'rgba(0,0,0,0.1)',
                color: (hasResume || rawMaterial.experience.trim()) ? '#fff' : '#aaa',
                fontFamily: dmSans, fontSize: 15, fontWeight: 500,
                cursor: (hasResume || rawMaterial.experience.trim()) ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              Build my LinkedIn →
            </button>

            <button onClick={() => { setStep('mode'); setMode(null); }} style={{
              display: 'block', margin: '16px auto 0', fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              color: '#888', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto',
            }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}