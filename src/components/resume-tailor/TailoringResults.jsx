import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { addPipelineEntry } from '@/functions/addPipelineEntry';
import { toast } from 'sonner';
import ScorePanel from './ScorePanel';
import ResumeView from './ResumeView';
import ChangesPanel from './ChangesPanel';
import DownloadBar from './DownloadBar';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function TailoringResults({ result, companyName, jobTitle, originalResumeText, onStartOver, applyContext, userEmail }) {
  const tr = result.tailoredResume || {};
  const [changes, setChanges] = useState(tr.changes || []);
  const [activeTab, setActiveTab] = useState('tailored');
  const [submitting, setSubmitting] = useState(false);

  // When the student arrived via the job-application "tailor it first" flow,
  // submitting here tracks the application in their pipeline with the tailored
  // resume, then sends them back to the job listing.
  const handleSubmitApplication = async () => {
    setSubmitting(true);
    try {
      await addPipelineEntry({
        company: applyContext.company || companyName,
        job_title: applyContext.role || jobTitle,
        job_description: applyContext.jd || '',
        job_url: applyContext.jobUrl || '',
        application_path: 'cold_apply',
        status: 'applied',
        status_date: new Date().toISOString(),
        location: applyContext.location || '',
        notes: `Resume tailored via CLiFF (ATS ${result.tailoredScore || tr.ats_score || 0}%)`,
      });
      // Clear the handoff context so revisiting this page doesn't re-enter the apply flow
      try { sessionStorage.removeItem('cff_apply_tailor_ctx'); } catch {}
      window.dispatchEvent(new CustomEvent('cff:pipeline-changed'));
      toast.success('Application submitted and added to your tracker!');
      navigate('ApplicationTracker');
    } catch (e) {
      toast.error('Could not submit. Please try again.');
      setSubmitting(false);
    }
  };

  const handleAccept = async (changeId) => {
    const updated = changes.map(c => c.id === changeId ? { ...c, accepted: true } : c);
    setChanges(updated);
    if (tr.id) {
      base44.entities.TailoredResume.update(tr.id, { changes: updated }).catch(() => {});
    }
  };

  const handleReject = async (changeId) => {
    const updated = changes.map(c => c.id === changeId ? { ...c, accepted: false } : c);
    setChanges(updated);
    if (tr.id) {
      base44.entities.TailoredResume.update(tr.id, { changes: updated }).catch(() => {});
    }
  };

  const handleAcceptAll = async () => {
    const updated = changes.map(c => c.accepted === null ? { ...c, accepted: true } : c);
    setChanges(updated);
    if (tr.id) {
      base44.entities.TailoredResume.update(tr.id, { changes: updated }).catch(() => {});
    }
    toast.success('All changes accepted!');
  };

  const acceptedCount = changes.filter(c => c.accepted === true).length;
  const rejectedCount = changes.filter(c => c.accepted === false).length;
  const pendingCount = changes.filter(c => c.accepted === null || c.accepted === undefined).length;

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .rt-grid { display: grid; grid-template-columns: 260px minmax(0, 1fr) 300px; gap: 20px; }
        @media (max-width: 1100px) { .rt-grid { grid-template-columns: minmax(0, 1fr) !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: applyContext ? '24px 16px 160px' : '24px 16px 100px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
          Resume <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Tailored</em>
          {companyName ? ` for ${companyName}` : ''}
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 24 }}>
          {jobTitle || 'Role'} · {changes.length} changes made
        </p>

        {/* Return-to-application banner (apply-modal flow) */}
        {applyContext && (
          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            border: '1px solid rgba(124,58,237,0.25)', borderRadius: 14,
            padding: '16px 20px', marginBottom: 24,
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 700, color: '#5b21b6', margin: '0 0 3px' }}>
              ✨ Your tailored resume is ready — one step left
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 12.5, color: '#7c3aed', margin: 0, lineHeight: 1.5 }}>
              Review the changes below, then hit <strong>Submit Application</strong> at the bottom of the screen to finish applying to {applyContext.company || companyName}.
            </p>
          </div>
        )}

        <div className="rt-grid">
          {/* Left — Score Panel */}
          <ScorePanel
            originalScore={result.originalScore || tr.original_score || 0}
            tailoredScore={result.tailoredScore || tr.ats_score || 0}
            keywordsAdded={tr.keywords_added || []}
            keywordsMissing={tr.keywords_missing || []}
            acceptedCount={acceptedCount}
            rejectedCount={rejectedCount}
            pendingCount={pendingCount}
            totalChanges={changes.length}
          />

          {/* Center — Resume View */}
          <ResumeView
            originalText={originalResumeText}
            tailoredText={tr.tailored_content || ''}
            changes={changes}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tailoredScore={result.tailoredScore || tr.ats_score || 0}
          />

          {/* Right — Changes Panel */}
          <ChangesPanel
            changes={changes}
            onAccept={handleAccept}
            onReject={handleReject}
            onAcceptAll={handleAcceptAll}
          />
        </div>

        {/* Download Bar */}
        <DownloadBar
          tailoredContent={tr.tailored_content || ''}
          acceptedCount={acceptedCount}
          totalChanges={changes.length}
          atsScore={result.tailoredScore || tr.ats_score || 0}
          companyName={companyName}
          jobTitle={jobTitle}
          tailoredResumeId={tr.id}
          onStartOver={onStartOver}
        />
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
                Your tailored resume will be attached and tracked automatically.
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
              {submitting ? 'Submitting…' : '⚡ Submit Application →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}