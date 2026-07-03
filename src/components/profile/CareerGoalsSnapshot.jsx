import React, { useState } from 'react';
import EditGoalsModal from '@/components/free-tier/EditGoalsModal';

const SEEKING_LABELS = {
  internship: '🎓 Internships',
  fulltime: '💼 Full-time roles',
  both: '🎯 Internships + Full-time',
};

const chip = (bg, border, color) => ({
  background: bg, border: `1px solid ${border}`, color,
  padding: '4px 12px', borderRadius: 20, fontSize: 12.5,
  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
});

export default function CareerGoalsSnapshot({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [showEdit, setShowEdit] = useState(false);
  const goals = user?.career_goals || {};
  const roles = goals.target_roles || [];
  const industries = goals.target_industries || goals.industries || [];
  const location = goals.location_preference || user?.location || '';
  const seeking = goals.seeking || 'both';

  const Row = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 6px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </div>
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #E8EAF6', borderRadius: 16, padding: '22px 24px', marginTop: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>My Search Preferences</h3>
        <button
          onClick={() => setShowEdit(true)}
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 600, color: '#6d28d9', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 100, padding: '6px 16px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}
        >
          Edit
        </button>
      </div>

      <Row label="Looking for">
        <span style={chip('#F5F3FF', '#DDD6FE', '#6d28d9')}>{SEEKING_LABELS[seeking] || SEEKING_LABELS.both}</span>
      </Row>

      <Row label="Target roles">
        {roles.length > 0
          ? roles.map(r => <span key={r} style={chip('#FFF7ED', '#FED7AA', '#9A3412')}>{r}</span>)
          : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#94A3B8' }}>Not set yet</span>}
      </Row>

      <Row label="Industries">
        {industries.length > 0
          ? industries.map(i => <span key={i} style={chip('#EFF6FF', '#BFDBFE', '#1E40AF')}>{i}</span>)
          : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#94A3B8' }}>Not set yet</span>}
      </Row>

      <Row label="Location">
        {location
          ? <span style={chip('#F0FDF4', '#BBF7D0', '#166534')}>📍 {location}</span>
          : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#94A3B8' }}>Not set yet</span>}
      </Row>

      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
        These answers power your daily job matches — update them anytime (e.g. switch from internships to full-time when you graduate).
      </p>

      {showEdit && (
        <EditGoalsModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSave={(_, refreshedUser) => {
            if (refreshedUser) setUser(refreshedUser);
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}