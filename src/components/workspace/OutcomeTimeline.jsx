import { format } from 'date-fns';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 24px', marginBottom: 16 };

// Outcome timeline for one opportunity: recommendation → resume → application →
// follow-up → interview → offer. Celebrates only REAL wins.
export default function OutcomeTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;
  const offerDone = timeline.find(t => t.key === 'offer')?.done;
  const interviewDone = timeline.find(t => t.key === 'interview')?.done;
  const celebration = offerDone ? '🎉 You CLIFFed it. Offer received.' : interviewDone ? '🎉 You CLIFFed it — interview earned.' : null;

  const fmt = (d) => { try { return format(new Date(d), 'MMM d'); } catch { return ''; } };

  return (
    <div style={card}>
      <h3 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        Your Progress Here
      </h3>

      {celebration && (
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: '#fff', margin: 0 }}>{celebration}</p>
        </div>
      )}

      <div>
        {timeline.map((step, i) => (
          <div key={step.key} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: step.done ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#f1f5f9',
                border: step.done ? 'none' : '2px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: dm,
              }}>
                {step.done ? '✓' : ''}
              </div>
              {i < timeline.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 16, background: step.done ? '#ddd6fe' : '#f1f5f9' }} />
              )}
            </div>
            <div style={{ paddingBottom: i < timeline.length - 1 ? 14 : 0 }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: step.done ? 800 : 600, color: step.done ? '#111827' : '#9ca3af', margin: 0, lineHeight: '22px' }}>
                {step.label}
                {step.date && step.done && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', marginLeft: 8 }}>{fmt(step.date)}</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}