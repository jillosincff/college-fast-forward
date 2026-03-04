import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';

export default function MasterResumeCard({ profile, onOpenChat }) {
  const hasResume = !!profile?.resume_text;
  const updatedAt = profile?.updated_date;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="fiq-animate fiq-delay-2" style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #E2E8F0',
      padding: '20px 24px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: hasResume ? 'linear-gradient(135deg, #10B981, #059669)' : '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileText style={{ width: 20, height: 20, color: hasResume ? '#fff' : '#94A3B8' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            📄 Master Resume
            {hasResume && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#10B981',
                background: '#ECFDF5', padding: '2px 8px', borderRadius: 10,
              }}>
                ACTIVE
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            {hasResume
              ? `Last updated ${formatDate(updatedAt)}`
              : 'Upload your resume to unlock smarter features'}
          </div>
        </div>
      </div>

      <button
        onClick={() => onOpenChat(hasResume ? 'Review my resume' : 'Help me build a resume')}
        style={{
          background: hasResume ? '#F8FAFC' : '#FA4616',
          color: hasResume ? '#0F172A' : '#fff',
          border: hasResume ? '1px solid #E2E8F0' : 'none',
          padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.2s', minHeight: 'auto',
        }}
      >
        <RefreshCw style={{ width: 13, height: 13 }} />
        {hasResume ? 'Update' : 'Add Resume'}
      </button>
    </div>
  );
}