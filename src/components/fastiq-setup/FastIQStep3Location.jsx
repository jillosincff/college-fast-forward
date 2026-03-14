import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const LOCATIONS = ['Remote', 'New York', 'Miami', 'San Francisco', 'Chicago', 'Boston', 'Los Angeles', 'Austin', 'Anywhere'];
const TIMELINES = [
  { id: 'summer_2025', label: 'Summer 2025' },
  { id: 'fall_2025', label: 'Fall 2025' },
  { id: 'summer_2026', label: 'Summer 2026' },
  { id: 'fall_2026', label: 'Fall 2026' },
  { id: 'after_graduation', label: 'After graduation' },
  { id: 'exploring', label: 'Just exploring' },
];

export default function FastIQStep3Location({ locations, onLocationsChange, timeline, onTimelineChange, customCity, onCustomCityChange, gradYear }) {
  const toggleLocation = (loc) => {
    if (loc === 'Anywhere') {
      onLocationsChange(locations.includes('Anywhere') ? [] : ['Anywhere']);
      return;
    }
    const filtered = locations.filter(l => l !== 'Anywhere');
    if (filtered.includes(loc)) {
      onLocationsChange(filtered.filter(l => l !== loc));
    } else {
      onLocationsChange([...filtered, loc]);
    }
  };

  const addCustomCity = () => {
    const city = customCity.trim();
    if (city && !locations.includes(city)) {
      onLocationsChange([...locations.filter(l => l !== 'Anywhere'), city]);
      onCustomCityChange('');
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        Where and when?
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.6, marginBottom: 28 }}>
        FASTIQ will prioritize alumni at companies in these locations.
      </p>

      {/* Location */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(244,240,232,0.5)', marginBottom: 12 }}>
          Where are you open to working?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {LOCATIONS.map(loc => (
            <button
              key={loc}
              onClick={() => toggleLocation(loc)}
              data-chip="true"
              style={{
                padding: '10px 16px', borderRadius: 100,
                background: locations.includes(loc) ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.04)',
                border: `0.5px solid ${locations.includes(loc) ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: locations.includes(loc) ? orange : 'rgba(244,240,232,0.6)',
                fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                cursor: 'pointer', minHeight: 'auto', width: 'auto',
                transition: 'all 0.15s',
              }}
            >
              {loc}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customCity}
            onChange={e => onCustomCityChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomCity(); } }}
            placeholder="Add a city →"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: '#f4f0e8', fontFamily: dmSans, fontSize: 13, outline: 'none',
            }}
          />
          {customCity.trim() && (
            <button
              onClick={addCustomCity}
              style={{
                padding: '10px 16px', borderRadius: 12, border: 'none', background: orange,
                color: '#fff', fontFamily: dmSans, fontSize: 13, cursor: 'pointer',
                minHeight: 'auto', width: 'auto',
              }}
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: 'rgba(244,240,232,0.5)', marginBottom: 12 }}>
          When do you need this?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TIMELINES.map(t => (
            <button
              key={t.id}
              onClick={() => onTimelineChange(t.id)}
              data-chip="true"
              style={{
                padding: '10px 16px', borderRadius: 100,
                background: timeline === t.id ? 'rgba(232,93,32,0.15)' : 'rgba(255,255,255,0.04)',
                border: `0.5px solid ${timeline === t.id ? 'rgba(232,93,32,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: timeline === t.id ? orange : 'rgba(244,240,232,0.6)',
                fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                cursor: 'pointer', minHeight: 'auto', width: 'auto',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}