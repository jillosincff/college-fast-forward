import React, { useState, useEffect } from 'react';
import { dmSans, CARD_BG, ORANGE, BORDER, MUTED, INDUSTRIES, LOCATIONS } from './constants';
import { base44 } from '@/api/base44Client';
import { Loader2, Check } from 'lucide-react';

export default function TabCareerGoals({ user, onGoalsSaved, onUnlock, isPaid }) {
  const [role, setRole] = useState('');
  const [industries, setIndustries] = useState([]);
  const [companies, setCompanies] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [locations, setLocations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing goals
  useEffect(() => {
    (async () => {
      try {
        const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user?.email });
        const p = profiles?.[0];
        if (p) {
          setRole(p.target_role || '');
          setIndustries(p.target_industries || []);
          setCompanies((p.target_companies || []).map(c => typeof c === 'string' ? c : c.name).join(', '));
          setGradYear(p.graduation_year?.toString() || '');
          setLocations(p.preferred_locations || []);
          setSaved(true);
        }
      } catch {}
    })();
  }, [user?.email]);

  const toggleIndustry = (ind) => setIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
  const toggleLocation = (loc) => setLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const companyList = companies.split(',').map(c => c.trim()).filter(Boolean);
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user?.email });
      const data = {
        user_email: user?.email,
        target_role: role,
        target_industries: industries,
        target_companies: companyList.map(name => ({ name })),
        graduation_year: gradYear ? parseInt(gradYear) : undefined,
        preferred_locations: locations,
      };
      if (profiles?.[0]) {
        await base44.entities.FastTrackProProfile.update(profiles[0].id, data);
      } else {
        await base44.entities.FastTrackProProfile.create(data);
      }
      setSaved(true);
      if (onGoalsSaved) onGoalsSaved();
    } catch (err) {
      console.error('Failed to save goals:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', background: '#111', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px', fontFamily: dmSans, fontSize: 14, color: '#fff', boxSizing: 'border-box' };

  return (
    <div>
      <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Build your career target list.</h2>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, marginBottom: 28 }}>The clearer your goals, the better FastIQ can help you.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 560 }}>
        {/* Role */}
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#ccc', display: 'block', marginBottom: 6 }}>What kind of role are you looking for?</label>
          <input value={role} onChange={e => { setRole(e.target.value); setSaved(false); }} placeholder="e.g. Marketing, Investment Banking, Software Engineering" style={inputStyle} />
        </div>

        {/* Industries */}
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#ccc', display: 'block', marginBottom: 8 }}>What industries interest you?</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => { toggleIndustry(ind); setSaved(false); }} data-chip="true"
                style={{ fontFamily: dmSans, fontSize: 12, fontWeight: industries.includes(ind) ? 600 : 400, color: industries.includes(ind) ? '#fff' : MUTED, background: industries.includes(ind) ? 'rgba(232,93,32,0.15)' : 'transparent', border: `1px solid ${industries.includes(ind) ? 'rgba(232,93,32,0.3)' : BORDER}`, borderRadius: 100, padding: '6px 14px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Companies */}
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#ccc', display: 'block', marginBottom: 6 }}>What are your target companies?</label>
          <input value={companies} onChange={e => { setCompanies(e.target.value); setSaved(false); }} placeholder="Start typing company names..." style={inputStyle} />
          <p style={{ fontFamily: dmSans, fontSize: 12, color: '#555', marginTop: 4 }}>Separate with commas. Don't worry if you're not sure yet — we'll help you find them.</p>
        </div>

        {/* Grad Year */}
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#ccc', display: 'block', marginBottom: 6 }}>What's your graduation year?</label>
          <select value={gradYear} onChange={e => { setGradYear(e.target.value); setSaved(false); }}
            style={{ ...inputStyle, appearance: 'auto' }}>
            <option value="">Select year</option>
            {[2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Locations */}
        <div>
          <label style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#ccc', display: 'block', marginBottom: 8 }}>Where are you open to working?</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LOCATIONS.map(loc => (
              <button key={loc} onClick={() => { toggleLocation(loc); setSaved(false); }} data-chip="true"
                style={{ fontFamily: dmSans, fontSize: 13, fontWeight: locations.includes(loc) ? 600 : 400, color: locations.includes(loc) ? '#fff' : MUTED, background: locations.includes(loc) ? 'rgba(232,93,32,0.15)' : 'transparent', border: `1px solid ${locations.includes(loc) ? 'rgba(232,93,32,0.3)' : BORDER}`, borderRadius: 100, padding: '8px 18px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save My Goals →'}
        </button>
      </div>

      {/* Confirmation card */}
      {saved && !saving && (
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px', marginTop: 28, maxWidth: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} style={{ color: '#10B981' }} />
            </div>
            <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#fff' }}>Your goals are saved.</p>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: isPaid ? 0 : 16 }}>
            See how many alumni from your school are at your target companies in the <strong style={{ color: '#fff' }}>Alumni Network</strong> tab.
          </p>
          {!isPaid && (
            <>
              <p style={{ fontFamily: dmSans, fontSize: 14, color: ORANGE, lineHeight: 1.6, marginBottom: 14 }}>
                <strong>FastIQ:</strong> Get full alumni names, personalized outreach, and a daily action plan.
              </p>
              <button onClick={onUnlock} style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 600, color: '#fff', background: ORANGE, border: 'none', borderRadius: 100, padding: '10px 24px', cursor: 'pointer', minHeight: 'auto' }}>
                Unlock FastIQ →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}