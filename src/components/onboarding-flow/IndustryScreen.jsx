import { useState } from 'react';

const FONT = "'Inter', 'DM Sans', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const INDIGO_LIGHT = 'rgba(109,40,217,0.08)';
const INDIGO_BORDER = 'rgba(109,40,217,0.20)';
const VIOLET = '#7c3aed';
const VIOLET_LIGHT = 'rgba(124,58,237,0.08)';
const VIOLET_BORDER = 'rgba(124,58,237,0.20)';
const PINK = '#ec4899';
const PINK_LIGHT = 'rgba(236,72,153,0.08)';
const PINK_BORDER = 'rgba(236,72,153,0.22)';
const TEAL = '#06b6d4';
const TEAL_LIGHT = 'rgba(6,182,212,0.08)';
const TEAL_BORDER = 'rgba(6,182,212,0.22)';
const TEAL_DARK = '#0891b2';
const CORAL = '#f43f5e';
const CORAL_LIGHT = 'rgba(244,63,94,0.07)';
const CORAL_BORDER = 'rgba(244,63,94,0.22)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';
const CARD = '#ffffff';
const SHADOW = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
// Aliases for backward compat
const BLUE = INDIGO;
const BLUE_LIGHT = INDIGO_LIGHT;
const BLUE_BORDER = INDIGO_BORDER;
const GREEN = TEAL;
const GREEN_LIGHT = TEAL_LIGHT;
const GREEN_BORDER = TEAL_BORDER;

const BUCKETS = [
  {
    key: 'tech',
    emoji: '💻',
    label: 'Tech & Engineering',
    color: INDIGO,
    colorLight: INDIGO_LIGHT,
    colorBorder: INDIGO_BORDER,
    subs: ['Software Engineering', 'Product Management', 'Data Science', 'UX/UI Design', 'Cybersecurity', 'AI/ML'],
  },
  {
    key: 'business',
    emoji: '📊',
    label: 'Business & Finance',
    color: VIOLET,
    colorLight: VIOLET_LIGHT,
    colorBorder: VIOLET_BORDER,
    subs: ['Investment Banking', 'Consulting', 'Private Equity', 'Corporate Finance', 'Accounting', 'Strategy'],
  },
  {
    key: 'marketing',
    emoji: '📣',
    label: 'Marketing & Media',
    color: PINK,
    colorLight: PINK_LIGHT,
    colorBorder: PINK_BORDER,
    subs: ['Social Media', 'Content Creation', 'Product Marketing', 'Brand Strategy', 'PR & Communications', 'Growth Marketing'],
  },
  {
    key: 'healthcare',
    emoji: '🏥',
    label: 'Healthcare & Bio',
    color: TEAL,
    colorLight: TEAL_LIGHT,
    colorBorder: TEAL_BORDER,
    subs: ['Pre-Med / Clinical', 'Biotech Research', 'Health Policy', 'Pharma', 'Nursing', 'Public Health'],
  },
  {
    key: 'law_gov',
    emoji: '⚖️',
    label: 'Law & Government',
    color: '#B45309',
    colorLight: '#FFFBEB',
    colorBorder: '#FDE68A',
    subs: ['Pre-Law', 'Public Policy', 'Government / Civil Service', 'Nonprofit', 'International Relations', 'Politics'],
  },
  {
    key: 'creative',
    emoji: '🎨',
    label: 'Creative & Entertainment',
    color: PINK,
    colorLight: PINK_LIGHT,
    colorBorder: PINK_BORDER,
    subs: ['Film & TV', 'Music Industry', 'Fashion & Retail', 'Sports Business', 'Gaming', 'Architecture & Design'],
  },
];

export default function IndustryScreen({ selectedIndustries, setSelectedIndustries, targetRoles, setTargetRoles, onBack, onNext }) {
  const [expandedBucket, setExpandedBucket] = useState(null);

  const MAX_TOTAL = 3;
  const totalSelected = selectedIndustries.length + targetRoles.length;

  const toggleBucket = (key) => {
    const bucket = BUCKETS.find(b => b.key === key);
    if (selectedIndustries.includes(key)) {
      // Deselect bucket and its subs
      setSelectedIndustries(prev => prev.filter(k => k !== key));
      setTargetRoles(prev => prev.filter(r => !bucket.subs.includes(r)));
      if (expandedBucket === key) setExpandedBucket(null);
    } else {
      if (totalSelected >= MAX_TOTAL) return;
      setSelectedIndustries(prev => [...prev, key]);
      setExpandedBucket(key);
    }
  };

  const toggleSub = (bucketKey, sub) => {
    const bucket = BUCKETS.find(b => b.key === bucketKey);
    if (targetRoles.includes(sub)) {
      setTargetRoles(prev => prev.filter(r => r !== sub));
    } else {
      if (totalSelected >= MAX_TOTAL) return;
      // Auto-select parent bucket if not already
      if (!selectedIndustries.includes(bucketKey)) {
        setSelectedIndustries(prev => [...prev, bucketKey]);
      }
      setTargetRoles(prev => [...prev, sub]);
    }
  };

  const handleBucketClick = (key) => {
    const isSelected = selectedIndustries.includes(key);
    if (isSelected) {
      // Deselect bucket and its subs
      toggleBucket(key);
    } else {
      toggleBucket(key);
    }
  };

  const canContinue = totalSelected > 0;

  return (
    <div style={{ textAlign: 'center', maxWidth: 580, width: '100%' }}>
      {/* Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
        <span style={{ fontSize: 11 }}>🗺️</span>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mapping Your Pipeline</span>
      </div>

      <h1 style={{ fontFamily: FONT, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
        What spaces are you trying to break into?
      </h1>
      <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT2, lineHeight: 1.7, margin: '0 auto 8px', maxWidth: 460 }}>
        Select up to 3 fields. CLiFF will use this to map out the right internal pipelines, alumni connections, and tailored strategies for those exact spaces.
      </p>
      <p style={{ fontFamily: FONT, fontSize: 12, color: totalSelected >= MAX_TOTAL ? '#EA580C' : TEXT3, margin: '0 0 24px', fontWeight: totalSelected >= MAX_TOTAL ? 700 : 400, transition: 'color 0.2s' }}>
        {totalSelected >= MAX_TOTAL ? '✓ Max 3 selected' : `${MAX_TOTAL - totalSelected} selection${MAX_TOTAL - totalSelected !== 1 ? 's' : ''} remaining`}
      </p>

      {/* Bucket Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4, textAlign: 'left' }}>
        {BUCKETS.map(bucket => {
          const isSelected = selectedIndustries.includes(bucket.key);
          const isExpanded = expandedBucket === bucket.key;
          const subsSelected = targetRoles.filter(r => bucket.subs.includes(r));
          const isDisabled = !isSelected && totalSelected >= MAX_TOTAL;

          return (
            <div key={bucket.key} style={{ gridColumn: isExpanded ? '1 / -1' : 'auto' }}>
              {/* Bucket Button */}
              <button
                onClick={() => handleBucketClick(bucket.key)}
                disabled={isDisabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  background: isSelected ? bucket.colorLight : CARD,
                  border: `2px solid ${isSelected ? bucket.color : isDisabled ? '#F1F5F9' : '#E2E8F0'}`,
                  borderRadius: 12, padding: '14px 16px', cursor: isDisabled ? 'not-allowed' : 'pointer',
                  textAlign: 'left', minHeight: 'auto',
                  opacity: isDisabled ? 0.4 : 1,
                  boxShadow: isSelected ? `0 0 0 3px ${bucket.colorBorder}` : SHADOW,
                  transition: 'all 0.18s ease',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{bucket.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: isSelected ? bucket.color : TEXT, margin: 0 }}>{bucket.label}</p>
                  {isSelected && subsSelected.length > 0 && (
                    <p style={{ fontFamily: FONT, fontSize: 10, color: bucket.color, margin: '2px 0 0', opacity: 0.8 }}>{subsSelected.join(', ')}</p>
                  )}
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? bucket.color : '#CBD5E1'}`,
                  background: isSelected ? bucket.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, color: '#fff', fontWeight: 800, transition: 'all 0.18s',
                }}>
                  {isSelected && '✓'}
                </div>
              </button>

              {/* Sub-pills (expand on click) */}
              {isExpanded && isSelected && (
                <div style={{ background: bucket.colorLight, border: `1px solid ${bucket.colorBorder}`, borderRadius: '0 0 12px 12px', borderTop: 'none', padding: '12px 14px', marginTop: -2, animation: 'fadeUp 0.2s ease' }}>
                  <p style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: bucket.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Tap to narrow it down:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {bucket.subs.map(sub => {
                      const isSubSelected = targetRoles.includes(sub);
                      const subDisabled = !isSubSelected && totalSelected >= MAX_TOTAL;
                      return (
                        <button
                          key={sub}
                          onClick={() => toggleSub(bucket.key, sub)}
                          disabled={subDisabled}
                          style={{
                            fontFamily: FONT, fontSize: 12, fontWeight: 600,
                            color: isSubSelected ? '#fff' : bucket.color,
                            background: isSubSelected ? bucket.color : '#fff',
                            border: `1.5px solid ${bucket.colorBorder}`,
                            borderRadius: 100, padding: '6px 14px',
                            cursor: subDisabled ? 'not-allowed' : 'pointer',
                            minHeight: 'auto', opacity: subDisabled ? 0.4 : 1,
                            transition: 'all 0.15s',
                          }}
                        >{sub}</button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mirroring panel — appears after any selection */}
      {canContinue && (
        <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 20, textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
          <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#065F46', margin: '0 0 12px' }}>
            Got it — you're targeting{' '}
            <strong>
              {[...selectedIndustries.map(k => BUCKETS.find(b => b.key === k)?.label), ...targetRoles].filter(Boolean).join(', ')}
            </strong>.
          </p>
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>CLiFF is now prioritizing:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[
              'Alumni & parent insiders in those spaces',
              'Role-specific resume versions and outreach templates',
              'Hidden opportunities most students never see',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 12, color: GREEN, flexShrink: 0, marginTop: 1 }}>•</span>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.5 }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: FONT, fontSize: 13, color: '#059669', margin: '12px 0 0', fontWeight: 700 }}>
            You just gave CLiFF the coordinates it needs to work effectively for you. 🎯
          </p>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        <button onClick={onBack} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, background: CARD, border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', minHeight: 'auto', boxShadow: SHADOW }}>← Back</button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
            background: canContinue ? `linear-gradient(to bottom, ${BLUE}, #0052CC)` : '#CBD5E1',
            border: 'none', borderRadius: 8, padding: '15px 36px',
            cursor: canContinue ? 'pointer' : 'not-allowed', minHeight: 'auto',
            boxShadow: canContinue ? '0 4px 14px rgba(0,102,255,0.25)' : 'none',
            transition: 'all 0.2s',
          }}
        >{canContinue ? <>Continue → <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>Pipeline Mapped ✓</span></> : 'Select at least 1 →'}</button>
      </div>
    </div>
  );
}