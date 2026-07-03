import React from 'react';
import JobDescriptionStep from '@/components/resume-tailor/JobDescriptionStep';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

/**
 * Focused tailoring screen shown when a student arrives from the job-application
 * "Yes, tailor it first" flow. The job is already pre-filled — the student just
 * reviews and presses "Tailor my resume" to start, then returns to submit.
 */
export default function ApplyTailorStep({
  applyContext,
  resumeName,
  companyName,
  jobTitle,
  jobDescription,
  resumeText,
  error,
  jdLoading,
  onCompanyChange,
  onJobTitleChange,
  onJobDescriptionChange,
  onTailor,
  onCancel,
}) {
  return (
    // Own fixed scroll container — guarantees scrolling on iPad regardless of
    // any body-level scroll state left behind by the apply overlay.
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', background: '#fff', zIndex: 40 }}>
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 120px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      <button
        onClick={onCancel}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, color: '#888', marginBottom: 28, padding: 0, minHeight: 'auto' }}
      >
        ← Back to application
      </button>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {['Tailor', 'Review', 'Submit'].map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: i === 0 ? '#7c3aed' : '#E5E5E5',
                color: i === 0 ? '#fff' : '#999',
                fontFamily: dmSans, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</span>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#7c3aed' : '#aaa' }}>{label}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: '#E5E5E5', maxWidth: 40 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', margin: '0 0 12px' }}>
          Tailoring for your application
        </p>
        <h1 style={{ fontFamily: playfair, fontSize: 30, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', lineHeight: 1.2 }}>
          Tailor your resume{companyName ? ` for ${companyName}` : ''}
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 15, color: '#666', margin: 0, lineHeight: 1.6 }}>
          We pre-filled this role from your application. Review the job description below, then press <strong>Tailor my resume</strong>. Once it's ready, you'll come right back to submit your application.
        </p>
      </div>

      {/* Resume being tailored */}
      <div style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>📄</span>
        <div>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#7c3aed', margin: '0 0 2px', fontWeight: 600 }}>Tailoring this resume</p>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{resumeName}</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
        </div>
      )}

      {jdLoading && !jobDescription && (
        <div style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 16, height: 16, border: '2px solid rgba(124,58,237,0.25)', borderTopColor: '#7c3aed', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#7c3aed', margin: 0 }}>
            Grabbing the job description from the posting for you…
          </p>
        </div>
      )}

      <JobDescriptionStep
        companyName={companyName}
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        resumeText={resumeText}
        onCompanyChange={onCompanyChange}
        onJobTitleChange={onJobTitleChange}
        onJobDescriptionChange={onJobDescriptionChange}
        onTailor={onTailor}
      />
    </div>
    </div>
  );
}