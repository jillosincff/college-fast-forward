import React, { useState, useEffect } from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const INDUSTRIES = ['Marketing', 'Finance', 'Tech', 'Healthcare', 'Law', 'Consulting', 'Media', 'Real Estate', 'Other'];
const MAX_CHARS = 500;

export default function RequestModal({ request, onClose, onSubmit }) {
  const isEdit = !!request;
  const [text, setText] = useState('');
  const [industry, setIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setText(request.description || request.questionText || '');
      setIndustry(request.industry || request.target_industry || '');
    }
  }, [request]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    await onSubmit({
      description: text.trim(),
      industry: industry || undefined,
    }, request);
    setSubmitting(false);
    onClose();
  };

  const pillStyle = (active) => ({
    fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
    color: active ? '#fff' : '#888',
    background: active ? '#E85D20' : 'rgba(0,0,0,0.04)',
    border: `0.5px solid ${active ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
    transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
  });

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, padding: 32, maxWidth: 520, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 20 }}>
          {isEdit ? 'Edit Your Request' : 'Ask the Network'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Question */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>What do you need help with?</label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={text}
                onChange={e => { if (e.target.value.length <= MAX_CHARS) setText(e.target.value); }}
                rows={5}
                placeholder="Be specific — the more detail you share, the better the responses you'll get. E.g. 'I'm a junior marketing student trying to decide between brand marketing and digital marketing. What's the difference in day-to-day work?'"
                style={{
                  width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#1a1a1a',
                  lineHeight: 1.6, border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10,
                  padding: '10px 14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical',
                }}
              />
              <span style={{
                position: 'absolute', bottom: 8, right: 12,
                fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb',
              }}>{text.length} / {MAX_CHARS}</span>
            </div>
          </div>

          {/* Industry */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>What industry is this about? <span style={{ fontWeight: 300 }}>(optional)</span></label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => setIndustry(industry === ind ? '' : ind)} style={pillStyle(industry === ind)}>{ind}</button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            background: 'rgba(232,93,32,0.04)', border: '0.5px solid rgba(232,93,32,0.1)',
            borderRadius: 10, padding: '12px 14px',
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', lineHeight: 1.6, margin: 0 }}>
              💡 <span style={{ fontWeight: 500, color: '#555' }}>Tip:</span> Questions that mention your major, year, and specific goal get 3x more responses. Be real — the network responds to honesty.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!text.trim() || submitting} style={{
          width: '100%', marginTop: 20, background: text.trim() ? '#E85D20' : '#ccc', color: '#fff',
          fontFamily: dmSans, fontSize: 14, fontWeight: 500, borderRadius: 100,
          padding: '12px 24px', border: 'none', cursor: text.trim() ? 'pointer' : 'default',
          transition: 'background 0.2s', minHeight: 'auto', opacity: submitting ? 0.6 : 1,
        }}
          onMouseEnter={e => { if (text.trim()) e.currentTarget.style.background = '#d44e14'; }}
          onMouseLeave={e => { if (text.trim()) e.currentTarget.style.background = '#E85D20'; }}
        >
          {submitting ? 'Posting...' : isEdit ? 'Save Changes →' : 'Post to the Network →'}
        </button>
        <button onClick={onClose} style={{
          display: 'block', margin: '12px auto 0', background: 'none', border: 'none',
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
          cursor: 'pointer', minHeight: 'auto', width: 'auto',
        }}>Cancel</button>
      </div>
    </div>
  );
}