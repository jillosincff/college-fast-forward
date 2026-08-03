import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import ResumeProcessing from './ResumeProcessing';
import ResumeQuickStart from './ResumeQuickStart';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, SHADOW,
  GREEN, BLUE, BLUE_LIGHT, BLUE_BORDER, Btn,
} from './onboardingShared';

const VALUE_LINES = [
  'Match you to more realistic opportunities',
  'Identify your strongest experience',
  'Tailor applications to specific roles',
  'Recommend stepping-stone positions',
  'Prepare your first complete application',
];

/**
 * Onboarding resume step — strongly encouraged, never required.
 * Modes: choose · quickstart (build with CLIFF) · paste · skipped · failed.
 * `uploading` renders the processing view with real progress messages.
 */
export default function ResumeStep({
  next, back, h1style, substyle,
  fileRef, handleFileUpload, uploading, setUploading,
  dataInputMode, setDataInputMode,
  college, seeking, yearLevel, selectedIndustries = [], setResumeData,
  quickMajor, setQuickMajor, quickSkills, setQuickSkills, quickRole, setQuickRole,
  onSkipConfirm, trackResume,
}) {
  const [pasteText, setPasteText] = useState('');

  const isFreshman = (yearLevel || '').toLowerCase().includes('fresh');
  const isExploring = (seeking || '').toLowerCase().includes('explor');
  const reassurance = isFreshman
    ? "Have a resume already? Add it and I'll improve it. If not, I can build one from classes, projects, campus involvement, and part-time work."
    : isExploring
      ? "A resume helps me understand what you've already tried — but you can keep exploring without one."
      : "Even if it's rough, outdated, or incomplete — I can work with it.";
  const buildLabel = (isFreshman || isExploring) ? 'Build My First Resume With CLIFF' : 'Build one with CLIFF';

  const handlePasteParse = async () => {
    if (pasteText.trim().length < 40) return;
    trackResume('onboarding_resume_upload_started', { source: 'paste' });
    setUploading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a resume parser. Analyze this resume text and return TWO versions.
CRITICAL RULES:
- Extract the REAL person's name exactly as it appears. Do NOT use placeholders. If unclear, return an empty string for name.
- All fields must be plain string values.
- Do NOT invent or change any content except for "optimized_experience" bullets.

1. "original": Extract EXACT content.
2. "optimized_experience": Same experience entries but bullets rewritten stronger, results-oriented, ATS-friendly. Keep companies, titles, dates EXACTLY the same.

RESUME TEXT:
${pasteText}`,
        response_json_schema: {
          type: 'object', properties: {
            original: { type: 'object', properties: {
              name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' },
              location: { type: 'string' }, summary: { type: 'string' },
              education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' } } } },
              experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
              skills: { type: 'array', items: { type: 'string' } },
            }},
            optimized_experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } }
          }
        }
      });
      let parsed = result.original;
      if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch {} }
      const hasContent = parsed && (parsed.experience?.length || parsed.education?.length || parsed.skills?.length);
      if (!hasContent) throw new Error('no_content');
      setResumeData({ original: parsed, optimized: { ...parsed, experience: result.optimized_experience || parsed.experience }, isPasted: true });
      trackResume('onboarding_resume_parse_succeeded', { source: 'paste' });
      setUploading(false);
      setDataInputMode('choose');
      next();
    } catch {
      trackResume('onboarding_resume_parse_failed', { source: 'paste' });
      setUploading(false);
      setDataInputMode('failed');
    }
  };

  const linkBtn = { fontFamily: FONT, fontSize: 13, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: '4px 8px', textDecoration: 'underline', textUnderlineOffset: 3 };
  const secondaryCard = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    background: BLUE_LIGHT, border: `2px solid ${BLUE_BORDER}`, borderRadius: 14,
    padding: '15px 18px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s',
    fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BLUE,
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />

      {uploading && <ResumeProcessing college={college} seeking={seeking} industries={selectedIndustries} />}

      {/* ── Choose ── */}
      {!uploading && dataInputMode === 'choose' && (
        <>
          <h1 style={h1style}>Give CLIFF something to work with.</h1>
          <p style={{ ...substyle, marginBottom: 8, fontWeight: 600, color: TEXT }}>
            Add your resume so I can personalize your opportunities, strengthen your applications, and tailor your first one for free.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#059669', margin: '0 0 22px', lineHeight: 1.6 }}>{reassurance}</p>

          {/* Value statement — why this unlocks stronger personalization */}
          <div style={{ background: CARD, border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 18px', textAlign: 'left', marginBottom: 20, boxShadow: SHADOW }}>
            <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: TEXT, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
              With your resume, CLIFF can:
            </p>
            {VALUE_LINES.map((line, i) => (
              <div key={line} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < VALUE_LINES.length - 1 ? 6 : 0 }}>
                <span style={{ color: GREEN, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
          </div>

          <Btn onClick={() => fileRef.current?.click()} style={{ display: 'block', width: '100%', marginBottom: 6 }}>Upload My Resume</Btn>
          <p style={{ fontFamily: FONT, fontSize: 11.5, color: TEXT3, margin: '0 0 14px' }}>PDF or Word (.doc / .docx) · up to 10 MB</p>

          <button
            onClick={() => { trackResume('onboarding_resume_build_with_cliff_selected'); setDataInputMode('quickstart'); }}
            style={secondaryCard}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BLUE; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BLUE_BORDER; }}
          >⚡ {buildLabel}</button>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={() => { trackResume('onboarding_resume_skip_selected'); setDataInputMode('skipped'); }} style={linkBtn}>
              Skip for now →
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button onClick={back} style={{ ...linkBtn, fontSize: 12, textDecoration: 'none' }}>← Back</button>
          </div>
        </>
      )}

      {/* ── Skipped — no guilt, plan continues ── */}
      {!uploading && dataInputMode === 'skipped' && (
        <>
          <h1 style={h1style}>No problem.</h1>
          <p style={substyle}>I already know enough to start building your career plan. You can add your resume whenever you're ready.</p>
          <Btn onClick={onSkipConfirm} style={{ display: 'block', width: '100%', marginBottom: 12 }}>Continue Building My Plan →</Btn>
          <button onClick={() => setDataInputMode('choose')} style={{ ...linkBtn, fontSize: 12, textDecoration: 'none' }}>← Back to options</button>
        </>
      )}

      {/* ── Parse failure — recover without losing anything ── */}
      {!uploading && dataInputMode === 'failed' && (
        <>
          <h1 style={h1style}>I couldn't read that file clearly.</h1>
          <p style={substyle}>Your work is safe — everything you've told me is saved. Try another file, paste the text, or continue without it.</p>
          <Btn onClick={() => fileRef.current?.click()} style={{ display: 'block', width: '100%', marginBottom: 10 }}>Try Another File</Btn>
          <button onClick={() => setDataInputMode('paste')} style={secondaryCard}>Paste Resume Text</button>
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={onSkipConfirm} style={linkBtn}>Continue without a resume →</button>
          </div>
        </>
      )}

      {/* ── Paste resume text ── */}
      {!uploading && dataInputMode === 'paste' && (
        <>
          <h1 style={h1style}>Paste your resume text.</h1>
          <p style={substyle}>Copy everything from your resume and paste it here — I'll take it from there.</p>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            rows={10}
            placeholder="Paste your resume text here…"
            style={{ width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 14, color: TEXT, background: CARD, border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px 16px', resize: 'vertical', marginBottom: 14, boxShadow: SHADOW, outline: 'none' }}
          />
          <Btn onClick={handlePasteParse} disabled={pasteText.trim().length < 40} style={{ display: 'block', width: '100%', marginBottom: 12 }}>Use This Text →</Btn>
          <button onClick={() => setDataInputMode('choose')} style={{ ...linkBtn, fontSize: 12, textDecoration: 'none' }}>← Back to options</button>
        </>
      )}

      {/* ── Build one with CLIFF ── */}
      {!uploading && dataInputMode === 'quickstart' && (
        <ResumeQuickStart
          h1style={h1style} substyle={substyle} college={college}
          setResumeData={setResumeData} setUploading={setUploading} next={next}
          onBackToOptions={() => setDataInputMode('choose')} trackResume={trackResume}
          quickMajor={quickMajor} setQuickMajor={setQuickMajor}
          quickSkills={quickSkills} setQuickSkills={setQuickSkills}
          quickRole={quickRole} setQuickRole={setQuickRole}
        />
      )}
    </div>
  );
}