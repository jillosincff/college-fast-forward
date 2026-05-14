import { useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { INDUSTRIES } from '@/components/onboarding/onboardingOptions';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const satoshi = "'Satoshi', 'DM Sans', system-ui, sans-serif";

export default function OnboardingFlow({ onClose }) {
  const [screen, setScreen] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [collegeQuery, setCollegeQuery] = useState('');

  const goNext = () => {
    setScreen(s => s + 1);
  };

  const goToAuth = () => {
    try {
      localStorage.setItem('pending_invite_role', 'student');
      sessionStorage.setItem('cff_onboarding_type', 'student');
      localStorage.setItem('cff_onboarding_questions_pending', 'true');
    } catch (e) {}
    base44.auth.redirectToLogin(window.location.origin + '/#GatorAuth');
  };

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
    try { localStorage.setItem('cff_college', collegeQuery.trim()); } catch (e) {}
    navigate('GatorAuth');
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
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 24, right: 24,
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 40, height: 40, minHeight: 'auto',
          color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >✕</button>

      {/* Progress dots */}
      <div style={{ position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} style={{
            width: i === screen ? 24 : 8, height: 8, borderRadius: 4,
            background: i === screen ? '#22c55e' : i < screen ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Screen 1: Welcome */}
      {screen === 1 && (
        <div style={{ textAlign: 'center', maxWidth: 540, animation: 'fadeSlideIn 0.4s ease' }}>
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Logo / wordmark */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 48,
          }}>
            <span style={{ fontFamily: satoshi, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              College <span style={{ color: '#22c55e' }}>Fast Forward</span>
            </span>
          </div>

          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.04em', margin: '0 0 20px',
          }}>
            Welcome to College<br />Fast Forward.
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 440,
          }}>
            Your job search co-pilot built to learn who you are and get you interviews quickly.
          </p>

          <button
            onClick={goNext}
            style={{
              fontFamily: dmSans, fontSize: 17, fontWeight: 800,
              color: '#fff', background: '#22c55e', border: 'none',
              borderRadius: 14, padding: '18px 52px',
              cursor: 'pointer', minHeight: 'auto',
              boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
              transition: 'all 0.2s ease', display: 'block', margin: '0 auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.4)'; }}
          >
            Continue →
          </button>

          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: '20px 0 0' }}>
            Takes about 2 minutes. No credit card required.
          </p>
        </div>
      )}

      {/* Screen 2: Built by Experts */}
      {screen === 2 && (
        <div style={{ textAlign: 'center', maxWidth: 560, animation: 'fadeSlideIn 0.4s ease' }}>
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Icon cluster */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 40 }}>
            {[
              { emoji: '🎓', label: 'Career Coach' },
              { emoji: '💼', label: 'Recruiter' },
              { emoji: '🏢', label: 'Hiring Manager' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '20px 24px',
              }}>
                <span style={{ fontSize: 32 }}>{item.emoji}</span>
                <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            ))}
          </div>

          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(30px, 6vw, 52px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.04em', margin: '0 0 20px',
          }}>
            Built by Hiring Experts
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 440,
          }}>
            Designed with career coaches and recruiters who know exactly what gets candidates hired.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(1)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}>
              ← Back
            </button>
            <button onClick={goNext} style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 800, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 14, padding: '16px 48px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(34,197,94,0.4)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.4)'; }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Screen 3: Answer Smart Questions */}
      {screen === 3 && (
        <div style={{ textAlign: 'center', maxWidth: 560, animation: 'fadeSlideIn 0.4s ease' }}>

          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 40px',
          }}>
            🧠
          </div>

          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(30px, 6vw, 52px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.04em', margin: '0 0 20px',
          }}>
            Answer Smart Questions
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 460,
          }}>
            College Fast Forward will ask you questions so we can know you better. This helps us find the right jobs for you.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(2)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}>
              ← Back
            </button>
            <button onClick={goNext}
              style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 800, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 14, padding: '16px 48px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(34,197,94,0.4)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.4)'; }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Screen 4: We plan. You approve and apply. */}
      {screen === 4 && (
        <div style={{ textAlign: 'center', maxWidth: 560, animation: 'fadeSlideIn 0.4s ease' }}>

          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 40px',
          }}>
            🚀
          </div>

          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(30px, 6vw, 52px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.04em', margin: '0 0 20px',
          }}>
            We plan. You approve<br />and apply.
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 460,
          }}>
            Review your resume then submit. College Fast Forward's AI Agent finds jobs and applies with personalized messages.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(3)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}>
              ← Back
            </button>
            <button onClick={goNext}
              style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 800, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 14, padding: '16px 48px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(34,197,94,0.4)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.4)'; }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

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

          <p style={{
            fontFamily: dmSans, fontSize: 15,
            color: 'rgba(255,255,255,0.45)', margin: '0 auto 32px',
          }}>
            Select up to 3 categories that interest you.
          </p>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 10,
            justifyContent: 'center', marginBottom: 36,
          }}>
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
                    transition: 'all 0.15s ease',
                    opacity: maxed ? 0.45 : 1,
                  }}
                >
                  {ind.emoji} {ind.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(5)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto' }}>
              ← Back
            </button>
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

          <p style={{
            fontFamily: dmSans, fontSize: 15,
            color: 'rgba(255,255,255,0.45)', margin: '0 auto 32px',
          }}>
            Search for a city or area so we can find jobs nearby.
          </p>

          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: 18, pointerEvents: 'none',
            }}>📍</span>
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

          {/* Remote only toggle */}
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
                fontFamily: dmSans, fontSize: 16, fontWeight: 800,
                color: '#fff',
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

          <p style={{
            fontFamily: dmSans, fontSize: 15,
            color: 'rgba(255,255,255,0.45)', margin: '0 auto 32px', maxWidth: 400,
          }}>
            This helps us find alumni and parents who can make warm intros on your behalf.
          </p>

          <div style={{ position: 'relative', marginBottom: 36 }}>
            <span style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: 18, pointerEvents: 'none',
            }}>🏛️</span>
            <input
              type="text"
              placeholder="e.g. University of Florida, Penn State..."
              value={collegeQuery}
              onChange={e => setCollegeQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: dmSans, fontSize: 16, fontWeight: 500,
                color: '#fff',
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
                fontFamily: dmSans, fontSize: 16, fontWeight: 800,
                color: '#fff',
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

      {/* Screen 5: Track Everything */}
      {screen === 5 && (
        <div style={{ textAlign: 'center', maxWidth: 560, animation: 'fadeSlideIn 0.4s ease' }}>

          {/* Icon */}
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 40px',
          }}>
            📊
          </div>

          <h1 style={{
            fontFamily: satoshi, fontSize: 'clamp(30px, 6vw, 52px)',
            fontWeight: 900, color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.04em', margin: '0 0 20px',
          }}>
            Track Everything
          </h1>

          <p style={{
            fontFamily: dmSans, fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'rgba(255,255,255,0.6)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 460,
          }}>
            Track applications, messages, interviews, and offers automatically.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setScreen(4)} style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '14px 28px', cursor: 'pointer', minHeight: 'auto', transition: 'all 0.15s' }}>
              ← Back
            </button>
            <button onClick={goToAuth}
              style={{ fontFamily: dmSans, fontSize: 17, fontWeight: 800, color: '#fff', background: '#22c55e', border: 'none', borderRadius: 14, padding: '16px 48px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 8px 32px rgba(34,197,94,0.4)', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.4)'; }}
            >
              Get Started →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}