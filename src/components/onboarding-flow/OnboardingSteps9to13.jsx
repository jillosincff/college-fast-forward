import CliffCommitmentScreen from './CliffCommitmentScreen';
import ATSScoreRing from './ATSScoreRing';
import ResumeStep from './ResumeStep';
import ParentAdvantageCard from './ParentAdvantageCard';
import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, INDIGO,
  GRAD_INDIGO, SHADOW, SHADOW_MD, R, BLUE,
  GREEN, GREEN_LIGHT, GREEN_BORDER, CLIFF_SOLVE, Nav,
} from './onboardingShared';

/**
 * Onboarding screens 8–11 of the agent-hiring flow:
 * 8 = One priority · 9 = Resume (optional) · 10 = Resume insight · 11 = Here's our plan
 * Resume comes AFTER CLIFF understands the student — it's an accelerator, not an entrance fee.
 */
export default function OnboardingSteps9to13({
  screen, next, back,
  h1style, substyle,
  // screen 9 (resume)
  fileRef, handleFileUpload, uploading, setUploading,
  dataInputMode, setDataInputMode,
  college, seeking, selectedIndustries, setResumeData,
  quickMajor, setQuickMajor, quickSkills, setQuickSkills, quickRole, setQuickRole,
  yearLevel, onSkipConfirm, trackResume,
  // screen 10 (insight)
  firstName, resumeData,
  // screen 8 (one priority)
  blockers, selectBlocker,
  // screen 11 (plan)
  targetRoles, locationCity, locationPref, saveAndAuth,
}) {
  return (
    <>
      {/* ── SCREEN 8: One Priority ── */}
      {screen === 8 && (() => {
        const selectedKey = blockers[0] || null;
        const selected = CLIFF_SOLVE.find(o => o.key === selectedKey);
        return (
          <div style={{ textAlign: 'center', maxWidth: 540, width: '100%' }}>
            <h1 style={h1style}>If I could solve ONE thing first…</h1>
            <p style={{ ...substyle, marginBottom: 20 }}>What would help most?</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }} className="blocker-card-list">
              {CLIFF_SOLVE.map(opt => {
                const active = selectedKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => selectBlocker(opt.key)}
                    className="onb-option-btn"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                      background: active ? GREEN_LIGHT : CARD,
                      border: `2px solid ${active ? GREEN : '#E2E8F0'}`,
                      borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                      textAlign: 'left', minHeight: 'auto',
                      boxShadow: active
                        ? `0 0 0 3px ${GREEN_BORDER}, 0 8px 20px rgba(6,182,212,0.12)`
                        : '0 4px 12px rgba(0,0,0,0.05)',
                      transform: active ? 'translateY(-1px)' : 'translateY(0)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(6,182,212,0.12)' : BG, borderRadius: 10, border: `1px solid ${active ? GREEN_BORDER : '#E2E8F0'}`, transition: 'all 0.18s' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: active ? '#0E7490' : TEXT, margin: '0 0 3px' }}>{opt.label}</p>
                      <p style={{ fontFamily: FONT, fontSize: 12, color: active ? '#0891b2' : TEXT3, margin: 0, fontStyle: 'italic' }}>{opt.sub}</p>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? GREEN : '#CBD5E1'}`,
                      background: active ? GREEN : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 800,
                      transition: 'all 0.18s ease',
                    }}>
                      {active && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '16px 20px', marginTop: 20, textAlign: 'left', animation: 'fadeUp 0.25s ease', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
                <p style={{ fontFamily: FONT, fontSize: 14, color: '#0E7490', margin: 0, lineHeight: 1.6 }}>
                  <strong>Perfect. That's my first priority.</strong><br />
                  {selected.sub}
                </p>
              </div>
            )}

            <Nav onBack={back} onNext={next} nextDisabled={!selectedKey} />
          </div>
        );
      })()}

      {/* ── SCREEN 9: Resume — encouraged, never required ── */}
      {screen === 9 && (
        <ResumeStep
          next={next} back={back} h1style={h1style} substyle={substyle}
          fileRef={fileRef} handleFileUpload={handleFileUpload}
          uploading={uploading} setUploading={setUploading}
          dataInputMode={dataInputMode} setDataInputMode={setDataInputMode}
          college={college} seeking={seeking} yearLevel={yearLevel}
          setResumeData={setResumeData}
          quickMajor={quickMajor} setQuickMajor={setQuickMajor}
          quickSkills={quickSkills} setQuickSkills={setQuickSkills}
          quickRole={quickRole} setQuickRole={setQuickRole}
          onSkipConfirm={onSkipConfirm} trackResume={trackResume}
        />
      )}

      {/* ── SCREEN 10: Resume Insight — "Here's what I noticed." ── */}
      {screen === 10 && (
      <div style={{ maxWidth: 900, width: '100%', paddingTop: 80, minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 800, color: TEXT, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
          {firstName
            ? <>{firstName}, here's what I <span style={{ color: '#10B981' }}>noticed.</span></>
            : <>Here's what I <span style={{ color: '#10B981' }}>noticed.</span></>}
        </h1>
        <p style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: TEXT, margin: '0 auto 8px', maxWidth: 560, lineHeight: 1.5 }}>
          Good news — you already have useful experience to build from.
        </p>
        <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: '0 auto', maxWidth: 560, lineHeight: 1.7 }}>
          {dataInputMode === 'quickstart'
            ? "I built your foundation and showed what stronger positioning looks like."
            : "I kept your authentic story — and made it read the way recruiters shortlist."}
        </p>
      </div>

          {/* Before / After */}
          {(() => {
            const toStr = (v) => (v && typeof v === 'object') ? (v.url || v.text || v.value || JSON.stringify(v)) : (v || '');
            const orig = resumeData?.original;
            const opt = resumeData?.optimized;
            const SecDiv = ({ label }) => (
              <div style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: GREEN, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: GREEN_BORDER }} />
                <span>{label}</span>
                <div style={{ flex: 1, height: 1, background: GREEN_BORDER }} />
              </div>
            );
            return (
              <div className="onb-ba-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
                {/* BEFORE */}
                <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, overflow: 'hidden' }}>
                  <div style={{ background: '#F1F5F9', padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {dataInputMode === 'quickstart' ? 'Your Foundation' : 'Your Current Resume'}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>As submitted</span>
                  </div>
                  <div style={{ padding: '20px 24px', background: CARD, minHeight: 480 }}>
                    {orig ? (
                      <div style={{ fontFamily: 'Georgia, serif', fontSize: 11.5, color: '#374151', lineHeight: 1.6 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px', fontFamily: FONT }}>{toStr(orig.name)}</p>
                        <p style={{ fontSize: 10, color: TEXT2, margin: '0 0 12px', fontFamily: FONT }}>{[toStr(orig.email), toStr(orig.phone), toStr(orig.location)].filter(Boolean).join(' · ')}</p>
                        {orig.education?.length > 0 && <><p style={{ fontSize: 11, fontWeight: 700, margin: '8px 0 4px', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEXT2 }}>Education</p>
                          {orig.education.map((e, i) => <div key={i}><p style={{ margin: '0 0 1px', fontWeight: 600, fontFamily: FONT, fontSize: 11 }}>{toStr(e.school)}</p><p style={{ margin: '0 0 6px', color: TEXT2, fontSize: 10, fontFamily: FONT }}>{toStr(e.degree)} {e.dates ? `· ${toStr(e.dates)}` : ''}</p></div>)}</>}
                        {orig.experience?.length > 0 && <><p style={{ fontSize: 11, fontWeight: 700, margin: '8px 0 4px', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEXT2 }}>Experience</p>
                          {orig.experience.map((ex, i) => <div key={i} style={{ marginBottom: 8 }}><p style={{ margin: '0 0 1px', fontWeight: 600, fontFamily: FONT, fontSize: 11 }}>{toStr(ex.title)} — {toStr(ex.company)}</p><p style={{ margin: '0 0 3px', color: TEXT2, fontSize: 10, fontFamily: FONT }}>{toStr(ex.dates)}</p>{ex.bullets?.map((b, j) => <p key={j} style={{ margin: '0 0 1px', paddingLeft: 8 }}>· {toStr(b)}</p>)}</div>)}</>}
                        {orig.skills?.length > 0 && <><p style={{ fontSize: 11, fontWeight: 700, margin: '8px 0 4px', borderBottom: '1px solid #E2E8F0', paddingBottom: 2, fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.07em', color: TEXT2 }}>Skills</p><p style={{ margin: 0, fontFamily: FONT, fontSize: 10 }}>{orig.skills.map(toStr).join(', ')}</p></>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, flexDirection: 'column', gap: 10 }}>
                        <div style={{ width: 28, height: 28, border: `3px solid #E2E8F0`, borderTop: `3px solid ${BLUE}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0 }}>Reading your resume...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AFTER */}
                <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, border: `2px solid ${GREEN_BORDER}`, overflow: 'hidden' }}>
                  <div style={{ background: GREEN_LIGHT, padding: '14px 20px', borderBottom: `1px solid ${GREEN_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CLIFF Improved</span>
                    <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#fff', background: GREEN, borderRadius: 6, padding: '2px 10px' }}>IMPROVED</span>
                  </div>
                  <div style={{ minHeight: 480 }}>
                    {!opt ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 480, flexDirection: 'column', gap: 10 }}>
                        <div style={{ width: 32, height: 32, border: `3px solid ${GREEN_BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ fontFamily: FONT, fontSize: 13, color: GREEN, margin: 0 }}>Improving your resume...</p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ background: '#0F172A', padding: '20px 24px 16px' }}>
                          <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 4 }}>{toStr(opt.name)}</div>
                          <div style={{ fontFamily: FONT, fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>{[toStr(opt.email), toStr(opt.phone), toStr(opt.location)].filter(Boolean).join(' · ')}</div>
                          {opt.skills?.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {opt.skills.slice(0, 3).map((tag, i) => (
                                <span key={i} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: GREEN, background: 'rgba(16,185,129,0.15)', border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 5, padding: '2px 7px' }}>{toStr(tag)}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                          {opt.education?.length > 0 && <div style={{ marginBottom: 16 }}><SecDiv label="Education" />{opt.education.map((e, i) => <div key={i} style={{ marginBottom: 6 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT }}>{toStr(e.school)}</span><span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>{toStr(e.dates)}</span></div><div style={{ fontFamily: FONT, fontSize: 10, color: TEXT2, marginTop: 1 }}>{toStr(e.degree)}</div></div>)}</div>}
                          {opt.experience?.length > 0 && <div style={{ marginBottom: 16 }}><SecDiv label="Experience" />{opt.experience.map((ex, i) => <div key={i} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: TEXT }}>{toStr(ex.title)}</span><span style={{ fontFamily: FONT, fontSize: 10, color: TEXT3 }}>{toStr(ex.dates)}</span></div><div style={{ fontFamily: FONT, fontSize: 10, color: GREEN, fontWeight: 600, marginBottom: 4 }}>{toStr(ex.company)}</div>{ex.bullets?.map((b, j) => <div key={j} style={{ display: 'flex', gap: 6, marginBottom: 3 }}><span style={{ color: GREEN, fontSize: 10, flexShrink: 0, marginTop: 1 }}>▸</span><p style={{ fontFamily: FONT, fontSize: 10, color: '#374151', margin: 0, lineHeight: 1.6 }}>{toStr(b)}</p></div>)}</div>)}</div>}
                          {opt.skills?.length > 0 && <div><SecDiv label="Skills" /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{opt.skills.map((s, i) => <span key={i} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: '#059669', background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 5, padding: '2px 7px' }}>{toStr(s)}</span>)}</div></div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Strengths → biggest opportunity → what CLIFF will improve */}
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW, padding: '24px 28px', marginBottom: 28, border: `1px solid ${GREEN_BORDER}` }}>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 calc(65% - 14px)', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: '💪 Your strengths', color: '#059669', lines: ['You have real experience worth showcasing', 'Your foundation is stronger than most students at this stage'] },
                  { label: '🎯 Your biggest opportunity', color: INDIGO, lines: ['Your bullets described tasks — now they show results and impact, which is what recruiters shortlist'] },
                  { label: "✨ What I'll keep improving", color: '#0891b2', lines: ['Keywords aligned to your target roles, ATS-safe structure, and stronger positioning — handled for every application'] },
                ].map((sec, i) => (
                  <div key={i}>
                    <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: sec.color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{sec.label}</p>
                    {sec.lines.map((line, j) => (
                      <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: FONT, fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: j < sec.lines.length - 1 ? 6 : 0 }}>
                        <span style={{ color: GREEN, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ flex: '0 0 35%', minWidth: 160, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ATSScoreRing />
              </div>
            </div>
          </div>

          {/* Unfair advantage — the school's parent + alumni network */}
          <ParentAdvantageCard college={college} />

          {/* CTA */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <button
              onClick={next}
              style={{ width: '100%', maxWidth: 480, display: 'block', margin: '0 auto', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: '#fff', background: GRAD_INDIGO, border: 'none', borderRadius: 10, padding: '20px 32px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 24px rgba(109,40,217,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(109,40,217,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,40,217,0.3)'; }}
            >
              Continue →
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <button onClick={back} style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0 }}>← Back</button>
          </div>
        </div>
      )}

      {/* ── SCREEN 11: Here's Our Plan → planning → dashboard ── */}
      {screen === 11 && (
        <CliffCommitmentScreen
          resumeData={resumeData}
          firstName={firstName}
          college={college}
          seeking={seeking}
          blockers={blockers}
          locationPref={locationPref}
          locationCity={locationCity}
          selectedIndustries={selectedIndustries}
          targetRoles={targetRoles}
          onBack={back}
          saveAndAuth={saveAndAuth}
        />
      )}
    </>
  );
}