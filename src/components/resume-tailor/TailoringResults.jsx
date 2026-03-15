import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { toast } from 'sonner';
import ScorePanel from './ScorePanel';
import ResumeView from './ResumeView';
import ChangesPanel from './ChangesPanel';
import DownloadBar from './DownloadBar';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function TailoringResults({ result, companyName, jobTitle, originalResumeText, onStartOver, userEmail }) {
  const tr = result.tailoredResume || {};
  const [changes, setChanges] = useState(tr.changes || []);
  const [activeTab, setActiveTab] = useState('tailored');

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
        .rt-grid { display: grid; grid-template-columns: 260px 1fr 300px; gap: 20px; }
        @media (max-width: 900px) { .rt-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 100px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#1a1a1a', marginBottom: 4 }}>
          Resume <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Tailored</em>
          {companyName ? ` for ${companyName}` : ''}
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 24 }}>
          {jobTitle || 'Role'} · {changes.length} changes made
        </p>

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
    </div>
  );
}