import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { generateApplicationBoost } from '@/functions/generateApplicationBoost';
import { navigate } from '@/components/utils/navigation';
import { toast } from 'sonner';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const LOADER_STEPS = [
  'Reading the job description...',
  'Analyzing company culture...',
  'Evaluating role requirements...',
  'Deciding what you need...',
  'Generating your content...',
  'Done.',
];

function BoostLoader() {
  const [visibleLines, setVisibleLines] = useState(0);
  useEffect(() => {
    if (visibleLines >= LOADER_STEPS.length) return;
    const t = setTimeout(() => setVisibleLines(v => v + 1), 700);
    return () => clearTimeout(t);
  }, [visibleLines]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(13,17,23,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{`@keyframes abPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.8}}`}</style>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ margin: '0 auto 20px', animation: 'abPulse 2s ease infinite' }}>
          <path d="M24 4l4 12h12l-10 8 4 12-10-8-10 8 4-12-10-8h12z" stroke="#E85D20" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        </svg>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#f4f0e8', marginBottom: 24 }}>FASTIQ is analyzing this application...</h2>
        <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
          {LOADER_STEPS.slice(0, visibleLines).map((line, i) => (
            <p key={i} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: line === 'Done.' ? 500 : 300, color: line === 'Done.' ? '#E85D20' : 'rgba(244,240,232,0.5)', margin: '0 0 6px', lineHeight: 1.8 }}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoostResults({ result, companyName, jobTitle, onStartOver }) {
  const [copied, setCopied] = useState(false);
  const borderColor = result.output_type === 'cover_letter' ? '#4CAF50' : result.output_type === 'note_to_hiring_manager' ? '#FFA726' : '#94a3b8';
  const borderLabel = result.output_type === 'cover_letter' ? 'Cover letter recommended' : result.output_type === 'note_to_hiring_manager' ? 'Short note recommended' : 'Skip the cover letter';

  const handleCopy = () => {
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', margin: 0 }}>
              Application <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Boost</em>
            </h1>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginTop: 4 }}>{jobTitle} at {companyName}</p>
          </div>
          <button onClick={onStartOver} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#888', background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', minHeight: 'auto', width: 'auto' }}>
            ← New Application
          </button>
        </div>

        {/* FASTIQ's honest assessment */}
        <div style={{ borderLeft: `4px solid ${borderColor}`, background: '#fff', borderRadius: '0 14px 14px 0', padding: '20px 24px', marginBottom: 24, border: `0.5px solid rgba(0,0,0,0.08)`, borderLeftWidth: 4, borderLeftColor: borderColor }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, color: borderColor, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>{borderLabel}</p>
          <p style={{ fontFamily: playfair, fontSize: 15, fontWeight: 400, fontStyle: 'italic', color: '#1a1a1a', margin: 0, lineHeight: 1.6 }}>
            "{result.reasoning}"
          </p>
        </div>

        {/* Content output */}
        {result.output_type === 'cover_letter' && result.content && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '32px 36px', marginBottom: 24 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.8, color: '#1a1a1a', whiteSpace: 'pre-wrap' }}>
              {result.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#aaa' }}>{result.word_count} words</span>
              <button onClick={handleCopy} style={{
                fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
                background: '#E85D20', border: 'none', borderRadius: 100, padding: '10px 28px',
                cursor: 'pointer', minHeight: 'auto',
              }}>
                {copied ? '✓ Copied!' : 'Copy cover letter →'}
              </button>
            </div>
          </div>
        )}

        {result.output_type === 'note_to_hiring_manager' && result.content && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', marginBottom: 8 }}>
              Paste this in the message field or "additional information" section:
            </p>
            <div style={{ background: 'rgba(232,93,32,0.04)', border: '0.5px solid rgba(232,93,32,0.15)', borderRadius: 14, padding: '20px 24px', marginBottom: 12 }}>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.7, margin: 0 }}>
                {result.content}
              </p>
            </div>
            <button onClick={handleCopy} style={{
              width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff',
              background: '#E85D20', border: 'none', borderRadius: 100, padding: '14px',
              cursor: 'pointer',
            }}>
              {copied ? '✓ Copied!' : 'Copy this →'}
            </button>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginTop: 8 }}>
              Keep it exactly this length. Shorter is better. Hiring managers skim.
            </p>
          </div>
        )}

        {result.output_type === 'none_needed' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)', padding: '24px', marginBottom: 24, textAlign: 'center' }}>
            <h3 style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>Skip the cover letter for this one.</h3>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#555', marginBottom: 24, lineHeight: 1.6 }}>{result.reasoning}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate('ResumeTailoring', { company: companyName, role: jobTitle })} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#E85D20', background: 'rgba(232,93,32,0.06)', border: '1px solid rgba(232,93,32,0.15)', borderRadius: 100, padding: '12px', cursor: 'pointer' }}>
                Tailor your resume instead →
              </button>
              <button onClick={() => navigate('FastIQ')} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#0021A5', background: 'rgba(0,33,165,0.06)', border: '1px solid rgba(0,33,165,0.15)', borderRadius: 100, padding: '12px', cursor: 'pointer' }}>
                Find alumni at {companyName} →
              </button>
              <button onClick={() => navigate('LinkedInReview')} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#555', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 100, padding: '12px', cursor: 'pointer' }}>
                Optimize your LinkedIn →
              </button>
            </div>
          </div>
        )}

        {/* Application tips */}
        {result.tips?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid rgba(0,0,0,0.08)', padding: '20px 24px' }}>
            <h3 style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>3 things that will actually help your application</h3>
            <ol style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
              {result.tips.map((tip, i) => <li key={i} style={{ marginBottom: 6 }}>{tip}</li>)}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationBoost() {
  const { user } = useAuth();
  const [step, setStep] = useState('input');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companySize, setCompanySize] = useState('large');
  const [roleType, setRoleType] = useState('general');
  const [coverLetterRequired, setCoverLetterRequired] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('company')) setCompanyName(params.get('company'));
    if (params.get('role')) setJobTitle(params.get('role'));
  }, []);

  const handleGenerate = async () => {
    if (!companyName.trim() || !jobTitle.trim() || !jobDescription.trim()) return;
    setStep('loading');
    setError(null);
    try {
      const res = await generateApplicationBoost({ companyName: companyName.trim(), jobTitle: jobTitle.trim(), jobDescription: jobDescription.trim(), companySize, roleType, coverLetterRequired });
      if (res.data?.success) {
        setResult(res.data);
        setStep('results');
      } else {
        setError(res.data?.error || 'Generation failed.');
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
      <p style={{ fontFamily: dmSans, color: '#888' }}>Sign in to boost your application</p>
    </div>
  );

  if (step === 'loading') return <BoostLoader />;
  if (step === 'results' && result) return <BoostResults result={result} companyName={companyName} jobTitle={jobTitle} onStartOver={() => { setStep('input'); setResult(null); setJobDescription(''); }} />;

  const sizes = [{ key: 'startup', label: 'Startup / Small' }, { key: 'mid', label: 'Mid-size' }, { key: 'large', label: 'Large Corp' }];
  const roles = [{ key: 'general', label: 'General Business' }, { key: 'creative', label: 'Creative / Comms' }, { key: 'technical', label: 'Technical' }, { key: 'other', label: 'Other' }];
  const canSubmit = companyName.trim() && jobTitle.trim() && jobDescription.trim();

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
          Application <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Boost</em>
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginTop: 4, marginBottom: 28 }}>
          FASTIQ will tell you exactly what to write — and whether it's worth writing at all.
        </p>

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Company name</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Nike" style={{ width: '100%', padding: '12px 14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontFamily: dmSans, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Job title</label>
            <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Marketing Intern" style={{ width: '100%', padding: '12px 14px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontFamily: dmSans, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Company size */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Company size</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {sizes.map(s => (
              <button key={s.key} onClick={() => setCompanySize(s.key)} style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: companySize === s.key ? 500 : 400,
                color: companySize === s.key ? '#fff' : '#888',
                background: companySize === s.key ? '#E85D20' : '#fff',
                border: `1px solid ${companySize === s.key ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 100, padding: '8px 16px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role type */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Role type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {roles.map(r => (
              <button key={r.key} onClick={() => setRoleType(r.key)} style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: roleType === r.key ? 500 : 400,
                color: roleType === r.key ? '#fff' : '#888',
                background: roleType === r.key ? '#E85D20' : '#fff',
                border: `1px solid ${roleType === r.key ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 100, padding: '8px 16px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
              }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Job description */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Job description</label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
            style={{ width: '100%', padding: '16px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, fontFamily: dmSans, fontSize: 14, fontWeight: 300, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        {/* Cover letter required toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
          <input type="checkbox" checked={coverLetterRequired} onChange={e => setCoverLetterRequired(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#E85D20' }} />
          <span style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#555' }}>This application requires a cover letter</span>
        </label>

        <button onClick={handleGenerate} disabled={!canSubmit} style={{
          width: '100%', padding: '14px', borderRadius: 100, border: 'none',
          background: canSubmit ? '#E85D20' : 'rgba(0,0,0,0.1)',
          color: canSubmit ? '#fff' : '#aaa',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          cursor: canSubmit ? 'pointer' : 'default', transition: 'all 0.2s',
        }}>
          Analyze & Generate →
        </button>
      </div>
    </div>
  );
}