import { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { ArrowLeft } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const ORANGE = '#E85D20';

const INDUSTRIES = [
  'technology', 'finance', 'healthcare', 'consulting', 'law', 'real_estate',
  'education', 'media', 'marketing', 'manufacturing', 'government', 'nonprofit', 'other',
];

export default function ParentProfileEdit() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    school_name: '',
    company: '',
    industry: '',
    linkedin_url: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        school_name: user.school_name || user.school || user.university || '',
        company: user.current_company || user.company || '',
        industry: user.industry || (user.industries?.[0] || ''),
        linkedin_url: user.linkedin_url || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      full_name: form.full_name.trim(),
      school_name: form.school_name.trim(),
      current_company: form.company.trim(),
      company: form.company.trim(),
      industry: form.industry,
      industries: form.industry ? [form.industry] : [],
      linkedin_url: form.linkedin_url.trim(),
      bio: form.bio.trim(),
    });
    if (refreshUser) await refreshUser();
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate('Profile'); }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{
        background: '#0d1117', borderBottom: '1px solid #1A1A1A',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={() => navigate('Profile')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: ORANGE,
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: dmSans, fontSize: 13, fontWeight: 500, minHeight: 'auto', padding: 0,
        }}>
          <ArrowLeft size={16} /> Back to Profile
        </button>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#fff', marginBottom: 8 }}>Edit Profile</h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, color: '#888', marginBottom: 40 }}>Update your information so students know who you are.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Full Name" value={form.full_name} onChange={v => setForm(f => ({ ...f, full_name: v }))} placeholder="Your full name" />
          <Field label="School / University" value={form.school_name} onChange={v => setForm(f => ({ ...f, school_name: v }))} placeholder="e.g. University of Florida" />
          <Field label="Company" value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} placeholder="Where you work" />

          {/* Industry select */}
          <div>
            <label style={{ display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 8 }}>Industry</label>
            <select
              value={form.industry}
              onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A',
                borderRadius: 10, padding: '12px 14px', fontFamily: dmSans, fontSize: 14,
                color: form.industry ? '#fff' : '#666', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map(ind => (
                <option key={ind} value={ind} style={{ background: '#1A1A1A' }}>
                  {ind.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <Field label="LinkedIn URL" value={form.linkedin_url} onChange={v => setForm(f => ({ ...f, linkedin_url: v }))} placeholder="https://linkedin.com/in/yourname" />

          {/* Bio */}
          <div>
            <label style={{ display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 8 }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Tell students a bit about your background and how you can help..."
              rows={4}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A',
                borderRadius: 10, padding: '12px 14px', fontFamily: dmSans, fontSize: 14, color: '#fff',
                outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              background: saved ? '#4CAF50' : ORANGE, border: 'none', borderRadius: 10,
              padding: '16px', fontFamily: dmSans, fontSize: 15, fontWeight: 600,
              color: '#fff', cursor: saving || saved ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1, minHeight: 'auto', transition: 'background 0.2s',
            }}
          >
            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', marginBottom: 8 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A',
          borderRadius: 10, padding: '12px 14px', fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}