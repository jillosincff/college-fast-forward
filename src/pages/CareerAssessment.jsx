import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Home, FileText, Search, Building2, MessageSquare, ChevronLeft } from 'lucide-react';

function TopNav() {
  const NAV = [
    { label: 'Home', icon: Home, page: 'FreeTierDashboard' },
    { label: 'Resume', icon: FileText, page: 'ResumeTailoring' },
    { label: 'Alumni', icon: Search, page: 'FreeTierDashboard?tab=alumni_search' },
    { label: 'Companies', icon: Building2, page: 'FreeTierDashboard?tab=company_intel' },
    { label: 'Messages', icon: MessageSquare, page: 'MyMessages' },
  ];
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, height: 52, position: 'sticky', top: 0, zIndex: 10 }}>
      <button onClick={() => window.history.back()} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: '4px 8px', borderRadius: 6, minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap' }}>
        <ChevronLeft size={14} /> Back
      </button>
      <div style={{ width: 1, height: 20, background: '#E5E5E5', margin: '0 4px' }} />
      {NAV.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.page} onClick={() => navigate(item.page)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: '4px 10px', borderRadius: 6, minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const QUESTIONS = [
  { id: 1, dimension: 'thinking', text: "I prefer to analyze data and facts before making decisions." },
  { id: 2, dimension: 'thinking', text: "I often come up with creative solutions that others haven't considered." },
  { id: 3, dimension: 'thinking', text: "I like to understand how systems work before trying to change them." },
  { id: 4, dimension: 'thinking', text: "I trust my gut instincts as much as hard data." },
  { id: 5, dimension: 'work_style', text: "I do my best work when collaborating closely with others." },
  { id: 6, dimension: 'work_style', text: "I prefer having clear ownership of my own projects." },
  { id: 7, dimension: 'work_style', text: "I energize a room and naturally draw people in." },
  { id: 8, dimension: 'work_style', text: "I recharge by working independently and thinking deeply." },
  { id: 9, dimension: 'motivation', text: "Achieving measurable results is what drives me most." },
  { id: 10, dimension: 'motivation', text: "I'm most motivated when my work makes a difference for others." },
  { id: 11, dimension: 'motivation', text: "I value stability and building something that lasts over chasing big wins." },
  { id: 12, dimension: 'leadership', text: "I naturally take charge and direct others in a group." },
  { id: 13, dimension: 'leadership', text: "I'm better at supporting and empowering others than directing them." },
  { id: 14, dimension: 'leadership', text: "People often come to me for advice or mentorship." },
  { id: 15, dimension: 'risk', text: "I'm energized by building something from nothing." },
  { id: 16, dimension: 'risk', text: "I prefer improving and optimizing existing systems over starting from scratch." },
  { id: 17, dimension: 'risk', text: "I'm comfortable with uncertainty when the potential upside is high." },
  { id: 18, dimension: 'orientation', text: "Understanding people and their motivations fascinates me." },
  { id: 19, dimension: 'orientation', text: "I'm drawn to big ideas, theories, and intellectual challenges." },
  { id: 20, dimension: 'orientation', text: "I get satisfaction from making processes more efficient and organized." },
];

const SCALE_LABELS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

const dimensionColor = (score) =>
  score >= 7 ? '#22C55E' : score >= 4 ? '#F59E0B' : '#E85D20';

export default function CareerAssessment({ onOpenUpgrade: onOpenUpgradeProp }) {
  const { user } = useAuth();
  const onOpenUpgrade = onOpenUpgradeProp || (() => navigate('FreeTierDashboard'));

  const [phase, setPhase] = useState('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [responses, setResponses] = useState({});
  const [archetype, setArchetype] = useState(null);
  const [error, setError] = useState('');

  const isFastIQ = !!(
    user?.fastiq_setup_complete ||
    user?.subscription_status === 'active' ||
    user?.membership_tier === 'fastiq'
  );

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const progress = Math.round((currentQ / QUESTIONS.length) * 100);
  const currentQuestion = QUESTIONS[currentQ];

  const handleAnswer = async (score) => {
    const newResponses = {
      ...responses,
      [currentQuestion.id]: { question: currentQuestion.text, dimension: currentQuestion.dimension, score },
    };
    setResponses(newResponses);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setPhase('generating');
      try {
        console.log('Calling generateCareerArchetype...');
        const res = await base44.functions.invoke('generateCareerArchetype', {
          responses: Object.values(newResponses),
          careerGoals: user?.career_goals,
          major: user?.major,
          name: firstName,
        });
        console.log('Response:', res);
        if (res?.data?.success && res?.data?.archetype) {
          console.log('Archetype data:', res.data.archetype);
          setArchetype(res.data.archetype);
          base44.auth.updateMe({ career_archetype: res.data.archetype?.archetype_name, archetype_completed: true }).catch(() => {}); 
          setPhase('results');
        } else {
            console.error('Archetype generation failed:', res?.data?.error || 'Unknown error');
            setError(res?.data?.error || 'Something went wrong. Please try again.');
            setPhase('assessment');
            setCurrentQ(QUESTIONS.length - 1);
        }
      } catch (e) {
        console.error('Archetype generation error:', e);
        setError('Generation failed. Please try again.');
        setPhase('assessment');
        setCurrentQ(QUESTIONS.length - 1);
      }
    }
  };

  // FastIQ gate
  if (!isFastIQ) {
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>🧠</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>Career Archetype Assessment</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 8px', lineHeight: 1.6 }}>
            Discover your unique career archetype — how you think, what drives you, and which roles you're built for. Inspired by Ray Dalio's PrinciplesYou methodology.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#AAAAAA', margin: '0 0 32px' }}>20 questions · ~10 minutes · Included with FastIQ</p>
          <button onClick={() => onOpenUpgrade()} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Unlock FastIQ →
          </button>
        </div>
      </>
    );
  }

  // Intro
  if (phase === 'intro') {
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 12px' }}>CAREER ARCHETYPE ASSESSMENT</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', lineHeight: 1.2 }}>Who are you, really?</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 40px', lineHeight: 1.6 }}>
            20 questions. 10 minutes. Your unique career archetype — how you think, what drives you, and which roles and environments you'll thrive in. Inspired by Ray Dalio's PrinciplesYou methodology.
          </p>

          <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '28px 32px', marginBottom: 32 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 20px' }}>WHAT YOU'LL DISCOVER</p>
            {[
              { icon: '🎭', label: 'Your unique Career Archetype', desc: 'A custom name and description built just for you' },
              { icon: '⚡', label: 'Your superpowers', desc: 'The strengths that make you stand out' },
              { icon: '🎯', label: 'Ideal roles and environments', desc: "Where you'll do your best work" },
              { icon: '🗺️', label: 'Personalized career advice', desc: 'Specific to your goals and archetype' },
              { icon: '🌟', label: 'Your famous archetype match', desc: 'A well-known person who shares your profile' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: i < 4 ? 16 : 0 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>
              💡 <strong>For best results:</strong> Answer based on how you actually are, not how you wish you were. There are no right or wrong answers — every archetype has unique strengths.
            </p>
          </div>

          <button onClick={() => setPhase('assessment')} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '16px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%' }}>
            Start My Assessment →
          </button>
        </div>
      </>
    );
  }

  // Assessment
  if (phase === 'assessment') {
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
          {/* Progress */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>Question {currentQ + 1} of {QUESTIONS.length}</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#E85D20', margin: 0 }}>{progress}% complete</p>
            </div>
            <div style={{ height: 4, background: '#F0F0F0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#E85D20', borderRadius: 2, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AAAAAA', margin: '0 0 16px' }}>
              {currentQuestion.dimension.replace('_', ' ').toUpperCase()}
            </p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 700, color: '#1A1A1A', margin: 0, lineHeight: 1.3 }}>
              "{currentQuestion.text}"
            </h2>
          </div>

          {/* Scale */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', margin: 0 }}>Strongly Disagree</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', margin: 0 }}>Strongly Agree</p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {SCALE_LABELS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  title={label}
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    border: '2px solid #E0E0E0',
                    background: responses[currentQuestion.id]?.score === value ? '#E85D20' : '#fff',
                    color: responses[currentQuestion.id]?.score === value ? '#fff' : '#1A1A1A',
                    fontSize: 18, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: 'auto', minWidth: 'auto',
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#EF4444', textAlign: 'center', margin: '0 0 16px' }}>{error}</p>}

          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(prev => prev - 1)} style={{ background: 'none', border: 'none', fontSize: 13, color: '#AAAAAA', cursor: 'pointer', display: 'block', margin: '0 auto', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto', minWidth: 'auto' }}>
              ← Previous question
            </button>
          )}
        </div>
      </>
    );
  }

  // Generating
  if (phase === 'generating') {
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(232,93,32,0.2)', borderTop: '4px solid #E85D20', margin: '0 auto 32px', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>Discovering your archetype...</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
            Analyzing your responses across 6 dimensions and building your unique career profile. Takes about 15 seconds.
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  // Results
  if (phase === 'results' && archetype) {
    console.log('Rendering archetype:', archetype);
    return (
      <>
        <TopNav />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

          {/* Hero */}
          <div style={{ background: '#0A0A0A', borderRadius: 20, padding: '40px 36px', marginBottom: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{archetype.archetype_emoji}</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 12px' }}>YOUR CAREER ARCHETYPE</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.2 }}>{archetype.archetype_name}</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 24px', fontStyle: 'italic' }}>{archetype.archetype_tagline}</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.85)', margin: '0 auto', lineHeight: 1.7, maxWidth: 560 }}>{archetype.summary}</p>
          </div>

          {/* 6 Dimensions */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#888', margin: '0 0 16px' }}>YOUR 6 DIMENSIONS</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {archetype.dimensions && Object.entries(archetype.dimensions).length > 0 ? Object.entries(archetype.dimensions).map(([key, dim]) => (
                <div key={key} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{dim.label}</p>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: dimensionColor(dim.score) }}>{dim.score}/10</span>
                  </div>
                  <div style={{ height: 4, background: '#F0F0F0', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${dim.score * 10}%`, background: dimensionColor(dim.score), borderRadius: 2 }} />
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0, lineHeight: 1.5 }}>{dim.description}</p>
                  </div>
                  ))
                  : (
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', gridColumn: '1/-1' }}>Dimensions data not available</p>
                  )}
            </div>
          </div>

          {/* Superpowers + Watch out */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#22C55E', margin: '0 0 14px' }}>⚡ YOUR SUPERPOWERS</p>
              {archetype.superpowers && archetype.superpowers.length > 0 ? archetype.superpowers.map((s, i) => (
                <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: i < archetype.superpowers.length - 1 ? '0 0 10px' : 0, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid rgba(34,197,94,0.4)' }}>{s}</p>
                ))
                : (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>No superpowers data</p>
                ))
            </div>
            <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 14px' }}>⚠️ WATCH OUT FOR</p>
              {archetype.watch_out_for && archetype.watch_out_for.length > 0 ? archetype.watch_out_for.map((w, i) => (
                 <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: i < archetype.watch_out_for.length - 1 ? '0 0 10px' : 0, lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid rgba(232,93,32,0.4)' }}>{w}</p>
              ))
              : (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>No areas to watch out for</p>
              )}
            </div>
          </div>

          {/* Ideal roles + environments */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', margin: '0 0 12px' }}>🎯 ROLES YOU'RE BUILT FOR</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {archetype.ideal_roles && archetype.ideal_roles.length > 0 ? archetype.ideal_roles.map(role => (
                 <span key={role} style={{ background: '#F5F5F5', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#1A1A1A', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{role}</span>
              ))
              : (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>No roles data</p>
              )}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', margin: '0 0 10px' }}>🏢 IDEAL ENVIRONMENTS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {archetype.ideal_environments && archetype.ideal_environments.length > 0 ? archetype.ideal_environments.map(env => (
                 <span key={env} style={{ background: '#EFF6FF', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: '#3B82F6', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{env}</span>
              ))
              : (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>No environments data</p>
              ))
            </div>
          </div>

          {/* Career path insight */}
          <div style={{ background: '#0A0A0A', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 12px' }}>🗺️ YOUR CAREER PATH INSIGHT</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.7 }}>{archetype.career_path_insight}</p>
          </div>

          {/* Famous match */}
          <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', margin: '0 0 10px' }}>🌟 YOUR FAMOUS ARCHETYPE MATCH</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', margin: 0, lineHeight: 1.6 }}>{archetype.famous_archetype}</p>
          </div>

          {/* Advice */}
          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E85D20', margin: '0 0 12px' }}>💬 ADVICE FOR YOU</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', margin: 0, lineHeight: 1.7 }}>{archetype.advice}</p>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('FreeTierDashboard')} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 24px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flex: 1 }}>
              Back to Dashboard →
            </button>
            <button onClick={() => { setPhase('intro'); setCurrentQ(0); setResponses({}); setArchetype(null); }}
              style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 10, padding: '14px 24px', fontSize: 14, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              Retake Assessment
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}