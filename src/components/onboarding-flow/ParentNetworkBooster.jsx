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

function ConfirmationScreen({ firstName, parentName, parentCompany, schoolName, onContinue, onAddAnother }) {
  return (
    <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 20, padding: '28px 22px', marginBottom: 28 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Thank You — The Community Just Got Stronger
        </p>
        <h3 style={{ fontFamily: sat, fontSize: 22, fontWeight: 900, color: TEXT, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Your parent's connection has been added.
        </h3>
        <p style={{ fontFamily: dm, fontSize: 14, color: TEXT2, lineHeight: 1.65, margin: 0, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          CLiFF will now surface your parent as a potential warm connection when other students from the same school are looking in matching industries or roles.
          <br /><br />
          This is how we build a stronger, more supportive network for students across all schools — one connection at a time.
        </p>
      </div>

      {/* CTAs */}
      <button
        onClick={onContinue}
        style={{
          width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff',
          background: `linear-gradient(135deg, ${GREEN} 0%, #15803d 100%)`,
          border: 'none', borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
          minHeight: 52, marginBottom: 8,
          boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
        }}
      >
        Continue to My Dashboard →
      </button>
      <button
        onClick={onAddAnother}
        style={{
          width: '100%', fontFamily: dm, fontSize: 14, fontWeight: 500, color: BLUE,
          background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`,
          borderRadius: 12, padding: '12px 20px', cursor: 'pointer', minHeight: 44,
        }}
      >
        Add Another Parent
      </button>
    </div>
  );
}

export default function ParentNetworkBooster({ schoolName = 'University of Florida', firstName, onSkip, onAdd, onContinue }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const canSubmit = name.trim() && company.trim() && relationship;

  const handleAdd = () => {
    if (!canSubmit) return;
    const data = { name, company, jobTitle, email, relationship };
    onAdd?.(data);
    setSubmittedData(data);
    setSubmitted(true);
  };

  const handleAddAnother = () => {
    setName('');
    setCompany('');
    setJobTitle('');
    setEmail('');
    setRelationship('');
    setSubmitted(false);
    setSubmittedData(null);
  };

  if (submitted) {
    return (
      <ConfirmationScreen
        firstName={firstName}
        parentName={submittedData?.name}
        parentCompany={submittedData?.company}
        schoolName={schoolName}
        onContinue={onContinue || onSkip}
        onAddAnother={handleAddAnother}
      />
    );
  }

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: '24px 22px', marginBottom: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#f97316', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🔥</span> Strengthen the Student Community
        </p>
        <h3 style={{ fontFamily: sat, fontSize: 18, fontWeight: 800, color: TEXT, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          Each parent connection strengthens the student community.
        </h3>
        <p style={{ fontFamily: dm, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
          When a parent adds their information, CLiFF simply surfaces them as a potential connection when another student from the same school is looking in a matching industry or role.
          <br /><br />
          It's a simple, powerful way for students to help other students — creating more warm, relevant opportunities across all schools.
        </p>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
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

        {/* Company — highlighted */}
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
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '2px 7px', pointerEvents: 'none' }}>
              High value
            </span>
          )}
        </div>

        {/* Job Title */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Job Title (optional) — e.g. Software Engineer, CFO"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            style={{
              fontFamily: dm, fontSize: 14, color: TEXT,
              background: '#f9fafb', border: `1.5px solid ${jobTitle ? BLUE_BORDER : BORDER}`,
              borderRadius: 10, padding: '12px 14px', outline: 'none', width: '100%', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
          {!jobTitle && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: dm, fontSize: 10, fontWeight: 600, color: BLUE, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 6, padding: '2px 7px', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              Helps CLiFF find better matches
            </span>
          )}
        </div>

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

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={!canSubmit}
        style={{
          width: '100%', fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#fff',
          background: canSubmit ? `linear-gradient(135deg, ${GREEN} 0%, #15803d 100%)` : '#d1d5db',
          border: 'none', borderRadius: 12, padding: '16px 20px', cursor: canSubmit ? 'pointer' : 'not-allowed',
          minHeight: 52, marginBottom: 8, transition: 'all 0.15s',
          boxShadow: canSubmit ? '0 4px 14px rgba(22,163,74,0.35)' : 'none',
        }}
      >
        Add My Parent &amp; Strengthen the Network →
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

      <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0' }}>
        Takes 20 seconds • Completely optional • Your parent will only be shown to relevant students from the same school
      </p>
    </div>
  );
}