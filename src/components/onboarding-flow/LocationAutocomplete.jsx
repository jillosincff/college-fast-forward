import { useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { FONT, BG, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER } from './onboardingShared';

// Curated list of US metros in "City, ST" format — the exact format the
// Magic Moment location gate and the JSearch backend expect.
const US_METROS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
  'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
  'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
  'Kansas City, MO', 'Mesa, AZ', 'Atlanta, GA', 'Omaha, NE', 'Colorado Springs, CO',
  'Raleigh, NC', 'Miami, FL', 'Long Beach, CA', 'Virginia Beach, VA', 'Oakland, CA',
  'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'Tampa, FL', 'New Orleans, LA',
  'Wichita, KS', 'Cleveland, OH', 'Bakersfield, CA', 'Aurora, CO', 'Anaheim, CA',
  'Honolulu, HI', 'Santa Ana, CA', 'Riverside, CA', 'Corpus Christi, TX', 'Lexington, KY',
  'Stockton, CA', 'St. Louis, MO', 'Saint Paul, MN', 'Henderson, NV', 'Pittsburgh, PA',
  'Cincinnati, OH', 'Anchorage, AK', 'Greensboro, NC', 'Plano, TX', 'Lincoln, NE',
  'Orlando, FL', 'Irvine, CA', 'Newark, NJ', 'Durham, NC', 'Chula Vista, CA',
  'Toledo, OH', 'Fort Wayne, IN', 'St. Petersburg, FL', 'Laredo, TX', 'Buffalo, NY',
  'Madison, WI', 'Lubbock, TX', 'Chandler, AZ', 'Scottsdale, AZ', 'Reno, NV',
  'Glendale, AZ', 'Norfolk, VA', 'Winston-Salem, NC', 'North Las Vegas, NV', 'Gilbert, AZ',
  'Chesapeake, VA', 'Garland, TX', 'Irving, TX', 'Chattanooga, TN', 'Fremont, CA',
  'Baton Rouge, LA', 'Durham, NC', 'Richmond, VA', 'Boise, ID', 'San Antonio, TX',
  'Tallahassee, FL', 'Gainesville, FL', 'Daytona Beach, FL', 'Birmingham, AL',
  'Salt Lake City, UT', 'Hartford, CT', 'Providence, RI', 'Des Moines, IA',
  'Grand Rapids, MI', 'Scranton, PA', 'Albany, NY', 'Syracuse, NY', 'Rochester, NY',
  'Trenton, NJ', 'Charleston, SC', 'Columbia, SC', 'Knoxville, TN', 'Little Rock, AR',
  'Jackson, MS', 'Shreveport, LA', 'Mobile, AL', 'Huntsville, AL', 'Knoxville, TN',
];

const inputStyle = {
  width: '100%', boxSizing: 'border-box', fontFamily: FONT, fontSize: 15, color: TEXT,
  background: BG, border: `1.5px solid #E2E8F0`, borderRadius: 12, padding: '13px 14px 13px 38px',
  outline: 'none', transition: 'border-color 0.15s',
};

/**
 * Location input with autocomplete suggestions in "City, ST" format.
 * Free text still works — the list just nudges users toward parseable values.
 */
export default function LocationAutocomplete({ value, onChange, placeholder = 'City, State (e.g. Miami, FL)' }) {
  const [focused, setFocused] = useState(false);
  const [blurring, setBlurring] = useState(false);
  const inputRef = useRef(null);

  const q = value.trim().toLowerCase();
  const suggestions = q
    ? US_METROS.filter(m => m.toLowerCase().includes(q) && m.toLowerCase() !== q).slice(0, 6)
    : [];

  // Delay blur so suggestion clicks register before the dropdown closes
  const handleBlur = () => {
    setBlurring(true);
    setTimeout(() => { setFocused(false); setBlurring(false); }, 150);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 10 }}>
      <MapPin size={14} color={INDIGO_DIM} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        style={inputStyle}
      />
      {focused && !blurring && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
          background: '#fff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', marginTop: 4,
        }}>
          {suggestions.map((m) => (
            <button
              key={m}
              onMouseDown={(e) => { e.preventDefault(); onChange(m); setFocused(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                fontFamily: FONT, fontSize: 14, color: TEXT, background: 'none',
                border: 'none', borderBottom: '1px solid #f1f5f9', padding: '11px 14px',
                cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f3ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <MapPin size={13} color={INDIGO_DIM} />
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}