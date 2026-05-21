import { useState } from 'react';

const dm = "'DM Sans', system-ui, sans-serif";
const sat = "'Satoshi', 'DM Sans', system-ui, sans-serif";
const GREEN = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';
const GREEN_BORDER = '#bbf7d0';
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const TEXT2 = '#6b7280';

const RELATIONSHIPS = ['Mom', 'Dad', 'Guardian', 'Other'];

export default function ParentNetworkBooster({ onSkip, onAdd }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim() && company.trim() && relationship;

  const handleAdd = () => {
    if (!canSubmit) return;
    onAdd?.({ name, company, email, relationship });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 20, padding: '28px 24px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
        <p style={{ fontFamily: sat, fontSize: 18, fontWeight: 800, color: GREEN, margin: '0 0 6px' }}>Network Booster Added!</p>
        <p style={{ fontFamily: dm, fontSize: 14, color: TEXT2, margin: 0 }}>
          We'll scan {name.split(' ')[0]}'s network at <strong style={{ color: TEXT }}>{company}</strong> for warm intros and hidden roles.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: '24px 22px', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>⚡</span>
        <div>
          <p style={{ fontFamily: sat, fontSize: 16, fontWeight: 800, color: TEXT, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
            Want to 10x your network overnight?
          </p>
          <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.55 }}>
            Add your parent(s). Each one unlocks their full professional circle — creating an exponential jump in warm intros and hidden roles.{' '}
            <span style={{ color: TEXT2 }}>Takes 20 seconds. Zero pressure.</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        {/* Name */}
        <input
          type="text"
          placeholder="Parent's Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            fontFamily: dm, fontSize: 14, color: TEXT,
            background: '#f9fafb', border: `1.5px solid ${name ? BLUE_BORDER : BORDER}`,
            borderRadius: 10, padding: '12px 14px', outline: 'none', width: '100%', boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {/* Company — highlighted as most important */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Company / Place of Work *"
            value={company}
            onChange={e => setCompany(e.target.value)}
            style={{
              fontFamily: dm, fontSize: 14, color: TEXT,
              background: company ? GREEN_LIGHT : '#f9fafb',
              border: `1.5px solid ${company ? GREEN_BORDER : BORDER}`,
              borderRadius: 10, padding: '12px 14px', outline: 'none', width: '100%', boxSizing: 'border-box',
              transition: 'all 0.15s',
            }}
          />
          {!company && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: dm, fontSize: 10, fontWeight: 700, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 6, padding: '2px 7px', pointerEvents: 'none' }}>Key field</span>
          )}
        </div>
        {/* Email */}
        <input
          type="email"
          placeholder="Work Email (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            fontFamily: dm, fontSize: 14, color: TEXT,
            background: '#f9fafb', border: `1.5px solid ${email ? BLUE_BORDER : BORDER}`,
            borderRadius: 10, padding: '12px 14px', outline: 'none', width: '100%', boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {/* Relationship chips */}
        <div>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: TEXT2, margin: '0 0 8px' }}>Relationship *</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {RELATIONSHIPS.map(r => (
              <button
                key={r}
                onClick={() => setRelationship(r)}
                style={{
                  fontFamily: dm, fontSize: 13, fontWeight: 600,
                  padding: '9px 18px', borderRadius: 100, cursor: 'pointer', minHeight: 'auto',
                  background: relationship === r ? BLUE : '#f3f4f6',
                  border: `1.5px solid ${relationship === r ? BLUE : '#e5e7eb'}`,
                  color: relationship === r ? '#fff' : TEXT2,
                  transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <button
        onClick={handleAdd}
        disabled={!canSubmit}
        style={{
          width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff',
          background: canSubmit ? `linear-gradient(135deg, ${BLUE} 0%, #1d4ed8 100%)` : '#d1d5db',
          border: 'none', borderRadius: 12, padding: '16px 20px', cursor: canSubmit ? 'pointer' : 'not-allowed',
          minHeight: 52, marginBottom: 8, transition: 'all 0.15s',
          boxShadow: canSubmit ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
        }}
      >
        Add Parent &amp; Expand My Network →
      </button>
      <button
        onClick={onSkip}
        style={{
          width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 500, color: TEXT2,
          background: 'transparent', border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: '12px 20px', cursor: 'pointer', minHeight: 44,
        }}
      >
        Skip for now
      </button>

      {/* Benefit line */}
      <p style={{ fontFamily: dm, fontSize: 12, color: TEXT2, textAlign: 'center', margin: '10px 0 0', lineHeight: 1.5 }}>
        💡 Students who add even one parent typically see <strong style={{ color: GREEN }}>2–4x more opportunities</strong>.
      </p>
    </div>
  );
}