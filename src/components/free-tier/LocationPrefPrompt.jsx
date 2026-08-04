import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  LOCATION_OPTIONS, CITY_EXAMPLES, normalizeLocation,
  buildLocationPayload, buildLocationMemories, buildLocationAck, needsFlexibilityQuestion,
} from '@/lib/locationPrefs';

const dm = "'DM Sans', system-ui, sans-serif";
const DISMISS_KEY = 'cff_locpref_prompt_dismissed';

/**
 * One-time dashboard prompt for existing students who onboarded before the
 * work-location step existed. Dismissible, saves immediately on confirm.
 */
export default function LocationPrefPrompt({ user, onUpdated }) {
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [cityInput, setCityInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });
  const viewedRef = useRef(false);

  // Answered = the onboarding location step, or any location already saved on
  // the profile / career goals. Never re-ask for something we already know.
  const alreadyAnswered =
    (Array.isArray(user?.location_preference_type) && user.location_preference_type.length > 0) ||
    !!user?.career_goals?.location_preference ||
    !!user?.location;
  const show = user?.email && !alreadyAnswered && !hidden;

  useEffect(() => {
    if (!show || viewedRef.current) return;
    viewedRef.current = true;
    base44.functions.invoke('logAnalyticsEvent', {
      event_name: 'dashboard_location_prompt_viewed', properties: {},
    }).catch(() => {});
  }, [show]);

  if (!show) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setHidden(true);
    base44.functions.invoke('logAnalyticsEvent', {
      event_name: 'dashboard_location_prompt_dismissed', properties: {},
    }).catch(() => {});
  };

  const toggleType = (type) => {
    setTypes(prev => {
      if (prev.includes(type)) return prev.filter(t => t !== type);
      if (type === 'unknown') return ['unknown'];
      return [...prev.filter(t => t !== 'unknown'), type];
    });
  };

  const addCity = (raw) => {
    const rec = normalizeLocation(raw ?? cityInput);
    if (!rec) return;
    setLocations(prev => prev.some(l => l.display_label.toLowerCase() === rec.display_label.toLowerCase()) ? prev : [...prev, rec]);
    setCityInput('');
  };

  const showCityEntry = types.includes('specific_locations');
  const ready = types.length > 0 && (!showCityEntry || locations.length > 0);
  const value = { types, locations, flexibility: '' };

  const save = async () => {
    if (!ready || saving) return;
    setSaving(true);
    try {
      const payload = buildLocationPayload(value);
      payload.location_source = 'dashboard_prompt';
      await base44.auth.updateMe(payload);
      const mems = buildLocationMemories(value, user.email);
      if (mems.length) await base44.entities.StudentMemory.bulkCreate(mems);
      base44.functions.invoke('logAnalyticsEvent', {
        event_name: 'dashboard_location_prompt_completed',
        properties: { types: types.join(','), locations_count: locations.length },
      }).catch(() => {});
      setSaved(true);
      try { localStorage.setItem(DISMISS_KEY, '1'); } catch {}
      const refreshed = await base44.auth.me().catch(() => null);
      if (refreshed && onUpdated) onUpdated(refreshed);
      setTimeout(() => setHidden(true), 2500);
    } catch {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#166534', margin: 0 }}>{buildLocationAck(value)}</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 4px 14px rgba(109,40,217,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.5 }}>
          🤖 One quick question so I can improve your opportunities: where do you want to work?
        </p>
        <button onClick={dismiss} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 16, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {LOCATION_OPTIONS.map(opt => {
          const active = types.includes(opt.type);
          return (
            <button key={opt.type} onClick={() => toggleType(opt.type)}
              style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: active ? '#6d28d9' : '#374151', background: active ? 'rgba(109,40,217,0.08)' : '#f9fafb', border: `1.5px solid ${active ? '#6d28d9' : '#e5e7eb'}`, borderRadius: 100, padding: '9px 14px', cursor: 'pointer', minHeight: 44 }}>
              {opt.emoji} {opt.label}
            </button>
          );
        })}
      </div>

      {showCityEntry && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={cityInput} onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
              placeholder="Search city, metro area, or state"
              style={{ flex: 1, fontFamily: dm, fontSize: 14, color: '#111827', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
            <button onClick={() => addCity()} disabled={!cityInput.trim()}
              style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: cityInput.trim() ? '#6d28d9' : '#cbd5e1', border: 'none', borderRadius: 10, padding: '0 16px', cursor: cityInput.trim() ? 'pointer' : 'not-allowed', minHeight: 'auto' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {CITY_EXAMPLES.filter(c => !locations.some(l => l.display_label === c)).map(c => (
              <button key={c} onClick={() => addCity(c)}
                style={{ fontFamily: dm, fontSize: 11.5, fontWeight: 600, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 100, padding: '5px 10px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>{c}</button>
            ))}
          </div>
          {locations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {locations.map(l => (
                <span key={l.display_label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#6d28d9', background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', borderRadius: 100, padding: '5px 12px' }}>
                  📍 {l.display_label}
                  <button onClick={() => setLocations(prev => prev.filter(x => x.display_label !== l.display_label))}
                    style={{ background: 'none', border: 'none', color: '#6d28d9', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', fontSize: 13, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {types.length > 0 && (
        <button onClick={save} disabled={!ready || saving}
          style={{ marginTop: 14, fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: '#fff', background: ready && !saving ? 'linear-gradient(135deg, #6d28d9, #7c3aed)' : '#cbd5e1', border: 'none', borderRadius: 12, padding: '12px 24px', cursor: ready && !saving ? 'pointer' : 'not-allowed', minHeight: 44 }}>
          {saving ? 'Saving…' : 'Save →'}
        </button>
      )}
    </div>
  );
}