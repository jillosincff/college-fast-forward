import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_BORDER,
  GREEN_LIGHT, GREEN_BORDER, Btn,
} from './onboardingShared';

const EXAMPLES = [
  'Marketing internship in Tampa',
  'Remote software engineering internship',
  'Finance internship in NYC',
  'Sports marketing',
  'Anything involving AI',
];

/**
 * Free-text "ideal opportunity" prompt. CLIFF extracts role / industry /
 * location / remote preference itself — no separate questions. If remote
 * intent is unclear AND no location was given, ONE follow-up is asked.
 */
export default function IdealOpportunityScreen({
  goalText, setGoalText, setLocationPref, setLocationCity,
  h1style, substyle, onBack, onNext,
}) {
  const [extracting, setExtracting] = useState(false);
  const [followUp, setFollowUp] = useState(false);

  const handleContinue = async () => {
    if (!goalText.trim() || extracting) return;
    setExtracting(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A college student described their ideal job opportunity as: "${goalText}".
Extract structured job-search intent. Rules:
- location: city/state ONLY if explicitly mentioned, otherwise empty string.
- remote_preference: "remote" if they clearly want remote, "in_person" if clearly on-site, "unknown" otherwise.
- role: the role/position type they want, if identifiable.
- industry: the industry/space, if identifiable.
- keywords: up to 5 lowercase keywords capturing their interests.`,
        response_json_schema: {
          type: 'object',
          properties: {
            role: { type: 'string' },
            industry: { type: 'string' },
            location: { type: 'string' },
            remote_preference: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      try { localStorage.setItem('cff_goal_extraction', JSON.stringify(res || {})); } catch {}
      const loc = (res?.location || '').trim();
      const remote = res?.remote_preference || 'unknown';
      if (loc) {
        setLocationCity(loc);
        setLocationPref(remote === 'remote' ? 'hybrid' : 'city');
      } else if (remote === 'remote') {
        setLocationPref('remote');
      } else if (remote === 'unknown') {
        // Confidence low on one dimension → exactly one follow-up question
        setExtracting(false);
        setFollowUp(true);
        return;
      } else {
        setLocationPref('hybrid');
      }
      setExtracting(false);
      onNext();
    } catch {
      setExtracting(false);
      onNext();
    }
  };

  const answerFollowUp = (includesRemote) => {
    setLocationPref(includesRemote ? 'remote' : 'hybrid');
    onNext();
  };

  if (followUp) {
    return (
      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 20px' }}>🤖</div>
        <h1 style={h1style}>One quick question.</h1>
        <p style={{ ...substyle, marginBottom: 28 }}>Would you also consider remote roles?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
          <Btn onClick={() => answerFollowUp(true)} style={{ justifyContent: 'center', width: '100%' }}>Yes — include remote</Btn>
          <Btn primary={false} onClick={() => answerFollowUp(false)} style={{ justifyContent: 'center', width: '100%' }}>I'd rather be in person</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', maxWidth: 540, width: '100%' }}>
      <h1 style={h1style}>Describe your ideal opportunity.</h1>
      <p style={{ ...substyle, marginBottom: 20 }}>In your own words. I'll figure out the role, location, and everything else from here.</p>

      <textarea
        value={goalText}
        onChange={e => setGoalText(e.target.value)}
        placeholder={'e.g. "Marketing internship in Tampa"'}
        rows={3}
        autoFocus
        style={{
          width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 16, color: TEXT,
          background: CARD, border: `2px solid ${goalText.trim() ? INDIGO_BORDER : '#E2E8F0'}`,
          borderRadius: 14, padding: '16px 18px', outline: 'none', resize: 'none', lineHeight: 1.6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = INDIGO_BORDER}
      />

      {/* Example chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14 }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => setGoalText(ex)}
            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, background: BG, border: '1px solid #E2E8F0', borderRadius: 100, padding: '7px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.color = INDIGO; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = TEXT2; }}
          >"{ex}"</button>
        ))}
      </div>

      {extracting && (
        <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '14px 18px', marginTop: 18, display: 'flex', gap: 10, alignItems: 'center', textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
          <span style={{ width: 18, height: 18, border: '2.5px solid rgba(6,182,212,0.25)', borderTop: '2.5px solid #0891b2', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0, boxSizing: 'border-box' }} />
          <p style={{ fontFamily: FONT, fontSize: 13.5, color: '#0E7490', margin: 0, fontWeight: 600 }}>Got it — making sure I understand exactly what you want…</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
        <Btn primary={false} onClick={onBack} small>← Back</Btn>
        <Btn onClick={handleContinue} disabled={!goalText.trim()} loading={extracting}>Continue →</Btn>
      </div>
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '14px 0 0', fontStyle: 'italic' }}>You can change this anytime. I'll build around it.</p>
    </div>
  );
}