import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { FONT, BG, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_LIGHT, INDIGO_BORDER, GREEN, GREEN_LIGHT, GREEN_BORDER, Nav } from './onboardingShared';
import {
  LOCATION_OPTIONS, CITY_EXAMPLES, FLEXIBILITY_OPTIONS,
  normalizeLocation, locationSubcopy, needsFlexibilityQuestion, buildLocationAck,
} from '@/lib/locationPrefs';

/**
 * "Where do you want to work?" — structured work-location step.
 * Multi-select cards, city entry only when needed, one flexibility follow-up
 * only when the answer doesn't already make it clear. Pre-fills from anything
 * CLIFF already learned (e.g. the ideal-opportunity free text).
 */
export default function WorkLocationScreen({ seeking, value, onChange, h1style, substyle, onBack, onNext }) {
  const { types = [], locations = [], flexibility = '' } = value || {};
  const [cityInput, setCityInput] = useState('');
  const viewedRef = useRef(false);
  const startedAtRef = useRef(Date.now());

  // Fire-and-forget analytics — works pre-auth via the stable anonymous id
  const track = (event_name, properties = {}) => {
    try {
      let anonId = localStorage.getItem('cff_anon_id');
      if (!anonId) { anonId = Math.random().toString(36).slice(2, 12); localStorage.setItem('cff_anon_id', anonId); }
      base44.functions.invoke('logAnalyticsEvent', { event_name, anonymous_id: anonId, properties }).catch(() => {});
    } catch {}
  };

  // Analytics: step viewed (once)
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track('onboarding_location_viewed', { seeking: seeking || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeking]);

  const set = (patch) => onChange({ ...value, ...patch });

  const toggleType = (type) => {
    let next;
    if (types.includes(type)) {
      next = types.filter(t => t !== type);
    } else if (type === 'unknown') {
      next = ['unknown']; // "Not sure yet" stands alone
    } else {
      next = [...types.filter(t => t !== 'unknown'), type];
    }
    set({ types: next, flexibility: needsFlexibilityQuestion(next) ? flexibility : '' });
    track('onboarding_location_option_selected', { option: type, selected: !types.includes(type) });
  };

  const addCity = () => {
    const rec = normalizeLocation(cityInput);
    if (!rec) return;
    const dup = locations.some(l => (l.display_label || '').toLowerCase() === rec.display_label.toLowerCase());
    if (!dup) {
      set({ locations: [...locations, rec] });
      track('onboarding_location_city_entered', { location: rec.display_label });
    }
    setCityInput('');
  };

  const removeCity = (label) => set({ locations: locations.filter(l => l.display_label !== label) });

  const showCityEntry = types.includes('specific_locations');
  const showFlex = needsFlexibilityQuestion(types);
  // "Not sure" never requires a city; specific requires at least one location
  const ready = types.length > 0 && (!showCityEntry || locations.length > 0);
  const ack = ready ? buildLocationAck(value) : '';

  const suggestions = cityInput.trim()
    ? CITY_EXAMPLES.filter(c => c.toLowerCase().includes(cityInput.trim().toLowerCase()) && !locations.some(l => l.display_label === c))
    : [];

  const handleNext = () => {
    track('onboarding_location_completed', {
      types: types.join(','),
      locations_count: locations.length,
      flexibility: flexibility || '',
      seconds_on_step: Math.round((Date.now() - startedAtRef.current) / 1000),
    });
    onNext();
  };

  const chip = (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    background: active ? INDIGO_LIGHT : CARD,
    border: `2px solid ${active ? INDIGO : '#E2E8F0'}`,
    borderRadius: 14, padding: '15px 16px', cursor: 'pointer',
    textAlign: 'left', minHeight: 56, width: '100%',
    boxShadow: active ? `0 0 0 3px ${INDIGO_BORDER}` : '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.15s ease', WebkitTapHighlightColor: 'transparent',
  });

  return (
    <div style={{ textAlign: 'center', maxWidth: 560, width: '100%' }}>
      <h1 style={h1style}>Where do you want to work?</h1>
      <p style={{ ...substyle, marginBottom: 6 }}>{locationSubcopy(seeking)}</p>
      <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 22px', lineHeight: 1.6 }}>
        I'll use this to prioritize the right opportunities — not just show you more jobs.
      </p>

      <style>{`@media (max-width: 520px) { .loc-grid { grid-template-columns: 1fr !important; } }`}</style>
      <div className="loc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left' }}>
        {LOCATION_OPTIONS.map(opt => {
          const active = types.includes(opt.type);
          return (
            <button key={opt.type} onClick={() => toggleType(opt.type)} className="onb-option-btn" style={chip(active)}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{opt.emoji}</span>
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: active ? INDIGO : TEXT, flex: 1 }}>{opt.label}</span>
              {active && <span style={{ color: INDIGO, fontWeight: 800, fontSize: 14 }}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Specific city / area entry */}
      {showCityEntry && (
        <div style={{ marginTop: 16, textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }}
              placeholder="Search city, metro area, or state"
              autoFocus
              style={{ flex: 1, boxSizing: 'border-box', fontFamily: FONT, fontSize: 15, color: TEXT, background: BG, border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 14px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = INDIGO_BORDER}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            <button onClick={addCity} disabled={!cityInput.trim()}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', background: cityInput.trim() ? INDIGO : '#CBD5E1', border: 'none', borderRadius: 12, padding: '0 20px', cursor: cityInput.trim() ? 'pointer' : 'not-allowed', minHeight: 'auto' }}>
              Add
            </button>
          </div>
          {/* Example / matching suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {(suggestions.length ? suggestions : CITY_EXAMPLES.filter(c => !locations.some(l => l.display_label === c))).map(c => (
              <button key={c} onClick={() => { const rec = normalizeLocation(c); if (rec && !locations.some(l => l.display_label === c)) set({ locations: [...locations, rec] }); setCityInput(''); }}
                style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEXT2, background: BG, border: '1px solid #E2E8F0', borderRadius: 100, padding: '6px 12px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}>
                {c}
              </button>
            ))}
          </div>
          {/* Selected locations */}
          {locations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {locations.map(l => (
                <span key={l.display_label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO, background: INDIGO_LIGHT, border: `1px solid ${INDIGO_BORDER}`, borderRadius: 100, padding: '6px 12px' }}>
                  📍 {l.display_label}
                  <button onClick={() => removeCity(l.display_label)} style={{ background: 'none', border: 'none', color: INDIGO, cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 'auto', fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flexibility follow-up — only when the answer doesn't already make it clear */}
      {showFlex && (
        <div style={{ marginTop: 20, textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT, margin: '0 0 10px' }}>How flexible are you?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FLEXIBILITY_OPTIONS.map(f => {
              const active = flexibility === f.key;
              return (
                <button key={f.key} onClick={() => set({ flexibility: active ? '' : f.key })}
                  style={{ ...chip(active), padding: '12px 16px', minHeight: 48, borderRadius: 12 }}>
                  <span style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: active ? INDIGO : TEXT, flex: 1 }}>{f.label}</span>
                  {active && <span style={{ color: INDIGO, fontWeight: 800, fontSize: 13 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CLIFF acknowledgment */}
      {ack && (
        <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '14px 18px', marginTop: 20, textAlign: 'left', animation: 'fadeUp 0.25s ease', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
          <p style={{ fontFamily: FONT, fontSize: 13.5, color: '#0E7490', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>{ack}</p>
        </div>
      )}

      <Nav onBack={onBack} onNext={handleNext} nextDisabled={!ready} />
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: '14px 0 0', fontStyle: 'italic' }}>You can change this anytime.</p>
    </div>
  );
}