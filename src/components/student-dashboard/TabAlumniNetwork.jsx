import React, { useState, useEffect } from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER, MUTED } from './constants';
import { base44 } from '@/api/base44Client';
import { Lock } from 'lucide-react';

const SAMPLE_ALUMNI_DATA = [
  { company: 'Nike', industry: 'Consumer Goods', count: 8, roles: [{ title: 'Analyst', count: 3 }, { title: 'Associate', count: 2 }, { title: 'Manager', count: 2 }, { title: 'Director', count: 1 }] },
  { company: 'Goldman Sachs', industry: 'Finance', count: 12, roles: [{ title: 'Analyst', count: 5 }, { title: 'Associate', count: 4 }, { title: 'VP', count: 2 }, { title: 'MD', count: 1 }] },
  { company: 'Google', industry: 'Technology', count: 15, roles: [{ title: 'SWE', count: 7 }, { title: 'PM', count: 4 }, { title: 'Data Analyst', count: 3 }, { title: 'Manager', count: 1 }] },
  { company: 'Deloitte', industry: 'Consulting', count: 18, roles: [{ title: 'Analyst', count: 8 }, { title: 'Consultant', count: 5 }, { title: 'Manager', count: 3 }, { title: 'Partner', count: 2 }] },
];

function BlurredProfileCard({ role, year }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#333' }} />
        <div>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', filter: 'blur(4px)', userSelect: 'none' }}>Profile Hidden</p>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#888' }}>{role}</p>
        </div>
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: '#555' }}>Class of '{year}</p>
    </div>
  );
}

export default function TabAlumniNetwork({ user, isPaid, onUnlock, onNavigateGoals }) {
  const [hasGoals, setHasGoals] = useState(false);
  const school = user?.school || user?.university || 'your school';

  useEffect(() => {
    (async () => {
      try {
        const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user?.email });
        if (profiles?.[0]?.target_companies?.length > 0) setHasGoals(true);
      } catch {}
    })();
  }, [user?.email]);

  if (!hasGoals) {
    return (
      <div>
        <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Your school's alumni are already inside.</h2>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 32 }}>See where graduates from your school have landed.</p>
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: MUTED, marginBottom: 16 }}>Add your career goals first so we can show you relevant alumni.</p>
          <button onClick={onNavigateGoals} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '10px 24px', cursor: 'pointer', minHeight: 'auto' }}>
            Go to Career Goals →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Your school's alumni are already inside.</h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 24 }}>See where graduates from {school} have landed.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {SAMPLE_ALUMNI_DATA.map(company => (
          <div key={company.company} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px' }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{company.company}</p>
              <span style={{ fontFamily: dmSans, fontSize: 12, color: MUTED }}>{company.industry}</span>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: ORANGE, marginTop: 6 }}>
                {company.count} alumni from {school} work here
              </p>
            </div>

            {/* Role breakdown */}
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#aaa', marginBottom: 14 }}>
              Including: {company.roles.map(r => `${r.title} (${r.count})`).join(' · ')}
            </p>

            {/* Blurred cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
              {[0, 1, 2].map(i => (
                <BlurredProfileCard key={i} role={company.roles[i % company.roles.length].title} year={22 - i} />
              ))}
            </div>

            {/* Lock overlay */}
            {!isPaid && (
              <div style={{ background: 'rgba(232,93,32,0.06)', border: `1px solid rgba(232,93,32,0.2)`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={14} style={{ color: ORANGE }} />
                  <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>See who to contact — and what to say</span>
                </div>
                <button onClick={onUnlock} style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '8px 20px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
                  Unlock FastIQ →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}