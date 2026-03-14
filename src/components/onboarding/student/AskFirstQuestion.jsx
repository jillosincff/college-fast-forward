import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const CATEGORIES = [
  { id: 'networking', label: 'Networking & Outreach' },
  { id: 'career_path', label: 'Career Path Exploration' },
  { id: 'first_job', label: 'First Job Advice' },
  { id: 'industry', label: 'Industry-Specific' },
];

const INSPIRATION = {
  networking: [
    "How do you reach out to someone you've never met without it feeling weird or desperate?",
    "What's the best way to ask someone for a coffee chat when you have no connection to them?",
    "How do you follow up after sending a message that got no reply?",
  ],
  career_path: [
    "Does anyone work in [field] who'd be willing to tell me what a normal Tuesday actually looks like?",
    "How did you figure out what you actually wanted to do — and how long did it take?",
    "What's the difference between [role A] and [role B] in terms of day-to-day work?",
  ],
  first_job: [
    "What do you wish someone had told you before you started your first real job?",
    "What's one thing that surprised you about working that nobody talks about in college?",
    "How do you handle it when you don't know what you're doing at a new job?",
  ],
  industry: [
    "Does anyone have connections at companies in [industry] who might be open to a quick call?",
    "What skills actually matter in [field] that you don't learn in school?",
    "Is [certification/skill] actually worth getting for someone trying to break into [industry]?",
  ],
};

const PLACEHOLDERS = {
  networking: "e.g. How do you reach out to someone you've never met without it feeling awkward?",
  career_path: "e.g. Does anyone work in [field] and would be willing to tell me what a normal day actually looks like?",
  first_job: "e.g. What do you wish someone had told you before your first real job?",
  industry: "e.g. Does anyone have connections at companies that work in [space] who might be open to a quick call?",
};

export default function AskFirstQuestion({ question, onQuestionChange, category, onCategoryChange, context, onContextChange, location, onLocationChange, timeline, onTimelineChange }) {
  const isStatement = question.length > 10 && !question.trim().endsWith('?');
  const isQuestion = question.trim().endsWith('?');

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 26px)', lineHeight: 1.2, letterSpacing: '-0.01em', marginBottom: 8 }}>
          <span style={{ fontFamily: playfair, fontWeight: 700, color: '#1a1a1a' }}>Ask your first question.</span>
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', lineHeight: 1.6 }}>
          Parents and alumni in this network will answer from real experience. The more specific you are, the better the answer.
        </p>
      </div>

      {/* Category selection */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 10 }}>
          What kind of help do you need? <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              data-chip="true"
              onClick={() => onCategoryChange(cat.id)}
              style={{
                padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                background: category === cat.id ? 'rgba(232,93,32,0.08)' : '#fff',
                color: category === cat.id ? orange : '#555',
                border: `0.5px solid ${category === cat.id ? 'rgba(232,93,32,0.4)' : 'rgba(0,0,0,0.1)'}`,
                transition: 'all 0.2s', minHeight: 'auto',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content after category */}
      {category && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Inspiration chips */}
          <div>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginBottom: 10 }}>
              Here are some questions that get great responses. Tap one to use it:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {INSPIRATION[category]?.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  data-chip="true"
                  onClick={() => onQuestionChange(chip)}
                  style={{
                    textAlign: 'left', fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555',
                    background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12,
                    padding: '12px 16px', cursor: 'pointer', lineHeight: 1.5,
                    transition: 'all 0.2s', minHeight: 'auto', width: '100%',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(232,93,32,0.02)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.background = '#fff'; }}
                >
                  "{chip}"
                </button>
              ))}
            </div>
          </div>

          {/* Question textarea */}
          <div>
            <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
              Your question <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={question}
              onChange={e => { if (e.target.value.length <= 300) onQuestionChange(e.target.value); }}
              placeholder={PLACEHOLDERS[category] || 'What do you need help with?'}
              rows={4}
              style={{
                width: '100%', padding: '12px 16px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
                fontFamily: dmSans, fontSize: 14, fontWeight: 300, resize: 'none', outline: 'none',
                transition: 'border-color 0.2s', lineHeight: 1.6,
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
              maxLength={300}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <div>
                {isStatement && question.length > 10 && (
                  <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: orange, fontStyle: 'italic' }}>
                    Try phrasing this as a question — it gets 3x more responses.
                  </p>
                )}
                {isQuestion && question.length > 10 && (
                  <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#22c55e' }}>
                    ✓ Great — that's a question people can actually answer.
                  </p>
                )}
              </div>
              <span style={{ fontFamily: dmSans, fontSize: 11, color: '#bbb' }}>{question.length} / 300</span>
            </div>
          </div>

          {/* Context */}
          <div>
            <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
              A little more context <span style={{ fontWeight: 300, color: '#94a3b8' }}>(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={e => { if (e.target.value.length <= 200) onContextChange(e.target.value); }}
              placeholder="Your year, major, what you've already tried, what you're hoping to get out of an answer..."
              rows={3}
              style={{
                width: '100%', padding: '12px 16px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
                fontFamily: dmSans, fontSize: 14, fontWeight: 300, resize: 'none', outline: 'none',
                transition: 'border-color 0.2s', lineHeight: 1.6,
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
              maxLength={200}
            />
          </div>

          {/* Location + Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                Where? <span style={{ fontWeight: 300, color: '#94a3b8' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => onLocationChange(e.target.value)}
                placeholder="e.g. Miami, Remote, Anywhere"
                style={{
                  width: '100%', padding: '12px 16px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
                  fontFamily: dmSans, fontSize: 14, fontWeight: 300, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                When? <span style={{ fontWeight: 300, color: '#94a3b8' }}>(optional)</span>
              </label>
              <select
                value={timeline}
                onChange={e => onTimelineChange(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 12,
                  fontFamily: dmSans, fontSize: 14, fontWeight: 300, outline: 'none', background: '#fff',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
              >
                <option value="">Not sure yet</option>
                <option value="summer">Summer 2026</option>
                <option value="next_semester">Fall 2026</option>
                <option value="this_semester">Spring 2027</option>
                <option value="immediate">Anytime</option>
              </select>
            </div>
          </div>

          {/* Info box — orange tinted */}
          <div style={{
            background: 'rgba(232,93,32,0.04)', border: '0.5px solid rgba(232,93,32,0.12)',
            borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="8" cy="8" r="6" stroke={orange} strokeWidth="1.5"/>
                <path d="M8 5v3M8 10v1" stroke={orange} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', margin: 0, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 500, color: '#333' }}>This will be posted</span> to the community feed where parents & alumni can see it.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M11 2L14 5 5 14H2v-3L11 2z" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#555', margin: 0, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 500, color: '#333' }}>You can edit anytime</span> from your dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}