import IndustryScreen from './IndustryScreen';
import Screen6School from './Screen6School';
import {
  FONT, BG, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_BORDER,
  GRAD_INDIGO, SHADOW, SHADOW_MD, R, BLUE, BLUE_LIGHT, BLUE_BORDER,
  GREEN, GREEN_LIGHT, GREEN_BORDER, BLOCKERS, Btn, Nav, InputField,
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
  // screen 6 (blockers)
  blockers, toggleBlocker,
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

      {/* ── SCREEN 6: What's Holding You Back ── */}
      {screen === 6 && (() => {
        const activeBlocker = BLOCKERS.find(b => blockers[blockers.length - 1] === b.key);
        const dynamicHint = activeBlocker ? `✦ We'll unlock your ${activeBlocker.tool} based on this.` : null;
        const [limitToast, setLimitToast] = [false, () => {}]; // placeholder to avoid useState inside IIFE

        const handleBlockerClick = (key) => {
          const active = blockers.includes(key);
          if (!active && blockers.length >= 2) {
            // show toast by setting a temp DOM message
            const el = document.getElementById('blocker-limit-toast');
            if (el) { el.style.opacity = '1'; setTimeout(() => { el.style.opacity = '0'; }, 2200); }
            return;
          }
          toggleBlocker(key);
        };

        return (
          <div style={{ ...card, maxWidth: 540 }}>
            {/* Limit toast */}
            <div id="blocker-limit-toast" style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', color: '#fff', fontFamily: FONT, fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.18)', zIndex: 20000, opacity: 0, transition: 'opacity 0.25s ease, transform 0.25s ease', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              Focusing on your top 2 priorities ensures the fastest results.
            </div>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 11 }}>🩺</span>
              <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: '#EA580C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Career Diagnostic</span>
            </div>

            <h1 style={h1style}>What's the biggest thing holding you back right now?</h1>
            <p style={{ ...substyle, marginBottom: 20 }}>Select up to 2. Be honest — <strong style={{ color: TEXT }}>Your agent</strong> will instantly unlock the exact tools to crush these roadblocks.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }} className="blocker-card-list">
               {BLOCKERS.map(opt => {
                const active = blockers.includes(opt.key);
                const maxed = blockers.length >= 2 && !active;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleBlockerClick(opt.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                      background: active ? GREEN_LIGHT : CARD,
                      border: `2px solid ${active ? GREEN : maxed ? '#F1F5F9' : '#E2E8F0'}`,
                      borderRadius: 14, padding: '16px 18px', cursor: maxed ? 'default' : 'pointer',
                      textAlign: 'left', minHeight: 'auto',
                      boxShadow: active
                        ? `0 0 0 3px ${GREEN_BORDER}, 0 8px 20px rgba(16,185,129,0.12)`
                        : maxed ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                      opacity: maxed ? 0.45 : 1,
                      transform: active ? 'translateY(-1px)' : 'translateY(0)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { if (!active && !maxed) { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#CBD5E1'; } }}
                    onMouseLeave={e => { if (!active && !maxed) { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#E2E8F0'; } }}
                  >
                    {/* Icon box */}
                    <span style={{
                      fontSize: 20, flexShrink: 0, width: 42, height: 42,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? 'rgba(16,185,129,0.12)' : BG,
                      borderRadius: 10, border: `1px solid ${active ? GREEN_BORDER : '#E2E8F0'}`,
                      filter: maxed ? 'grayscale(1)' : 'none',
                      transition: 'all 0.18s',
                    }}>{opt.icon}</span>

                    {/* Text block */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: active ? '#065F46' : TEXT, margin: '0 0 3px' }}>{opt.label}</p>
                      <p style={{ fontFamily: FONT, fontSize: 12, color: active ? '#059669' : TEXT3, margin: 0, fontStyle: 'italic' }}>{opt.solution}</p>
                    </div>

                    {/* Animated checkmark circle */}
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${active ? GREEN : '#CBD5E1'}`,
                      background: active ? GREEN : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#fff', fontWeight: 800,
                      transition: 'all 0.18s ease',
                      boxShadow: active ? '0 2px 8px rgba(16,185,129,0.35)' : 'none',
                    }}>
                      {active && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instant mirroring unlock panel */}
            {blockers.length > 0 && (
              <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 20, animation: 'fadeUp 0.25s ease' }}>
                <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: '#065F46', margin: '0 0 6px' }}>Got it.</p>
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: '0 0 12px', lineHeight: 1.6 }}>
                  You're dealing with{' '}
                  {blockers.map((key, idx) => {
                    const b = BLOCKERS.find(x => x.key === key);
                    return <span key={key}>{idx > 0 ? ' and ' : ''}<strong>"{b?.label}"</strong></span>;
                  })}.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
                  Your agent is already unlocking:
                </p>
                {blockers.map(key => {
                  const b = BLOCKERS.find(x => x.key === key);
                  if (!b) return null;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, flexShrink: 0 }}>{b.icon}</span>
                      <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.5 }}>
                        <strong>{b.tool}</strong>
                        <span style={{ display: 'inline-block', marginLeft: 8, fontFamily: FONT, fontSize: 10, fontWeight: 700, color: GREEN, background: '#fff', border: `1px solid ${GREEN_BORDER}`, borderRadius: 6, padding: '2px 8px' }}>✓ Unlocked</span>
                      </p>
                    </div>
                  );
                })}
                <p style={{ fontFamily: FONT, fontSize: 13, color: '#065F46', margin: '10px 0 0', lineHeight: 1.6, fontWeight: 600 }}>
                  You're now ahead of most students who never diagnose their biggest leaks. Let's fix this.
                </p>
              </div>
            )}

            {/* Continue button */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
              <Btn primary={false} onClick={back} small>← Back</Btn>
              <button
                onClick={next}
                disabled={blockers.length === 0}
                style={{
                  fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
                  background: blockers.length === 0 ? '#CBD5E1' : GRAD_INDIGO,
                  border: 'none', borderRadius: 8, padding: '15px 36px',
                  cursor: blockers.length === 0 ? 'not-allowed' : 'pointer',
                  minHeight: 'auto',
                  boxShadow: blockers.length === 0 ? 'none' : '0 4px 14px rgba(109,40,217,0.30)',
                  transition: 'all 0.25s ease',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
                onMouseEnter={e => { if (blockers.length > 0) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(109,40,217,0.40)'; }}}
                onMouseLeave={e => { if (blockers.length > 0) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,40,217,0.30)'; }}}
              >
                {blockers.length === 0 ? 'Select at least 1 →' : <>Continue → <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>Tools unlocked ✓</span></>}
              </button>
            </div>
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
                  Got it — you're targeting <strong>{mirrorLabel}</strong>.
                </p>
                <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Your Agent is now:</p>
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