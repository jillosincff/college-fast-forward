import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";
const ORANGE = '#E85D20';

const SEEKING_OPTS = [
  { key: 'internship', emoji: '🎓', label: 'Internship' },
  { key: 'fulltime', emoji: '💼', label: 'Full-time job' },
  { key: 'both', emoji: '🔭', label: 'Still exploring' },
];
const INDUSTRY_OPTS = ['Marketing', 'Finance', 'Tech / Software', 'Healthcare', 'Consulting', 'Sales', 'Media & Entertainment', 'Sports', 'Engineering', 'Real Estate', 'Fashion / Retail', 'Government / Nonprofit', 'Education', 'Arts & Design', 'Hospitality & Tourism', 'Science & Research', 'Operations & Logistics'];
const LOCATION_OPTS = [
  { key: 'remote', emoji: '🌐', label: 'Remote' },
  { key: 'city', emoji: '📍', label: 'A specific city' },
  { key: 'anywhere', emoji: '🗺️', label: 'Anywhere' },
];

const labelStyle = { display: 'block', fontFamily: dm, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 10 };

/**
 * Flow B — 20-second micro questions right after signup.
 * Writes career_goals so the job feed starts warm instead of empty.
 */
export default function StudentMicroQuestions({ onComplete }) {
  const [seeking, setSeeking] = useState('');
  const [industries, setIndustries] = useState([]);
  const [locationPref, setLocationPref] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleIndustry = (i) => setIndustries(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const isValid = seeking && industries.length > 0 &&
    (locationPref === 'remote' || locationPref === 'anywhere' || (locationPref === 'city' && city.trim()));

  const handleFinish = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    const location = locationPref === 'remote' ? 'Remote' : locationPref === 'anywhere' ? 'Open to Relocation' : city.trim();
    try {
      await base44.auth.updateMe({
        location,
        career_goals: {
          seeking,
          target_industries: industries,
          target_roles: [],
          location_preference: location,
          saved_at: new Date().toISOString(),
        },
      });
      base44.functions.invoke('refreshDailyDrop', {}).catch(() => {});
    } catch (e) { /* never block onboarding on goal save */ }
    onComplete();
  };

  const pill = (active) => ({
    fontFamily: dm, fontSize: 13, fontWeight: active ? 700 : 500,
    color: active ? '#fff' : '#bbb',
    background: active ? ORANGE : 'rgba(255,255,255,0.06)',
    border: `1px solid ${active ? ORANGE : '#2A2A2A'}`,
    borderRadius: 100, padding: '10px 16px', cursor: 'pointer',
    minHeight: 'auto', minWidth: 'auto', transition: 'all 0.15s ease',
  });

  return (
    <div className="onb-screen" style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        <div className="onb-card" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: '36px 32px' }}>
          <h1 style={{ fontFamily: dm, fontWeight: 700, fontSize: 24, color: '#fff', lineHeight: 1.3, marginBottom: 6 }}>
            Twenty seconds so CLIFF knows where to look.
          </h1>
          <p style={{ fontFamily: dm, fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 28 }}>
            Three quick picks — your job matches start with these.
          </p>

          {/* Q1: What are you looking for */}
          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>What are you looking for?</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SEEKING_OPTS.map(o => (
                <button key={o.key} onClick={() => setSeeking(o.key)} style={pill(seeking === o.key)}>
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q2: Industries */}
          <div style={{ marginBottom: 26 }}>
            <label style={labelStyle}>What interests you? <span style={{ color: '#555', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Pick any</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {INDUSTRY_OPTS.map(i => (
                <button key={i} onClick={() => toggleIndustry(i)} style={pill(industries.includes(i))}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Location */}
          <div style={{ marginBottom: 30 }}>
            <label style={labelStyle}>Where do you want to work?</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LOCATION_OPTS.map(o => (
                <button key={o.key} onClick={() => setLocationPref(o.key)} style={pill(locationPref === o.key)}>
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
            {locationPref === 'city' && (
              <input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Miami, FL"
                autoFocus
                style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', fontFamily: dm, fontSize: 15, color: '#fff', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = ORANGE; }}
                onBlur={e => { e.target.style.borderColor = '#2A2A2A'; }}
              />
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleFinish}
            disabled={!isValid || saving}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 100, border: 'none',
              background: isValid && !saving ? ORANGE : 'rgba(232,93,32,0.3)',
              color: '#fff', fontFamily: dm, fontSize: 16, fontWeight: 600,
              cursor: isValid && !saving ? 'pointer' : 'not-allowed',
              minHeight: 'auto', transition: 'background 0.2s',
            }}
          >
            {saving ? 'Handing this to CLIFF…' : 'Done — CLIFF, get to work →'}
          </button>
        </div>
      </div>
    </div>
  );
}