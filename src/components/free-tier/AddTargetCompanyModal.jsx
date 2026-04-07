import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';

export default function AddTargetCompanyModal({ user, onClose, onSaved }) {
  const [input, setInput] = useState('');
  const [companies, setCompanies] = useState(user?.career_goals?.target_companies || []);
  const [saving, setSaving] = useState(false);

  const addCompany = () => {
    const val = input.trim();
    if (!val || companies.includes(val)) return;
    setCompanies(prev => [...prev, val]);
    setInput('');
  };

  const removeCompany = (co) => setCompanies(prev => prev.filter(c => c !== co));

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      career_goals: {
        ...(user?.career_goals || {}),
        target_companies: companies,
      },
    });
    setSaving(false);
    onSaved?.(companies);
    onClose();
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 420, width: '100%', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Add Target Companies</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', color: '#888' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCompany()}
            placeholder="e.g. Goldman Sachs, Google..."
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
          />
          <button
            onClick={addCompany}
            style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}
          >
            Add
          </button>
        </div>

        {companies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {companies.map(co => (
              <span key={co} style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: '#E85D20', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {co}
                <span onClick={() => removeCompany(co)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 16, lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', background: '#E85D20', border: 'none', borderRadius: 10, padding: '13px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
        >
          {saving ? 'Saving...' : 'Save Companies →'}
        </button>
      </div>
    </div>
  );
}