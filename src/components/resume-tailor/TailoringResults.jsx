import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { addPipelineEntry } from '@/functions/addPipelineEntry';
import { toast } from 'sonner';
import ApplicationReadyHero from './ApplicationReadyHero';
import MatchConfidencePanel from './MatchConfidencePanel';
import ResumeView from './ResumeView';
import ChangesPanel from './ChangesPanel';
import DownloadBar from './DownloadBar';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function TailoringResults({ result, companyName, jobTitle, originalResumeText, onStartOver, applyContext, userEmail }) {
  const tr = result.tailoredResume || {};
  // Opinionated default: CLIFF's changes are pre-accepted — students undo, not approve.
  const [changes, setChanges] = useState(() =>
    (tr.changes || []).map(c => (c.accepted === null || c.accepted === undefined) ? { ...c, accepted: true } : c)
  );
  const [activeTab, setActiveTab] = useState('tailored');
  const [submitting, setSubmitting] = useState(false);
  const reviewRef = useRef(null);

  // Persist the auto-acceptance once
  useEffect(() => {
    const hadPending = (tr.changes || []).some(c => c.accepted === null || c.accepted === undefined);
    if (tr.id && hadPending) {
      base44.entities.TailoredResume.update(tr.id, { changes }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tailoredScore = result.tailoredScore || tr.ats_score || 0;

  // When the student arrived via the job-application flow, submitting here tracks
  // the application with the tailored resume, then sends them back to the tracker.
  const handleSubmitApplication = async () => {
    setSubmitting(true);
    // Open the real job posting synchronously (before any await) so popup
    // blockers allow it — the student finishes applying on the official site.
    const jobUrl = applyContext?.jobUrl || '';
    if (jobUrl) window.open(jobUrl, '_blank', 'noopener');
    try {
      await addPipelineEntry({
        company: applyContext?.company || companyName,
        job_title: applyContext?.role || jobTitle,
        job_description: applyContext?.jd || '',
        job_url: jobUrl,
        application_path: 'cold_apply',
        status: 'applied',
        status_date: new Date().toISOString(),
        location: applyContext?.location || '',
        notes: `Resume tailored via CLiFF (ATS ${tailoredScore}%)`,
      });
      try { sessionStorage.removeItem('cff_apply_tailor_ctx'); } catch {}
      window.dispatchEvent(new CustomEvent('cff:pipeline-changed'));
      toast.success(jobUrl
        ? 'Saved to your tracker — finish applying on the company site (opened in a new tab). Download your tailored resume to attach it.'
        : 'Saved to your Application Tracker!');
      navigate('ApplicationTracker');
    } catch (e) {
      toast.error('Could not submit. Please try again.');
      setSubmitting(false);
    }
  };

  const scrollToReview = () => reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Primary apply action: submit + track when in the apply flow; otherwise take
  // the student to the download bar so they can grab the resume and apply.
  const handleApplyNow = () => {
    if (applyContext) handleSubmitApplication();
    else document.getElementById('rt-download')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAccept = (changeId) => {
    const updated = changes.map(c => c.id === changeId ? { ...c, accepted: true } : c);
    setChanges(updated);
    if (tr.id) base44.entities.TailoredResume.update(tr.id, { changes: updated }).catch(() => {});
  };

  const handleReject = (changeId) => {
    const updated = changes.map(c => c.id === changeId ? { ...c, accepted: false } : c);
    setChanges(updated);
    if (tr.id) base44.entities.TailoredResume.update(tr.id, { changes: updated }).catch(() => {});
  };

  const acceptedCount = changes.filter(c => c.accepted === true).length;

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .rt-grid { display: grid; grid-template-columns: 260px minmax(0, 1fr) 300px; gap: 20px; }
        @media (max-width: 1100px) { .rt-grid { grid-template-columns: minmax(0, 1fr) !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: applyContext ? '24px 16px 160px' : '24px 16px 100px' }}>

        {/* HERO — the application is ready; CLIFF's confidence panel; primary CTA */}
        <ApplicationReadyHero
          companyName={applyContext?.company || companyName}
          jobTitle={applyContext?.role || jobTitle}
          tailoredScore={tailoredScore}
          onReview={scrollToReview}
          onTrustApply={handleApplyNow}
          submitting={submitting}
        />

        {/* REVIEW — match confidence, before/after preview, what CLIFF improved */}
        <div ref={reviewRef} className="rt-grid" style={{ scrollMarginTop: 16 }}>
          <MatchConfidencePanel
            originalScore={result.originalScore || tr.original_score || 0}
            tailoredScore={tailoredScore}
            keywordsAdded={tr.keywords_added || []}
            keywordsMissing={tr.keywords_missing || []}
          />

          <ResumeView
            originalText={originalResumeText}
            tailoredText={tr.tailored_content || ''}
            changes={changes}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tailoredScore={tailoredScore}
          />

          <ChangesPanel
            changes={changes}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </div>

        {/* Download */}
        <div id="rt-download">
          <DownloadBar
            tailoredContent={tr.tailored_content || ''}
            acceptedCount={acceptedCount}
            totalChanges={changes.length}
            atsScore={tailoredScore}
            companyName={companyName}
            jobTitle={jobTitle}
            tailoredResumeId={tr.id}
            onStartOver={onStartOver}
          />
        </div>

        {/* FINAL CTA — the checkpoint before landing the internship */}
        <div style={{ textAlign: 'center', marginTop: 40, background: '#fff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '36px 24px' }}>
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', margin: '0 0 8px' }}>
            Everything looks good.
          </h2>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#6b7280', margin: '0 0 20px' }}>
            CLIFF is ready to help you apply.
          </p>
          <button onClick={handleApplyNow} disabled={submitting}
            style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '16px 48px', cursor: submitting ? 'default' : 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(124,58,237,0.35)', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Saving…' : 'Apply Now →'}
          </button>
        </div>
      </div>

      {/* Sticky submit bar — always visible during the apply flow so the path
          back to the job is never lost while scrolling through changes */}
      {applyContext && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150,
          background: '#fff', borderTop: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Applying to {applyContext.role || jobTitle || 'this role'} · {applyContext.company || companyName}
              </p>
              <p style={{ fontFamily: dmSans, fontSize: 11.5, color: '#888', margin: 0 }}>
                {applyContext.jobUrl
                  ? "We'll track it and open the official application — have your tailored resume downloaded."
                  : "We'll save this application to your tracker."}
              </p>
            </div>
            <button
              onClick={handleSubmitApplication}
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none',
                borderRadius: 999, padding: '13px 28px', fontFamily: dmSans, fontSize: 14, fontWeight: 700,
                color: '#fff', cursor: submitting ? 'default' : 'pointer', minHeight: 'auto',
                whiteSpace: 'nowrap', opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(124,58,237,0.35)', flexShrink: 0,
              }}
            >
              {submitting ? 'Saving…' : (applyContext.jobUrl ? '⚡ Finish Applying →' : '⚡ Add to Tracker →')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}