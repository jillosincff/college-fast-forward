import React, { useState } from 'react';
import { CATEGORIES } from './AskBox';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const PLACEHOLDERS = {
  networking: "e.g. How do you reach out to someone you've never met without it feeling awkward?",
  career_path: "e.g. Does anyone work in [field] and would be willing to tell me what a normal day actually looks like?",
  first_job: "e.g. What do you wish someone had told you before your first real job?",
  industry: "e.g. Does anyone have connections at companies that work in [space] who might be open to a quick call?",
};

const TIMELINE_OPTIONS = ['Summer 2026', 'Fall 2026', 'Spring 2027', 'Anytime'];

export default function PostQuestionModal({ open, onClose, initialCategory, onSubmit, loading }) {
  const [category, setCategory] = useState(initialCategory || '');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [location, setLocation] = useState('');
  const [timeline, setTimeline] = useState('');

  if (!open) return null;

  const canSubmit = category && question.trim().length >= 10 && !loading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ category, question: question.trim(), context: context.trim(), location: location.trim(), timeline });
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} className="post-modal-card" style={{
        background: '#fff', borderRadius: 20, padding: 32, maxWidth: 560, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a', marginBottom: 6 }}>Ask the Network</h2>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', marginBottom: 24 }}>
          The more specific your question, the better the answer you'll get.
        </p>

        {/* Category selector */}
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 8 }}>
          What kind of help do you need?
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {CATEGORIES.map(cat => {
            const active = category === cat.id;
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
                color: active ? '#E85D20' : '#888',
                background: active ? 'rgba(232,93,32,0.08)' : '#f4f2ee',
                border: `0.5px solid ${active ? 'rgba(232,93,32,0.3)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
                transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
              }}>
                {cat.icon} {cat.label}
              </button>
            );
          })}
        </div>

        {/* Question field */}
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>
          Your question
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <textarea
            value={question}
            onChange={e => { if (e.target.value.length <= 300) setQuestion(e.target.value); }}
            placeholder={PLACEHOLDERS[category] || 'What do you need help with?'}
            rows={4}
            style={{
              width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#1a1a1a',
              lineHeight: 1.6, border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
              padding: '12px 14px', resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          />
          <span style={{
            position: 'absolute', bottom: 8, right: 12,
            fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb',
          }}>{question.length} / 300</span>
        </div>

        {/* Context field */}
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>
          A little more context (optional)
        </label>
        <textarea
          value={context}
          onChange={e => { if (e.target.value.length <= 200) setContext(e.target.value); }}
          placeholder="Your year, major, what you've already tried, what you're hoping to get out of an answer..."
          rows={3}
          style={{
            width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#1a1a1a',
            lineHeight: 1.6, border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
            padding: '12px 14px', resize: 'none', outline: 'none', marginBottom: 16, boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.4)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
        />

        {/* Location + timeline */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Miami, Remote, Anywhere"
            style={{
              flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 8,
              padding: '9px 12px', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <select
            value={timeline}
            onChange={e => setTimeline(e.target.value)}
            style={{
              flex: 1, fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 8,
              padding: '9px 12px', outline: 'none', background: '#fff', boxSizing: 'border-box',
            }}
          >
            <option value="">Timeline...</option>
            {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 500,
          color: '#fff', background: canSubmit ? '#E85D20' : '#ccc',
          borderRadius: 100, padding: 14, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s', minHeight: 'auto', marginBottom: 12,
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Posting...' : 'Post to the Network →'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontFamily: dmSans, fontSize: 13, fontWeight: 400,
            color: '#aaa', cursor: 'pointer', minHeight: 'auto', width: 'auto',
          }}>Cancel</button>
        </div>
      </div>

      <style>{`
        @media(max-width:768px) {
          .post-modal-card { border-radius: 0 !important; max-height: 100vh !important; height: 100vh; padding: 24px !important; }
        }
      `}</style>
    </div>
  );
}