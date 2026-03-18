import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const CARD_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

export default function ParentVisibilityCard({ user }) {
  const { refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const consentGiven = user?.directory_consent_given === true;
  const visible = consentGiven && user?.visible_in_directory !== false;

  const handleConfirmVisibility = async () => {
    setSaving(true);
    await base44.auth.updateMe({ directory_consent_given: true, visible_in_directory: true });
    if (refreshUser) await refreshUser();
    setSaving(false);
  };

  const handlePause = async () => {
    setSaving(true);
    await base44.auth.updateMe({ visible_in_directory: false });
    if (refreshUser) await refreshUser();
    setSaving(false);
  };

  const handleResume = async () => {
    setSaving(true);
    await base44.auth.updateMe({ visible_in_directory: true });
    if (refreshUser) await refreshUser();
    setSaving(false);
  };

  return (
    <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 6 }}>Directory Visibility</p>
      <p style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 16 }}>How you appear in the network.</p>

      {consentGiven && visible ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>Your profile is visible to students and parents in the network. ✓</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', marginLeft: 16 }}>Students targeting your industry can find and contact you.</p>
          </div>
          <button onClick={handlePause} disabled={saving} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#888',
            background: 'transparent', border: '1px solid #444', borderRadius: 100,
            padding: '8px 18px', cursor: 'pointer', minHeight: 'auto', flexShrink: 0,
            opacity: saving ? 0.5 : 1,
          }}>Pause visibility</button>
        </div>
      ) : consentGiven && !visible ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', flexShrink: 0 }} />
              <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>Your profile is currently paused.</span>
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', marginLeft: 16 }}>Students can't find you while paused.</p>
          </div>
          <button onClick={handleResume} disabled={saving} style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '8px 18px', cursor: 'pointer', minHeight: 'auto', flexShrink: 0,
            opacity: saving ? 0.5 : 1,
          }}>Resume visibility</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ORANGE, flexShrink: 0 }} />
            <span style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#fff' }}>Your profile is currently hidden.</span>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: '#888', marginBottom: 16 }}>Confirm visibility to get matched with students who need your network.</p>
          <button onClick={handleConfirmVisibility} disabled={saving} style={{
            fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
            background: ORANGE, border: 'none', borderRadius: 100,
            padding: '12px 20px', cursor: 'pointer', width: '100%', minHeight: 'auto',
            opacity: saving ? 0.5 : 1,
          }}>✓ Make my professional background visible to students and parents in the network.</button>
          <p style={{ fontFamily: dmSans, fontSize: 11, color: '#666', marginTop: 8 }}>You can pause or update this anytime.</p>
        </div>
      )}
    </div>
  );
}