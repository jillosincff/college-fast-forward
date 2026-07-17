import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const NEGATIVE_CATEGORIES = {
  disliked_industries: 'industry',
  avoided_companies: 'company',
  excluded_locations: 'location',
};

// Read-only strip of CLIFF's active negative preferences ("avoiding sales"),
// so students can verify them when reviewing career goals. Managed in CLIFF Memory.
export default function AvoidingPreferencesStrip({ userEmail }) {
  const [avoiding, setAvoiding] = useState([]);

  useEffect(() => {
    if (!userEmail) return;
    let cancelled = false;
    base44.entities.StudentMemory.filter({ user_email: userEmail, active: true }, '-confidence', 50)
      .then(mems => {
        if (cancelled) return;
        setAvoiding((mems || []).filter(m => NEGATIVE_CATEGORIES[m.category]));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userEmail]);

  if (!avoiding.length) return null;

  return (
    <div style={{ background: '#FFF8F5', border: '1px solid #FED7C3', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#C2410C', letterSpacing: '0.07em', margin: '0 0 8px', textTransform: 'uppercase' }}>
        🚫 CLIFF is avoiding for you
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {avoiding.map(m => (
          <span key={m.id} style={{ background: '#fff', border: '1px solid #FDBA8C', color: '#9A3412', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
            {NEGATIVE_CATEGORIES[m.category] === 'industry' ? `No ${m.value} roles` : NEGATIVE_CATEGORIES[m.category] === 'company' ? `Avoiding ${m.value}` : `Not ${m.value}`}
          </span>
        ))}
      </div>
      <a href="#/CliffMemory" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#C2410C', textDecoration: 'underline', textUnderlineOffset: 2 }}>
        Manage in CLIFF Memory →
      </a>
    </div>
  );
}