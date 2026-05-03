import { useState } from 'react';
import { motion } from 'framer-motion';
import SchoolSearchInput from '@/components/onboarding/student/SchoolSearchInput';
import { dmSans, ORANGE, TEXT, MUTED, BORDER } from './theme';

const YEAR_OPTIONS = [
  { label: 'Freshman' },
  { label: 'Sophomore' },
  { label: 'Junior' },
  { label: 'Senior' },
  { label: 'Recent grad' },
];

/**
 * Screen 2 — collect first name, school, and academic year. School powers the
 * Act 2 search, year shows up in mirror-back copy.
 */
export default function SchoolStep({
  initialFirstName = '',
  initialSchool = '',
  initialYear = '',
  onSubmit,
  loading,
}) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [school, setSchool] = useState(initialSchool);
  const [year, setYear] = useState(initialYear);

  const valid = firstName.trim().length > 0 && school.trim().length > 0 && year;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ padding: '32px 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.16em',
        color: ORANGE, margin: '0 0 12px',
      }}>
        About you
      </p>
      <h1 style={{
        fontFamily: dmSans, fontSize: 26, fontWeight: 700,
        color: TEXT, lineHeight: 1.25, margin: '0 0 8px', letterSpacing: '-0.01em',
      }}>
        Quick basics so we can pull your network.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, margin: '0 0 28px' }}>
        Takes 20 seconds.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{
          display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 8,
        }}>
          First name
        </label>
        <input
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="Your first name"
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${BORDER}`, borderRadius: 12,
            padding: '14px 16px', fontFamily: dmSans, fontSize: 15,
            color: TEXT, boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{
          display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 8,
        }}>
          Your school
        </label>
        <SchoolSearchInput value={school} onChange={setSchool} />
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{
          display: 'block', fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 10,
        }}>
          Year
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {YEAR_OPTIONS.map(opt => {
            const active = year === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => setYear(opt.label)}
                style={{
                  background: active ? 'rgba(232,93,32,0.14)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active ? ORANGE : BORDER}`,
                  borderRadius: 999, padding: '10px 16px',
                  fontFamily: dmSans, fontSize: 13, fontWeight: active ? 600 : 500,
                  color: active ? TEXT : 'rgba(255,255,255,0.78)',
                  cursor: 'pointer', minHeight: 'auto',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onSubmit({ firstName: firstName.trim(), school: school.trim(), year })}
        disabled={!valid || loading}
        style={{
          width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
          background: valid && !loading ? ORANGE : 'rgba(232,93,32,0.28)',
          color: TEXT, fontFamily: dmSans, fontSize: 16, fontWeight: 600,
          cursor: valid && !loading ? 'pointer' : 'not-allowed',
          minHeight: 'auto',
        }}
      >
        {loading ? 'Saving…' : 'Continue →'}
      </button>
    </motion.div>
  );
}
