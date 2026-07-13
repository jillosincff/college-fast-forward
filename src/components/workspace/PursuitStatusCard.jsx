const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const MATERIAL_LABELS = {
  not_started: { text: 'Not started', bg: '#f1f5f9', color: '#64748b' },
  generating: { text: 'Generating…', bg: '#fef3c7', color: '#92400e' },
  ready_for_review: { text: 'Ready for review', bg: '#ede9fe', color: '#6d28d9' },
  approved: { text: 'Approved', bg: '#dcfce7', color: '#166534' },
  complete: { text: 'Complete', bg: '#dcfce7', color: '#166534' },
  drafted: { text: 'Draft ready', bg: '#ede9fe', color: '#6d28d9' },
  sent: { text: 'Sent', bg: '#dbeafe', color: '#1d4ed8' },
  replied: { text: 'Replied', bg: '#dcfce7', color: '#166534' },
};

const APP_LABELS = {
  recommended: 'Recommended', preparing: 'Preparing', ready_to_apply: 'Ready to Apply',
  applied: 'Applied', follow_up_due: 'Follow-Up Due', interviewing: 'Interviewing',
  offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn', archived: 'Archived',
};

function Row({ label, status }) {
  const s = MATERIAL_LABELS[status] || MATERIAL_LABELS.not_started;
  const done = ['approved', 'complete', 'sent', 'replied'].includes(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontFamily: dm, fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13 }}>{done ? '✅' : status === 'not_started' ? '○' : '🟣'}</span>
        {label}
      </span>
      <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, background: s.bg, color: s.color, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>{s.text}</span>
    </div>
  );
}

// Unified pursuit status: the student sees at a glance what CLIFF has completed
// and exactly what remains — plus the single recommended next step.
export default function PursuitStatusCard({ pursuit }) {
  if (!pursuit) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          Application Progress
        </h3>
        <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 999, padding: '4px 12px' }}>
          {APP_LABELS[pursuit.application_status] || 'Preparing'}
        </span>
      </div>

      <Row label="Tailored resume" status={pursuit.resume_status} />
      <Row label="Connection check" status={pursuit.connection_search_status} />
      <Row label="Company preparation" status={pursuit.company_research_status} />
      <Row label="Warm outreach" status={pursuit.outreach_status} />

      {pursuit.next_action && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '10px 14px', marginTop: 12 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>✨</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>Recommended Next Step</p>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#374151', margin: 0, lineHeight: 1.45 }}>{pursuit.next_action}</p>
          </div>
        </div>
      )}
    </div>
  );
}