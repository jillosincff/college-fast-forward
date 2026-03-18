import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';
const GREEN = '#1B7A3D';

export default function DirectoryConsentBanner() {
  const { user, refreshUser } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only show for parents who haven't given consent
  const isParent = user?.persona === 'parent' || user?.roles?.includes('parent');
  if (!isParent || user?.directory_consent_given === true || confirmed) return null;

  const handleConfirm = async () => {
    if (saving) return;
    setSaving(true);
    await base44.auth.updateMe({
      directory_consent_given: true,
      visible_in_directory: true,
    });
    setConfirmed(true);
    setSaving(false);
    if (refreshUser) refreshUser();
  };

  return (
    <div style={{
      background: '#FFF8F0', border: '1px solid rgba(232,93,32,0.25)',
      borderRadius: 12, padding: '20px 24px', marginBottom: 20,
    }}>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>
        Your profile is currently hidden.
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13, color: '#666', lineHeight: 1.55, marginBottom: 14 }}>
        Confirm visibility to get matched with students.
      </p>
      <button
        onClick={handleConfirm}
        disabled={saving}
        style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: '#fff',
          background: ORANGE, border: 'none', borderRadius: 100,
          padding: '10px 20px', cursor: 'pointer', minHeight: 'auto',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving…' : '✓ Make my profile visible'}
      </button>
    </div>
  );
}