import React, { useMemo } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

// Extract key terms from job description
function extractKeywords(jd) {
  if (!jd || jd.length < 20) return [];
  const words = jd.toLowerCase().match(/\b[a-z][a-z+#.-]{2,}\b/g) || [];
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const STOP = new Set(['the','and','for','with','that','this','from','are','was','were','will','have','has','had','been','not','but','they','you','your','our','who','what','how','all','can','may','more','also','other','any','each','which','their','some','when','into','over','about','than','its','just','most','very','such','need','must','only','these','those','would','should','could','being','make','work','including','through','between','while','during','within','across','after','before','under','above','both','where','here','then','than','well','much','many','same','help','role','team','years','experience','looking','ability','strong','working','join','company','position','required','preferred','qualifications','responsibilities','requirements','skills','ideal','candidate','demonstrate','ensure','including','develop','manage','support','maintain','provide','create','build','drive','lead','collaborate','implement','deliver','understand','identify','define','relevant']);
  const terms = Object.entries(freq)
    .filter(([w, c]) => c >= 1 && !STOP.has(w) && w.length > 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);
  // Also grab multi-word phrases
  const phrases = jd.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)+\b/g) || [];
  const uniquePhrases = [...new Set(phrases)].slice(0, 5);
  return [...uniquePhrases, ...terms].slice(0, 12);
}

export default function JobDescriptionStep({ companyName, jobTitle, jobDescription, resumeText, onCompanyChange, onJobTitleChange, onJobDescriptionChange, onTailor }) {
  const keywords = useMemo(() => extractKeywords(jobDescription), [jobDescription]);
  const resumeLower = (resumeText || '').toLowerCase();
  const canTailor = jobDescription.trim().length > 50;

  return (
    <div>
      {/* Two-column fields */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }} className="resume-tailor-fields">
        <style>{`@media (max-width: 640px) { .resume-tailor-fields { flex-direction: column !important; } }`}</style>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Company</label>
          <input
            value={companyName}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder="e.g. Nike"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: dmSans, fontSize: 14,
              outline: 'none', background: '#fff',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Job Title</label>
          <input
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
            placeholder="e.g. Marketing Intern"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 10,
              border: '0.5px solid rgba(0,0,0,0.12)', fontFamily: dmSans, fontSize: 14,
              outline: 'none', background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Job Description Textarea */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>
          Paste the job description
        </label>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb', marginBottom: 8 }}>
          Copy the full job posting — requirements, responsibilities, everything.
        </p>
        <div style={{ position: 'relative' }}>
          <textarea
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste the full job description here..."
            style={{
              width: '100%', minHeight: 200, padding: '14px 16px',
              borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.12)',
              fontFamily: dmSans, fontSize: 14, fontWeight: 300,
              color: '#1a1a1a', lineHeight: 1.6, outline: 'none',
              background: '#fff', resize: 'vertical',
            }}
          />
          <span style={{
            position: 'absolute', bottom: 8, right: 12,
            fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb',
          }}>
            {jobDescription.length.toLocaleString()} chars
          </span>
        </div>
      </div>

      {/* Keyword Preview */}
      {keywords.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, color: '#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Key terms detected
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {keywords.map((kw, i) => {
              const found = resumeLower.includes(kw.toLowerCase());
              return (
                <span key={i} style={{
                  fontFamily: dmSans, fontSize: 11, fontWeight: 400,
                  borderRadius: 100, padding: '2px 8px',
                  background: found ? 'rgba(76,175,80,0.08)' : 'rgba(232,93,32,0.08)',
                  color: found ? '#2e7d32' : orange,
                }}>
                  {kw}
                </span>
              );
            })}
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 10, fontWeight: 300, color: '#bbb', marginTop: 6 }}>
            <span style={{ color: '#2e7d32' }}>●</span> In your resume &nbsp;
            <span style={{ color: orange }}>●</span> Missing from resume
          </p>
        </div>
      )}

      {/* Tailor Button */}
      <button
        onClick={onTailor}
        disabled={!canTailor}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 100, border: 'none',
          background: canTailor ? orange : 'rgba(0,0,0,0.06)',
          color: canTailor ? '#fff' : 'rgba(0,0,0,0.3)',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          cursor: canTailor ? 'pointer' : 'not-allowed', minHeight: 48,
          transition: 'all 0.2s',
        }}
      >
        Tailor my resume →
      </button>
    </div>
  );
}