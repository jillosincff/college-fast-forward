import {
  FONT, BG, CARD, TEXT, TEXT2, BLUE, BLUE_LIGHT, BLUE_BORDER, INDIGO_BORDER,
  GREEN_LIGHT, GREEN_BORDER, Nav,
} from './onboardingShared';

const YEARS = [
  { key: 'freshman', label: 'Freshman', emoji: '🌱' },
  { key: 'sophomore', label: 'Sophomore', emoji: '🧭' },
  { key: 'junior', label: 'Junior', emoji: '⚡' },
  { key: 'senior', label: 'Senior', emoji: '🎓' },
  { key: 'grad', label: 'Graduate Student', emoji: '📚' },
  { key: 'recent_grad', label: 'Recent Graduate', emoji: '🚀' },
];

// Feeds Career Intelligence — recruiting timing is different every year.
export default function YearScreen({ yearLevel, setYearLevel, h1style, substyle, onBack, onNext }) {
  return (
    <div style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}>
      <h1 style={h1style}>What year are you in?</h1>
      <p style={{ ...substyle, marginBottom: 24 }}>Recruiting looks different every year — this shapes your whole plan.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, textAlign: 'left' }}>
        {YEARS.map(y => {
          const active = yearLevel === y.key;
          return (
            <button
              key={y.key}
              onClick={() => setYearLevel(y.key)}
              className="onb-option-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: active ? BLUE_LIGHT : CARD,
                border: `2px solid ${active ? BLUE : '#E8EFF6'}`,
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                boxShadow: active ? `0 0 0 3px ${INDIGO_BORDER}, 0 8px 20px rgba(109,40,217,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                transform: active ? 'translateY(-1px)' : 'translateY(0)', transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; } }}
            >
              <span style={{ fontSize: 18, flexShrink: 0, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#fff' : BG, borderRadius: 10, border: `1px solid ${active ? BLUE_BORDER : '#E2E8F0'}` }}>{y.emoji}</span>
              <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: active ? BLUE : TEXT, margin: 0 }}>{y.label}</p>
            </button>
          );
        })}
      </div>

      {yearLevel && (
        <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 12, padding: '14px 18px', marginTop: 16, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
          <p style={{ fontFamily: FONT, fontSize: 14, color: '#065F46', margin: 0, lineHeight: 1.6 }}>
            <strong>Perfect.</strong><br />
            Recruiting looks different every year. I'll adjust your plan accordingly.
          </p>
        </div>
      )}

      <Nav onBack={onBack} onNext={onNext} nextDisabled={!yearLevel} />
    </div>
  );
}