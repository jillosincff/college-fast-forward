const dm = "'DM Sans', sans-serif";

// Always-visible free-tier status at the top of Resume Studio: is the one free
// resume tailoring still available, or already used? Never silent.
export default function FreeTailorStatusBanner({ available, jobContext, onUseFree, onChooseJob, onUnlock }) {
  if (available) {
    const hasJob = !!(jobContext?.company || jobContext?.role);
    return (
      <div style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#6b21a8', margin: '0 0 4px' }}>
          🎁 You have 1 free resume tailoring left
        </p>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#7c3aed', margin: '0 0 14px', lineHeight: 1.5 }}>
          CLIFF will fully tailor your resume to one real job — complete and instant.
        </p>
        <button
          onClick={hasJob ? onUseFree : onChooseJob}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: dm, minHeight: 'auto' }}
        >
          {hasJob
            ? `Use free tailor on ${jobContext.role || 'this role'}${jobContext.company ? ` at ${jobContext.company}` : ''} →`
            : 'Choose a job first →'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
      <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#334155', margin: '0 0 4px' }}>
        🔒 You've used your free resume tailoring
      </p>
      <p style={{ fontFamily: dm, fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
        You can still view and upload your master resume. Tailoring, improving and building need CLIFF Pro.
      </p>
      <button
        onClick={onUnlock}
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: dm, minHeight: 'auto' }}
      >
        Unlock unlimited tailoring →
      </button>
    </div>
  );
}