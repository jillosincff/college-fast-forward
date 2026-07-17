import { base44 } from '@/api/base44Client';
import { FONT, TEXT3, SHADOW, Btn, InputField } from './onboardingShared';

// "Build one with CLIFF" — lightweight guided resume builder from 3 questions.
export default function ResumeQuickStart({
  h1style, substyle, college, setResumeData, setUploading, next, onBackToOptions, trackResume,
  quickMajor, setQuickMajor, quickSkills, setQuickSkills, quickRole, setQuickRole,
}) {
  const buildIt = async () => {
    if (!quickMajor.trim() || !quickSkills.trim() || !quickRole.trim()) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Build a realistic starter professional profile for a college student with:
Major: ${quickMajor}, Skills: ${quickSkills}, Dream role: ${quickRole}, University: ${college || 'university'}
Create a plausible profile with 1-2 experience entries (clubs, part-time jobs, class projects), relevant skills, and education. Then write an optimized version.`,
        response_json_schema: {
          type: 'object', properties: {
            original: { type: 'object', properties: {
              name: { type: 'string' }, summary: { type: 'string' },
              education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' } } } },
              experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
              skills: { type: 'array', items: { type: 'string' } },
              activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' } } } }
            }},
            optimized_experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } }
          }
        }
      });
      const parsed = res.original;
      if (parsed.education?.length > 0 && college) parsed.education[0].school = college;
      setResumeData({ original: parsed, optimized: { ...parsed, experience: res.optimized_experience }, isQuickStart: true, targetRole: quickRole });
      trackResume('onboarding_resume_parse_succeeded', { source: 'built_with_cliff' });
    } catch { /* advance anyway */ }
    setUploading(false);
    next();
  };

  return (
    <>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 20px', boxShadow: SHADOW }}>⚡</div>
      <h1 style={h1style}>Tell me the basics.</h1>
      <p style={substyle}>Answer 3 questions and I'll build your foundation in seconds.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 20 }}>
        <InputField label="1. What's your major?" placeholder="e.g. Business Administration, Computer Science..." value={quickMajor} onChange={e => setQuickMajor(e.target.value)} />
        <InputField label="2. What are 2 things you're good at?" placeholder="e.g. Python, Writing, Organizing events, Excel..." value={quickSkills} onChange={e => setQuickSkills(e.target.value)} />
        <InputField label="3. What job/internship are you dreaming of?" placeholder="e.g. Marketing internship at a tech company..." value={quickRole} onChange={e => setQuickRole(e.target.value)} />
      </div>
      <Btn onClick={buildIt} disabled={!quickMajor.trim() || !quickSkills.trim() || !quickRole.trim()} style={{ display: 'block', width: '100%', marginBottom: 12 }}>
        Build It For Me →
      </Btn>
      <div style={{ textAlign: 'center' }}>
        <button onClick={onBackToOptions} style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>← Back to options</button>
      </div>
    </>
  );
}