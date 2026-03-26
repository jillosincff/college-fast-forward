import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

const OPTIONS = [
  { value: 'yes', label: 'Happy to help' },
  { value: 'occasionally', label: 'Occasionally available' },
  { value: 'no', label: 'Not right now' },
];

export default function ParentIntroCard({ user }) {
  const [selected, setSelected] = useState(user?.intro_willingness || 'yes');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedin_url || '');
  const [linkedinSaving, setLinkedinSaving] = useState(false);
  const [linkedinSaved, setLinkedinSaved] = useState(false);

  const handleSelect = async (value) => {
    setSelected(value);
    await base44.auth.updateMe({ intro_willingness: value });
  };

  const handleLinkedinSave = async () => {
    if (!linkedinUrl.trim()) return;
    setLinkedinSaving(true);
    try {
      await base44.auth.updateMe({ linkedin_url: linkedinUrl.trim() });
      // Trigger background enrichment
      base44.functions.invoke('enrichParentProfile', { userId: user?.id, linkedinUrl: linkedinUrl.trim() }).catch(() => {});
      setLinkedinSaved(true);
      setTimeout(() => setLinkedinSaved(false), 3000);
    } finally {
      setLinkedinSaving(false);
    }
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>Intro Availability</p>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Are you open to making introductions?</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {OPTIONS.map(opt => {
          const active = selected === opt.value;
          return (
            <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? '#fff' : ORANGE,
              background: active ? ORANGE : 'transparent',
              border: `1.5px solid ${ORANGE}`, borderRadius: 100,
              padding: '9px 20px', cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.2s',
            }}>
              {opt.label}
            </button>
          );
        })}
      </div>
      <p style={{ fontFamily: dmSans, fontSize: 12, color: '#666' }}>This controls how often we match you with student intro requests.</p>

      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #2A2A2A' }}>
        <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>LinkedIn Profile</p>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 12 }}>Add your LinkedIn to improve your profile match quality</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={linkedinUrl}
            onChange={e => setLinkedinUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLinkedinSave()}
            placeholder="https://linkedin.com/in/yourname"
            style={{ flex: 1, fontFamily: dmSans, fontSize: 13, padding: '10px 14px', background: '#111', border: '1px solid #333', borderRadius: 8, color: '#fff', outline: 'none' }}
          />
          <button
            onClick={handleLinkedinSave}
            disabled={linkedinSaving || !linkedinUrl.trim()}
            style={{ background: linkedinSaved ? '#22C55E' : ORANGE, border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 500, color: '#fff', cursor: linkedinSaving || !linkedinUrl.trim() ? 'not-allowed' : 'pointer', opacity: !linkedinUrl.trim() ? 0.6 : 1, whiteSpace: 'nowrap', minHeight: 'auto' }}
          >
            {linkedinSaved ? 'Saved ✓' : linkedinSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {linkedinSaved && (
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#22C55E', margin: '8px 0 0' }}>⚡ Profile info updated — improving your match quality</p>
        )}
      </div>
    </div>
  );
}