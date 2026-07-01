import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Search, ChevronUp, Zap } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

// Real ATS matcher — runs an actual AI scan of the student's resume against a pasted JD.
export default function AtsMatcher({ user }) {
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastScore, setLastScore] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cff_ats_last') || 'null'); } catch { return null; }
  });

  const filename = user?.resume_filename || 'My Resume';

  const handleCheck = async () => {
    if (!jd.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const resumes = await base44.entities.Resume.filter({ is_active: true }, '-updated_date', 1);
      const resumeText = resumes?.[0]?.parsed_text || '';
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a strict ATS (Applicant Tracking System) analyzer. Compare this candidate against the job description and return an honest match score.

${resumeText
  ? `CANDIDATE RESUME:\n${resumeText.slice(0, 8000)}`
  : `NO RESUME ON FILE. Score against this profile only: major/interests: ${user?.major || user?.career_goals?.target_roles?.join(', ') || 'college student'}.`}

JOB DESCRIPTION:
${jd.slice(0, 6000)}

Return: score (0-100, be honest — most first scans land 40-75), present (up to 5 important JD keywords found in the resume), missing (up to 5 important JD keywords NOT in the resume), top_fix (one specific, actionable sentence on the highest-impact fix).`,
        response_json_schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            present: { type: 'array', items: { type: 'string' } },
            missing: { type: 'array', items: { type: 'string' } },
            top_fix: { type: 'string' },
          },
        },
      });
      setResult({ ...res, no_resume: !resumeText });
      setLastScore(res.score);
      try { localStorage.setItem('cff_ats_last', JSON.stringify(res.score)); } catch {}
    } catch {
      setError("Couldn't complete the scan. Please try again in a moment.");
    }
    setLoading(false);
  };

  const scoreColor = (s) => (s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626');

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Pill row — honest status, no fake score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: open ? '12px 12px 0 0' : 12, padding: '10px 14px' }}>
        <FileText size={15} color="#6b7280" style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filename}
        </span>
        {lastScore != null ? (
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: scoreColor(lastScore), background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 100, padding: '2px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Last scan: {Math.round(lastScore)}%
          </span>
        ) : (
          <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Not scanned yet
          </span>
        )}
        <button
          onClick={() => setOpen(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {open ? <ChevronUp size={12} /> : <Search size={12} />}
          {open ? 'Close' : 'Free ATS Check'}
        </button>
      </div>

      {open && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#374151', margin: 0 }}>
            Paste a job description — CLIFF runs a real AI scan of your resume against it:
          </p>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste job description here..."
            rows={4}
            style={{ fontFamily: dm, fontSize: 12, color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px', resize: 'vertical', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          />
          <button
            onClick={handleCheck}
            disabled={loading || !jd.trim()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: loading || !jd.trim() ? '#9ca3af' : '#4f46e5', border: 'none', borderRadius: 8, padding: '10px 0', cursor: loading || !jd.trim() ? 'default' : 'pointer', minHeight: 'auto', width: '100%' }}
          >
            <Zap size={13} />
            {loading ? 'Scanning your resume...' : 'Run Real ATS Scan'}
          </button>

          {error && (
            <p style={{ fontFamily: dm, fontSize: 11, color: '#dc2626', margin: 0 }}>{error}</p>
          )}

          {result && (
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827' }}>Match Score</span>
                <span style={{ fontFamily: dm, fontSize: 16, fontWeight: 800, color: scoreColor(result.score) }}>{Math.round(result.score)}%</span>
              </div>
              {result.no_resume && (
                <p style={{ fontFamily: dm, fontSize: 10, color: '#d97706', margin: 0 }}>
                  No resume on file — this scan used your profile only. Upload a resume for a precise score.
                </p>
              )}
              {result.present?.length > 0 && (
                <p style={{ fontFamily: dm, fontSize: 11, color: '#16a34a', margin: 0 }}>
                  Found: <strong>{result.present.join(', ')}</strong>
                </p>
              )}
              {result.missing?.length > 0 && (
                <p style={{ fontFamily: dm, fontSize: 11, color: '#dc2626', margin: 0 }}>
                  Missing: <strong>{result.missing.join(', ')}</strong>
                </p>
              )}
              {result.top_fix && (
                <p style={{ fontFamily: dm, fontSize: 11, color: '#374151', margin: 0, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 6, padding: '7px 10px' }}>
                  <strong>Highest-impact fix:</strong> {result.top_fix}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}