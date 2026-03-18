import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const GREEN = '#1B7A3D';

export default function DirectoryConsentButton({ user, onConsented }) {
  const alreadyConsented = user?.directory_consent_given === true;
  const [confirmed, setConfirmed] = useState(alreadyConsented);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (confirmed || saving) return;
    setSaving(true);
    await base44.auth.updateMe({
      directory_consent_given: true,
      visible_in_directory: true,
    });
    setConfirmed(true);
    setSaving(false);
    if (onConsented) onConsented();
  };

  if (confirmed) {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff',
          background: GREEN, border: 'none', borderRadius: 100,
          padding: '12px 20px', width: '100%', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Check size={16} /> Visibility confirmed ✓
        </div>
        <p style={{ fontFamily: dmSans, fontSize: 11, color: '#666', marginTop: 8, lineHeight: 1.5 }}>
          You can update your visibility preferences anytime from your profile settings.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={handleConfirm}
        disabled={saving}
        style={{
          fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: ORANGE,
          background: 'transparent', border: `1.5px solid ${ORANGE}`,
          borderRadius: 100, padding: '12px 20px', cursor: 'pointer',
          width: '100%', minHeight: 'auto', textAlign: 'center',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving…' : '✓ I agree — make my professional background visible to students and parents in the network.'}
      </button>
      <p style={{ fontFamily: dmSans, fontSize: 11, color: '#666', marginTop: 8, lineHeight: 1.5 }}>
        You can update your visibility preferences anytime from your profile settings.
      </p>
    </div>
  );
}