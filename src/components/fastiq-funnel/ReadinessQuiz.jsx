import React, { useState, useEffect, useRef } from 'react';
import { useFunnel } from './FunnelContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';

const FONT_LINK_ID = 'readiness-quiz-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Playfair+Display:ital,wght@0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const playfair = "'Playfair Display', Georgia, serif";
const dmSans = "'DM Sans', system-ui, sans-serif";

/* ── question data ─────────────────────────────────── */
const QUESTIONS = [
  {
    q: 'When do you actually need to figure this out?',
    micro: "No wrong answer. But if you picked 1 or 2, keep going — this matters.",
    opts: [
      { text: "Like... yesterday. I'm already stressed.", score: 0 },
      { text: "Next few months — it's getting real.", score: 1 },
      { text: 'End of the year sometime.', score: 2 },
      { text: "Honestly don't know yet.", score: 3 },
    ],
  },
  {
    q: "How clear are you on what kind of job you're actually going for?",
    micro: "Most students don't know. That's normal. But 'I'll figure it out later' has an expiration date.",
    opts: [
      { text: 'No idea. Like genuinely lost.', score: 0 },
      { text: 'I have a general vibe but nothing specific.', score: 1 },
      { text: "I know the field, not sure about the role.", score: 2 },
      { text: 'I know exactly what I want and where.', score: 3 },
    ],
  },
  {
    q: 'How many jobs or internships have you actually applied to in the last month?',
    micro: 'The average cold application has a 2% response rate. So 10 apps = statistically 0.2 callbacks. The math is not mathing.',
    opts: [
      { text: 'Zero.', score: 0 },
      { text: 'A few (1–5).', score: 1 },
      { text: 'A solid amount (6–15).', score: 2 },
      { text: "I've been going hard (16+).", score: 3 },
    ],
  },
  {
    q: 'How many of those applications actually got back to you?',
    micro: "Getting ghosted isn't personal. It's just what happens when 300 people apply to the same posting and nobody knows who you are.",
    opts: [
      { text: "Haven't applied yet.", score: 0 },
      { text: 'Complete silence.', score: 0 },
      { text: 'One or two replied.', score: 1 },
      { text: 'A few actually responded.', score: 2 },
    ],
  },
  {
    q: 'Have you actually tried reaching out to people on LinkedIn?',
    micro: "Cold LinkedIn DMs get ignored. Messages from someone a mutual connection vouched for? Whole different story.",
    opts: [
      { text: "I have one but it's basically empty.", score: 0 },
      { text: "I've sent messages but nobody replied.", score: 0 },
      { text: "I've had a couple real conversations.", score: 2 },
      { text: "Pretty active and it's actually working.", score: 3 },
    ],
  },
  {
    q: "Do you know anyone — even loosely — who works somewhere you'd actually want to be?",
    micro: '85% of jobs are filled through networking. Not Handshake. Not Indeed. Not your resume. Who knows you.',
    opts: [
      { text: 'Not really, no.', score: 0 },
      { text: 'Maybe like a distant family connection or something.', score: 1 },
      { text: 'Yeah, a couple people.', score: 2 },
      { text: "Yes and I've already talked to them.", score: 3 },
    ],
  },
  {
    q: "Does anyone at a place you'd want to work actually know you exist?",
    micro: "If nobody on the inside knows your name, you're just another PDF in a pile of 300 PDFs. It's not about being good enough — it's about being known.",
    opts: [
      { text: 'Nope.', score: 0 },
      { text: 'Doubt it.', score: 0 },
      { text: 'Possibly through someone I know.', score: 2 },
      { text: 'Yes — I have an actual person there.', score: 3 },
    ],
  },
  {
    q: 'How are you finding opportunities right now?',
    micro: "The jobs on the boards? A lot are already filled. They just have to post them publicly. The real ones move through people.",
    opts: [
      { text: 'Scrolling Indeed and Handshake mostly.', score: 0 },
      { text: 'Career fairs and whatever my school sends.', score: 1 },
      { text: 'Mix of job boards and some people I know.', score: 2 },
      { text: 'Mostly through people who put me on.', score: 3 },
    ],
  },
  {
    q: 'Honestly — how do you feel about your job search right now?',
    micro: "This one doesn't affect your score. We just want to know.",
    isFeeling: true,
    opts: [
      { text: "Anxious. I'm already behind and I don't know what I'm doing.", score: 0, tag: 'anxious' },
      { text: "Kind of numb. I know I should do more but I keep putting it off.", score: 0, tag: 'numb' },
      { text: "Okay-ish. Doing stuff but not sure if it's working.", score: 1, tag: 'okay' },
      { text: "Pretty good. I feel like I have a handle on it.", score: 3, tag: 'good' },
    ],
  },
];

const LETTERS = ['A', 'B', 'C', 'D'];

const TIERS = [
  { max: 25, label: 'The Ghost Applicant', color: '#E85D20', desc: "You're out here sending applications into the void and getting nothing back. That's not bad luck — that's just what cold applications do. You're playing a game that's rigged against you and you don't even know it yet." },
  { max: 50, label: 'The Busy But Stuck', color: '#E8A020', desc: "You're doing things. Checking boxes. Applying places. But something isn't working. You're putting in effort and not seeing results because effort in the wrong direction doesn't get you there." },
  { max: 75, label: 'The Almost There', color: '#88C057', desc: "You're genuinely ahead of most people your age. But there's a gap between knowing people and knowing the right people at the right time. One real intro could close that gap completely." },
  { max: 100, label: 'The Connected One', color: '#4CAF50', desc: "You're doing this right. Seriously. Most people your age have no idea what you've figured out. The question now is whether you're scaling it — because there are Gators everywhere who'd pick up for you." },
];

const INSIGHT_CARDS = [
  { check: (a) => a[3] <= 1, bold: 'About those ghosted applications:', body: "Hiring managers get 200–300 applications per role. They hire the person someone on their team already vouched for. Your resume may never have been seen." },
  { check: (a) => a[5] === 0, bold: 'The Gator network is bigger than you think:', body: "There are UF alumni at virtually every company worth working at. They went to your school. They will respond to you in a way they'd never respond to a stranger — because you're not a stranger. You're a Gator." },
  { check: (a, q9tag) => q9tag === 'anxious' || q9tag === 'numb', bold: "That feeling isn't weakness — it's information:", body: "It means you know something needs to change. The students who end up okay aren't the ones with the best resumes. They're the ones who found their people early enough." },
  { check: (a) => a[1] === 0, bold: "Not knowing what you want isn't a problem:", body: "It means you need conversations, not applications. Talking to people who are actually doing the thing is exactly how you figure out if you want to do it too." },
  { check: (a) => a[7] === 0, bold: 'About those job boards:', body: "Up to 70% of roles are filled before they're ever posted publicly. The listings you're applying to? Many are already decided. The real opportunities move through people." },
  { check: () => true, bold: "Here's the truth about job searching in 2025:", body: "The students getting offers aren't applying harder — they're networking smarter. One warm intro from someone who went to your school is worth 50 cold applications." },
];

/* ── main component ────────────────────────────────── */
export default function ReadinessQuiz() {
  const { onClose } = useFunnel();
  const [qIdx, setQIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [answerIndices, setAnswerIndices] = useState([]); // stores chosen option index per question
  const [phase, setPhase] = useState('quiz'); // quiz | loading | results
  const [loadPct, setLoadPct] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { ensureFonts(); }, []);

  /* select an option */
  const selectOption = (idx) => setSelectedIdx(idx);

  /* advance */
  const advance = () => {
    const updated = [...answerIndices];
    updated[qIdx] = selectedIdx;
    setAnswerIndices(updated);
    base44.analytics.track({ eventName: 'quiz_step_completed', properties: { step: qIdx + 1, option: selectedIdx } });

    if (qIdx < 8) {
      setSelectedIdx(null);
      setQIdx(qIdx + 1);
      setAnimKey((k) => k + 1);
    } else {
      setPhase('loading');
    }
  };

  /* loading bar */
  useEffect(() => {
    if (phase !== 'loading') return;
    let pct = 0;
    const iv = setInterval(() => {
      pct += 2;
      setLoadPct(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(iv);
        setTimeout(() => setPhase('results'), 400);
      }
    }, 30);
    return () => clearInterval(iv);
  }, [phase]);

  /* ── render phases ──────────────────────────────── */
  if (phase === 'loading') return <LoadingScreen pct={loadPct} />;
  if (phase === 'results') return <ResultsScreen answerIndices={answerIndices} />;

  const question = QUESTIONS[qIdx];
  const progressPct = ((qIdx) / 9) * 100;

  return (
    <div style={{ background: '#0d1117', maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px', fontFamily: dmSans }}>
      {/* progress bar */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(244,240,232,0.35)' }}>Calculating your readiness</span>
          <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(244,240,232,0.4)' }}>{qIdx + 1} of 9</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#E85D20', borderRadius: 2, width: `${progressPct}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* question block */}
      <QuestionBlock key={animKey} question={question} qIdx={qIdx} selectedIdx={selectedIdx} onSelect={selectOption} onNext={advance} />
    </div>
  );
}

/* ── question block (animated) ────────────────────── */
function QuestionBlock({ question, qIdx, selectedIdx, onSelect, onNext }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setVis(false);
    const id = requestAnimationFrame(() => setVis(true));
    return () => cancelAnimationFrame(id);
  }, [qIdx]);

  const fadeUp = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
  });

  return (
    <div>
      {/* eyebrow */}
      <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20', marginBottom: 14, ...fadeUp(0) }}>
        Question {qIdx + 1}
      </div>

      {/* question text */}
      <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 4vw, 28px)', color: '#f4f0e8', lineHeight: 1.25, letterSpacing: '-0.01em', marginBottom: 10, ...fadeUp(0.02) }}>
        {question.q}
      </h3>

      {/* micro-copy */}
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, fontStyle: 'italic', color: 'rgba(244,240,232,0.4)', lineHeight: 1.6, marginBottom: 32, ...fadeUp(0.04) }}>
        {question.micro}
      </p>

      {/* options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...fadeUp(0.06) }}>
        {question.opts.map((opt, i) => {
          const isSelected = selectedIdx === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: isSelected ? 'rgba(232,93,32,0.12)' : 'rgba(255,255,255,0.04)',
                border: isSelected ? '0.5px solid rgba(232,93,32,0.5)' : '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                padding: '18px 20px',
                fontFamily: dmSans,
                fontSize: 15,
                fontWeight: 400,
                color: isSelected ? '#f4f0e8' : 'rgba(244,240,232,0.8)',
                lineHeight: 1.4,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                minHeight: 'auto',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = '#f4f0e8';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(244,240,232,0.8)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {/* letter badge */}
              <span style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                background: isSelected ? '#E85D20' : 'rgba(255,255,255,0.06)',
                color: isSelected ? '#fff' : 'rgba(244,240,232,0.4)',
              }}>
                {LETTERS[i]}
              </span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* next button */}
      <div style={{
        marginTop: 20,
        opacity: selectedIdx !== null ? 1 : 0,
        pointerEvents: selectedIdx !== null ? 'all' : 'none',
        transform: selectedIdx !== null ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}>
        <button
          onClick={onNext}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#d44e14'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#E85D20'; e.currentTarget.style.transform = 'translateY(0)'; }}
          style={{
            width: '100%', padding: 16, borderRadius: 100, border: 'none',
            background: '#E85D20', color: '#fff', fontFamily: dmSans, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s ease', minHeight: 'auto',
          }}
        >
          {qIdx < 8 ? 'Next →' : 'See my results →'}
        </button>
      </div>
    </div>
  );
}

/* ── loading screen ───────────────────────────────── */
function LoadingScreen({ pct }) {
  return (
    <div style={{ background: '#0d1117', padding: '80px 24px', textAlign: 'center' }}>
      <p style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', fontSize: 22, color: 'rgba(244,240,232,0.7)', marginBottom: 32 }}>
        Okay. Here's where you actually stand...
      </p>
      <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#E85D20', borderRadius: 2, width: `${pct}%`, transition: 'width 0.05s linear' }} />
      </div>
    </div>
  );
}

/* ── results screen ───────────────────────────────── */
function ResultsScreen({ answerIndices }) {
  const [vis, setVis] = useState(false);
  const [displayPct, setDisplayPct] = useState(0);
  const countRef = useRef(null);

  // compute score (Q1–Q8 only)
  const totalScore = answerIndices.slice(0, 8).reduce((sum, optIdx, qI) => sum + (QUESTIONS[qI].opts[optIdx]?.score || 0), 0);
  const pct = Math.round((totalScore / 24) * 100);
  const tier = TIERS.find((t) => pct <= t.max) || TIERS[3];

  // Q9 tag
  const q9Opt = QUESTIONS[8].opts[answerIndices[8]];
  const q9Tag = q9Opt?.tag || 'okay';

  // insight cards (max 3)
  const insights = [];
  for (const card of INSIGHT_CARDS) {
    if (insights.length >= 3) break;
    if (card.check(answerIndices, q9Tag)) insights.push(card);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setVis(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // count-up animation
  useEffect(() => {
    let n = 0;
    countRef.current = setInterval(() => {
      n += 1;
      if (n > pct) { clearInterval(countRef.current); setDisplayPct(pct); return; }
      setDisplayPct(n);
    }, 20);
    return () => clearInterval(countRef.current);
  }, [pct]);

  const fadeUp = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
  });

  const circumference = 440;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ background: '#0d1117', maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px', fontFamily: dmSans, textAlign: 'center' }}>

      {/* eyebrow */}
      <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E85D20', marginBottom: 16, ...fadeUp(0) }}>
        Your job search reality check
      </div>

      {/* score circle */}
      <div style={{ position: 'relative', width: 160, height: 160, margin: '0 auto 24px', ...fadeUp(0.05) }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke={tier.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 42, color: '#f4f0e8', lineHeight: 1 }}>{displayPct}</span>
          <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, textTransform: 'uppercase', color: 'rgba(244,240,232,0.4)', marginTop: 2 }}>ready</span>
        </div>
      </div>

      {/* tier label */}
      <div style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#E85D20', marginBottom: 8, ...fadeUp(0.1) }}>
        {tier.label}
      </div>

      {/* tier description */}
      <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(244,240,232,0.6)', lineHeight: 1.65, maxWidth: 500, margin: '0 auto 36px', ...fadeUp(0.15) }}>
        {tier.desc}
      </p>

      {/* insight cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40, textAlign: 'left' }}>
        {insights.map((card, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderLeft: '2px solid #E85D20',
              borderRadius: '0 14px 14px 0',
              padding: 20,
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 300,
              color: 'rgba(244,240,232,0.7)',
              lineHeight: 1.7,
              ...fadeUp(0.2 + i * 0.08),
            }}
          >
            <strong style={{ fontWeight: 500, color: '#f4f0e8' }}>{card.bold}</strong>{' '}
            {card.body}
          </div>
        ))}
      </div>

      {/* paywall */}
      <PaywallBlock fadeUp={fadeUp} />
    </div>
  );
}

/* ── paywall block ────────────────────────────────── */
function PaywallBlock({ fadeUp }) {
  const handleCTA = (plan) => {
    base44.analytics.track({ eventName: 'quiz_paywall_click', properties: { plan } });
    navigate('GatorAuth');
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '36px 32px',
        marginBottom: 28,
        textAlign: 'left',
        ...fadeUp(0.4),
      }}
    >
      {/* headline */}
      <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 24, color: '#f4f0e8', lineHeight: 1.3, marginBottom: 16 }}>
        Here's what nobody tells you.<br />
        <span style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>The kids who "just got lucky" didn't get lucky.</span>
      </h3>

      {/* body */}
      <div style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 300, color: 'rgba(244,240,232,0.6)', lineHeight: 1.75, marginBottom: 28 }}>
        <p style={{ margin: '0 0 14px' }}>
          They got introduced. <b style={{ fontWeight: 400, color: 'rgba(244,240,232,0.9)' }}>Someone's parent knew someone.</b> Someone's alumni connection made a call. Someone got a reply because the person recognized the school and decided to help.
        </p>
        <p style={{ margin: '0 0 14px' }}>
          That's not luck. <b style={{ fontWeight: 400, color: 'rgba(244,240,232,0.9)' }}>That's access.</b> And until now, you either had it or you didn't.
        </p>
        <p style={{ margin: '0 0 14px' }}>
          <b style={{ fontWeight: 400, color: 'rgba(244,240,232,0.9)' }}>College Fast Forward gives every UF student that access</b> — a community of parents and alumni who've pledged to help, plus an AI that finds the right ones at the right companies and gets you in the room.
        </p>
        <p style={{ margin: 0 }}>
          You don't need to know exactly what you want yet. You just need to <b style={{ fontWeight: 400, color: 'rgba(244,240,232,0.9)' }}>start having the right conversations.</b>
        </p>
      </div>

      {/* CTA grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {/* network */}
        <button
          onClick={() => handleCTA('network')}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '0.5px solid rgba(255,255,255,0.15)',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center',
            minHeight: 'auto',
            width: '100%',
          }}
        >
          <div><span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 18, color: '#f4f0e8' }}>$9</span><span style={{ fontFamily: dmSans, fontWeight: 300, fontSize: 13, color: 'rgba(244,240,232,0.5)' }}>/mo</span></div>
          <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#f4f0e8', marginTop: 4 }}>Get Connected</div>
          <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.55)', marginTop: 2 }}>Join the parent & alumni network</div>
        </button>

        {/* fastiq */}
        <button
          onClick={() => handleCTA('fastiq')}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#d44e14'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#E85D20'; e.currentTarget.style.transform = 'translateY(0)'; }}
          style={{
            background: '#E85D20',
            border: 'none',
            borderRadius: 14,
            padding: '16px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center',
            minHeight: 'auto',
            width: '100%',
          }}
        >
          <div><span style={{ fontFamily: playfair, fontWeight: 700, fontSize: 18, color: '#fff' }}>$29</span><span style={{ fontFamily: dmSans, fontWeight: 300, fontSize: 13, color: 'rgba(244,240,232,0.55)' }}>/mo</span></div>
          <div style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff', marginTop: 4 }}>Unlock FASTIQ</div>
          <div style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: 'rgba(244,240,232,0.55)', marginTop: 2 }}>Network + AI career engine 24/7</div>
        </button>
      </div>

      {/* fine print */}
      <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
        Cancel anytime. No contracts. Most students get their first warm intro within 48 hours.
      </p>
    </div>
  );
}