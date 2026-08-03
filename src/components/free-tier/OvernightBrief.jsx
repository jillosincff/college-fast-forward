import { ArrowRight, Moon, Users } from 'lucide-react';
import { openCliffWorkspace } from '@/lib/cliffWorkspace';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// "Here's what I did while you slept." The work is already finished when the
// student arrives — this surface reports it and hands them the approve step.
export default function OvernightBrief({ overnight }) {
  if (!overnight?.items?.length) return null;

  const open = () => openCliffWorkspace({
    company: overnight.company,
    role: overnight.role || '',
    jobUrl: overnight.job_url || '',
  });

  return (
    <div style={{ background: 'linear-gradient(135deg, #faf9ff, #f5f3ff)', border: '1px solid #ddd6fe', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
        <Moon size={12} /> While you slept
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {overnight.items.map((it, i) => (
          <p key={i} style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 600, color: '#374151', margin: 0, lineHeight: 1.55 }}>
            ✓ {it}
          </p>
        ))}
      </div>

      {overnight.contact_name && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6d28d9', margin: '0 0 12px' }}>
          <Users size={12} /> {overnight.contact_name} · {overnight.contact_role}
        </p>
      )}

      {overnight.company && (
        <button onClick={open}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
          Review your {overnight.company} package <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}