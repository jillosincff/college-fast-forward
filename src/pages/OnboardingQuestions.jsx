import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { INDUSTRIES } from '@/components/onboarding/onboardingOptions';
import { useAuth } from '@/lib/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";
const satoshi = "'Satoshi', 'DM Sans', system-ui, sans-serif";

export default function OnboardingQuestions() {
  const { user } = useAuth();
  const [screen, setScreen] = useState(6);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cff_job_categories') || '[]'); } catch { return []; }
  });
  const [locationQuery, setLocationQuery] = useState(() => {
    try { return localStorage.getItem('cff_job_location') || ''; } catch { return ''; }
  });
  const [remoteOnly, setRemoteOnly] = useState(() => {
    try { return localStorage.getItem('cff_remote_only') === 'true'; } catch { return false; }
  });
  const [collegeQuery, setCollegeQuery] = useState(() => {
    try { return localStorage.getItem('cff_college') || ''; } catch { return ''; }
  });

  const toggleCategory = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const submitCategories = () => {
    try { localStorage.setItem('cff_job_categories', JSON.stringify(selectedCategories)); } catch (e) {}
    setScreen(7);
  };

  const submitLocation = () => {
    try {
      localStorage.setItem('cff_job_location', remoteOnly ? 'remote' : locationQuery.trim());
      localStorage.setItem('cff_remote_only', remoteOnly ? 'true' : 'false');
    } catch (e) {}
    setScreen(8);
  };

  const submitCollege = () => {
    try {
      localStorage.setItem('cff_college', collegeQuery.trim());
      localStorage.removeItem('cff_onboarding_questions_pending');
    } catch (e) {}
    // Now continue to regular student onboarding
    navigate('StudentOnboarding');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: '#06070d',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: dmSans,
    }}>
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Progress dots */}
      <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {[6, 7, 8].map(i => (
          <div key={i} style={{
            width: i === screen ? 24 : 8, height: 8, borderRadius: 4,
            background: i === screen ? '#22c55e' : i < screen ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Screen 6: Job Category Selector */}
      {screen === 6 && (
        <div style={{ textAlign: 'center', maxWidth: 600, animation: 'fadeSlideIn 0.4s ease' }}>
          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.1,
            letterSpacing: '-0.04em', margin: '0 0 10px',
          }}>
            What kind of job are you looking for?
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 auto 32px' }}>
            Select up to 3 categories that interest you.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 36 }}>
            {INDUSTRIES.map((ind) => {
              const selected = selectedCategories.includes(ind.id);
              const maxed = selectedCategories.length >= 3 && !selected;
              return (
                <button
                  key={ind.id}
                  onClick={() => toggleCategory(ind.id)}
                  disabled={maxed}
                  style={{
                    fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                    color: selected ? '#fff' : maxed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
                    background: selected ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selected ? 'rgba(34,197,94,0.55)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 12, padding: '12px 18px',
                    cursor: maxed ? 'default' : 'pointer', minHeight: 'auto',
                    transition: 'all 0.15s ease', opacity: maxed ? 0.45 : 1,
                  }}
                >
                  {ind.emoji} {ind.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={submitCategories}
            disabled={selectedCategories.length === 0}
            style={{
              fontFamily: dmSans, fontSize: 16, fontWeight: 800,
              color: '#fff', background: selectedCategories.length > 0 ? '#22c55e' : 'rgba(255,255,255,0.1)',
              border: 'none', borderRadius: 14, padding: '14px 40px',
              cursor: selectedCategories.length > 0 ? 'pointer' : 'default', minHeight: 'auto',
              boxShadow: selectedCategories.length > 0 ? '0 8px 32px rgba(34,197,94,0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Continue → {selectedCategories.length > 0 ? `(${selectedCategories.length} selected)` : ''}
          </button>
        </div>
      )}

      {/* Screen 7: Location */}
      {screen === 7 && (
        <div style={{ textAlign: 'center', maxWidth: 520, animation: 'fadeSlideIn 0.4s ease' }}>
          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.1,
            letterSpacing: '-0.04em', margin: '0 0 10px',
          }}>
            Where do you want to work?
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 auto 32px' }}>
            Search for a city or area so we can find jobs nearby.
          </p>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>📍</span>
            <input
              type="text"
              placeholder="e.g. New York, Austin, Chicago..."
              value={remoteOnly ? '' : locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              disabled={remoteOnly}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: dmSans, fontSize: 16, fontWeight: 500,
                color: remoteOnly ? 'rgba(255,255,255,0.25)' : '#fff',
                background: remoteOnly ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${remoteOnly ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)'}`,
                borderRadius: 14, padding: '16px 16px 16px 48px',
                outline: 'none', transition: 'all 0.15s',
              }}
              onFocus={e => { if (!remoteOnly) e.target.style.borderColor = 'rgba(34,197,94,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = remoteOnly ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)'; }}
            />
          </div>
          <button
            onClick={() => { setRemoteOnly(r => !r); setLocationQuery(''); }}
            style={{
              width: '100%', boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: dmSans, fontSize: 15, fontWeight: 600,
              color: remoteOnly ? '#fff' : 'rgba(255,255,255,0.65)',
              background: remoteOnly ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${remoteOnly ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 14, padding: '16px 20px',
              cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.2s ease', marginBottom: 36,
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: remoteOnly ? '#22c55e' : 'rgba(255,255,255,0.1)',
              border: `2px solid ${remoteOnly ? '#22c55e' : 'rgba(255,255,255,0.25)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, transition: 'all 0.15s',
            }}>
              {remoteOnly ? '✓' : ''}
            </span>
            🌐 I only want remote jobs
          </button>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(6)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto' }}>
              ← Back
            </button>
            <button
              onClick={submitLocation}
              disabled={!remoteOnly && locationQuery.trim().length === 0}
              style={{
                fontFamily: dmSans, fontSize: 16, fontWeight: 800, color: '#fff',
                background: (remoteOnly || locationQuery.trim().length > 0) ? '#22c55e' : 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: 14, padding: '14px 40px',
                cursor: (remoteOnly || locationQuery.trim().length > 0) ? 'pointer' : 'default', minHeight: 'auto',
                boxShadow: (remoteOnly || locationQuery.trim().length > 0) ? '0 8px 32px rgba(34,197,94,0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Screen 8: College */}
      {screen === 8 && (
        <div style={{ textAlign: 'center', maxWidth: 520, animation: 'fadeSlideIn 0.4s ease' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 28px',
          }}>🎓</div>
          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.1,
            letterSpacing: '-0.04em', margin: '0 0 10px',
          }}>
            Where do (or did) you go to college?
          </h1>
          <p style={{ fontFamily: dmSans, fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 auto 32px', maxWidth: 400 }}>
            This helps us find alumni and parents who can make warm intros on your behalf.
          </p>
          <div style={{ position: 'relative', marginBottom: 36 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🏛️</span>
            <input
              type="text"
              placeholder="e.g. University of Florida, Penn State..."
              value={collegeQuery}
              onChange={e => setCollegeQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: dmSans, fontSize: 16, fontWeight: 500, color: '#fff',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 14, padding: '16px 16px 16px 48px',
                outline: 'none', transition: 'all 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(34,197,94,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(7)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto' }}>
              ← Back
            </button>
            <button
              onClick={submitCollege}
              disabled={collegeQuery.trim().length === 0}
              style={{
                fontFamily: dmSans, fontSize: 16, fontWeight: 800, color: '#fff',
                background: collegeQuery.trim().length > 0 ? '#22c55e' : 'rgba(255,255,255,0.1)',
                border: 'none', borderRadius: 14, padding: '14px 40px',
                cursor: collegeQuery.trim().length > 0 ? 'pointer' : 'default', minHeight: 'auto',
                boxShadow: collegeQuery.trim().length > 0 ? '0 8px 32px rgba(34,197,94,0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Let's Go →
            </button>
          </div>
          <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 20 }}>
            You can always update this later in your profile.
          </p>
        </div>
      )}
    </div>
  );
}

OnboardingQuestions.isPublic = false;