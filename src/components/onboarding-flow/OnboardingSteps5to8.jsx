import IndustryScreen from './IndustryScreen';
import Screen6School from './Screen6School';
import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW, SHADOW_MD, R, BLUE, BLUE_LIGHT, BLUE_BORDER,
  GREEN, GREEN_LIGHT, GREEN_BORDER, CLIFF_SOLVE, Btn, Nav, InputField,
} from './onboardingShared';

/**
 * Onboarding screens 5–8 — extracted verbatim from OnboardingFlow.
 * All state + handlers are passed in as props from the shell. No logic changed.
 */
export default function OnboardingSteps5to8({
  screen, next, back,
  h1style, substyle, card,
  // screen 5 (industry)
  selectedIndustries, setSelectedIndustries, targetRoles, setTargetRoles,
  // screen 6 (what CLIFF should solve first — single select)
  blockers, toggleBlocker, selectBlocker,
  // screen 7 (school)
  college, setCollege, fireReferralMilestone,
  // screen 8 (location)
  locationPref, setLocationPref, locationCity, setLocationCity,
  citySuggestionsClosed, setCitySuggestionsClosed,
}) {
  return (
    <>
      {/* ── SCREEN 5: Industry & Role Picker ── */}
      {screen === 5 && (
        <IndustryScreen
          selectedIndustries={selectedIndustries}
          setSelectedIndustries={setSelectedIndustries}
          targetRoles={targetRoles}
          setTargetRoles={setTargetRoles}
          onBack={back}
          onNext={next}
        />
      )}

      {/* ── SCREEN 6: If CLIFF Could Solve ONE Thing Today ── */}
      {screen === 6 && (() => {
        const selectedKey = blockers[0] || null;
        const selected = CLIFF_SOLVE.find(o => o.key === selectedKey);
        return (
          <div style={{ ...card, maxWidth: 540 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 11 }}>⚡</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#EA580C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your first assignment for CLIFF</span>
            </div>

            <h1 style={h1style}>If CLIFF could solve ONE thing today…</h1>
            <p style={{ ...substyle, marginBottom: 20 }}>Pick what matters most. CLIFF starts there first — the rest follows.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }} className="blocker-card-list">
              {CLIFF_SOLVE.map(opt => {
                const active = selectedKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => selectBlocker(opt.key)}
                    className="onb-option-btn"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                      background: active ? GREEN_LIGHT : CARD,
                      border: `2px solid ${active ? GREEN : '#E2E8F0'}`,
                      borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                      textAlign: 'left', minHeight: 'auto',
                      boxShadow: active
                        ? `0 0 0 3px ${GREEN_BORDER}, 0 8px 20px rgba(6,182,212,0.12)`
                        : '0 4px 12px rgba(0,0,0,0.05)',
                      transform: active ? 'translateY(-1px)' : 'translateY(0)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(6,182,212,0.12)' : BG, borderRadius: 10, border: `1px solid ${active ? GREEN_BORDER : '#E2E8F0'}`, transition: 'all 0.18s' }}>{opt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: active ? '#0E7490' : TEXT, margin: '0 0 3px' }}>{opt.label}</p>
                      <p style={{ fontFamily: FONT, fontSize: 12, color: active ? '#0891b2' : TEXT3, margin: 0, fontStyle: 'italic' }}>{opt.sub}</p>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? GREEN : '#CBD5E1'}`,
                      background: active ? GREEN : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 800,
                      transition: 'all 0.18s ease',
                    }}>
                      {active && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant mirroring */}
            {selected && (
              <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '16px 20px', marginTop: 20, textAlign: 'left', animation: 'fadeUp 0.25s ease', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#0E7490', margin: 0, lineHeight: 1.6 }}>
                  <strong>On it. "{selected.label}" is now my #1 priority.</strong><br />
                  {selected.sub}
                </p>
              </div>
            )}

            <Nav onBack={back} onNext={next} nextDisabled={!selectedKey} />
          </div>
        );
      })()}

      {/* ── SCREEN 7: School (Alumni Advantage) ── */}
      {screen === 7 && (
        <Screen6School
          college={college}
          onCollegeChange={setCollege}
          onBack={back}
          onNext={() => {
            fireReferralMilestone(college);
            next();
          }}
          nextLabel="Continue →"
        />
      )}

      {/* ── SCREEN 8: Work Location ── */}
      {screen === 8 && (() => {
        const TOP_CITIES = ['New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Austin, TX', 'Boston, MA', 'Seattle, WA', 'Washington, DC', 'Miami, FL', 'Atlanta, GA', 'Dallas, TX', 'Denver, CO', 'Philadelphia, PA', 'Houston, TX', 'Charlotte, NC', 'Nashville, TN', 'Minneapolis, MN', 'Portland, OR', 'San Diego, CA', 'Phoenix, AZ'];
        const citySuggestions = !citySuggestionsClosed && locationCity.length >= 2 ? TOP_CITIES.filter(c => c.toLowerCase().includes(locationCity.toLowerCase())).slice(0, 6) : [];
        const isRemote = locationPref === 'remote';
        const isHybrid = locationPref === 'hybrid';
        const hasCity = locationPref === 'city' && locationCity.trim().length > 0;
        const isValid = isRemote || isHybrid || hasCity;

        // Mirroring copy per selection
        const mirrorLabel = isRemote ? 'Remote' : isHybrid ? 'Hybrid / Flexible' : locationCity || 'your target city';
        const mirrorDetails = isRemote
          ? ['Remote-first companies + distributed alumni networks', 'Async-friendly roles and distributed teams', 'Resume adjustments for remote-friendly positioning']
          : isHybrid
          ? ['Mix of remote and in-office opportunities', 'Alumni in flexible companies and hybrid-friendly roles', 'Roadmap tuned for flexible work arrangements']
          : [`Local alumni & parents near ${locationCity || 'your city'}`, `Companies actively hiring in that market`, `Events and networking opportunities in that area`];

        return (
          <div style={{ ...card, maxWidth: 500 }}>
            <div style={{ width: 60, height: 60, borderRadius: 14, background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 24px', boxShadow: SHADOW }}>📍</div>
            <h1 style={h1style}>Where are you aiming to work?</h1>
            <p style={{ ...substyle, marginBottom: 28 }}>
              This helps your Agent prioritize opportunities and connections in the exact places you want to be — whether that's fully remote, a dream city, or hybrid.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left', marginBottom: 4 }}>
              {/* Remote */}
              <button
                onClick={() => setLocationPref('remote')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                  background: isRemote ? BLUE_LIGHT : CARD,
                  border: `2px solid ${isRemote ? BLUE : '#E8EFF6'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                  boxShadow: isRemote ? `0 0 0 3px ${INDIGO_BORDER}, 0 10px 24px rgba(109,40,217,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: isRemote ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!isRemote) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                onMouseLeave={e => { if (!isRemote) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRemote ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isRemote ? BLUE_BORDER : '#E2E8F0'}` }}>🌐</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: isRemote ? BLUE : TEXT, margin: '0 0 2px' }}>Remote 🌐</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 2px' }}>Open to fully remote positions anywhere</p>
                  {isRemote && <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>→ Agent will surface remote-first companies + distributed alumni networks</p>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isRemote ? BLUE : '#CBD5E1'}`, background: isRemote ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{isRemote && '✓'}</div>
              </button>

              {/* Specific city */}
              <button
                onClick={() => setLocationPref('city')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                  background: locationPref === 'city' ? BLUE_LIGHT : CARD,
                  border: `2px solid ${locationPref === 'city' ? BLUE : '#E8EFF6'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                  boxShadow: locationPref === 'city' ? `0 0 0 3px ${INDIGO_BORDER}, 0 10px 24px rgba(109,40,217,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: locationPref === 'city' ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (locationPref !== 'city') { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                onMouseLeave={e => { if (locationPref !== 'city') { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: locationPref === 'city' ? '#fff' : BG, borderRadius: 10, border: `1px solid ${locationPref === 'city' ? BLUE_BORDER : '#E2E8F0'}` }}>🏙️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: locationPref === 'city' ? BLUE : TEXT, margin: '0 0 2px' }}>A specific city 🏙️</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 2px' }}>I have a target location in mind</p>
                  {locationPref === 'city' && <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>→ Agent will focus on local alumni, companies, and events in that city</p>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${locationPref === 'city' ? BLUE : '#CBD5E1'}`, background: locationPref === 'city' ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{locationPref === 'city' && '✓'}</div>
              </button>

              {/* Hybrid */}
              <button
                onClick={() => setLocationPref('hybrid')}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                  background: isHybrid ? BLUE_LIGHT : CARD,
                  border: `2px solid ${isHybrid ? BLUE : '#E8EFF6'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', minHeight: 'auto',
                  boxShadow: isHybrid ? `0 0 0 3px ${INDIGO_BORDER}, 0 10px 24px rgba(109,40,217,0.10)` : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: isHybrid ? 'translateY(-2px)' : 'translateY(0)', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!isHybrid) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = BLUE_BORDER; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
                onMouseLeave={e => { if (!isHybrid) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E8EFF6'; e.currentTarget.style.transform = 'translateY(0)'; }}}
              >
                <span style={{ fontSize: 22, flexShrink: 0, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isHybrid ? '#fff' : BG, borderRadius: 10, border: `1px solid ${isHybrid ? BLUE_BORDER : '#E2E8F0'}` }}>🔀</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: isHybrid ? BLUE : TEXT, margin: '0 0 2px' }}>Hybrid / Flexible</p>
                  <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '0 0 2px' }}>Open to a mix — I want options</p>
                  {isHybrid && <p style={{ fontFamily: FONT, fontSize: 11, color: BLUE, margin: 0, fontStyle: 'italic', animation: 'fadeUp 0.2s ease' }}>→ Agent will build a flexible pipeline across remote and in-person opportunities</p>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isHybrid ? BLUE : '#CBD5E1'}`, background: isHybrid ? BLUE : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>{isHybrid && '✓'}</div>
              </button>
            </div>

            {/* City input */}
            {locationPref === 'city' && (
              <div style={{ position: 'relative', marginTop: 10 }}>
                <InputField placeholder="e.g. New York, NY or Austin, TX..." value={locationCity} onChange={e => { setLocationCity(e.target.value); setCitySuggestionsClosed(false); }} icon="🔍" autoFocus />
                {citySuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: CARD, border: '1px solid #E2E8F0', borderRadius: R, overflow: 'hidden', zIndex: 10, marginTop: 4, boxShadow: SHADOW_MD }}>
                    {citySuggestions.map(c => (
                      <button key={c} onClick={() => { setLocationCity(c); setLocationPref('city'); setCitySuggestionsClosed(true); }} style={{ display: 'block', width: '100%', textAlign: 'left', fontFamily: FONT, fontSize: 14, color: TEXT, background: 'transparent', border: 'none', borderBottom: '1px solid #F1F5F9', padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' }}
                        onMouseEnter={e => e.currentTarget.style.background = BLUE_LIGHT}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >{c}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instant mirroring panel */}
            {isValid && (
              <div style={{ background: GREEN_LIGHT, border: `1px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 16, textAlign: 'left', animation: 'fadeUp 0.25s ease' }}>
                <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#065F46', margin: '0 0 10px' }}>
                  Locked in. I'll focus on <strong>{mirrorLabel}</strong>.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>I'm now lining up:</p>
                {mirrorDetails.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: GREEN, flexShrink: 0 }}>•</span>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0 }}>{item}</p>
                  </div>
                ))}
                <p style={{ fontFamily: FONT, fontSize: 12, color: '#059669', margin: '10px 0 0', fontStyle: 'italic', fontWeight: 600 }}>
                  You're one step closer to opportunities that actually fit your life. 🎯
                </p>
              </div>
            )}

            <Nav onBack={back} onNext={next} nextDisabled={!isValid} />
          </div>
        );
      })()}
    </>
  );
}