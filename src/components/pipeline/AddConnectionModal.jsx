import React, { useState } from 'react';
import { dmSans, playfair, STAGES } from './PipelineConstants';

const SOURCES = [
  { key: 'top_match', label: 'Top Match' },
  { key: 'strong_match', label: 'Strong Match' },
  { key: 'fastiq', label: 'FASTIQ' },
  { key: 'community', label: 'Community' },
  { key: 'manual', label: 'Manual' },
];

export default function AddConnectionModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', roleCompany: '', source: 'manual', stage: 'matched', notes: '' });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const parts = (form.roleCompany || '').split('·').map(s => s.trim());
    onSubmit({
      alumni_name: form.name.trim(),
      alumni_role: parts[0] || '',
      company: parts[1] || parts[0] || '',
      alumni_source: form.source,
      status: form.stage,
      notes: form.notes,
      status_date: new Date().toISOString(),
      identified_date: new Date().toISOString(),
    });
    onClose();
  };

  const pillStyle = (active) => ({
    fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
    color: active ? '#fff' : '#888',
    background: active ? '#E85D20' : '#fff',
    border: `0.5px solid ${active ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 100, padding: '5px 14px', cursor: 'pointer',
    transition: 'all 0.15s', minHeight: 'auto', width: 'auto',
  });

  const inputStyle = {
    width: '100%', fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#1a1a1a',
    border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '10px 14px',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, padding: 32, maxWidth: 480, width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 20 }}>Add a Connection</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sara Carnrike" style={inputStyle} />
          </div>

          {/* Role & Company */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Role & Company</label>
            <input value={form.roleCompany} onChange={e => setForm({ ...form, roleCompany: e.target.value })} placeholder="e.g. Marketing Director · Publicis Group" style={inputStyle} />
          </div>

          {/* Source */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>How did you connect?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SOURCES.map(s => (
                <button key={s.key} onClick={() => setForm({ ...form, source: s.key })} style={pillStyle(form.source === s.key)}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Current stage</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STAGES.filter(s => s.key !== 'no_response').map(s => (
                <button key={s.key} onClick={() => setForm({ ...form, stage: s.key })} style={pillStyle(form.stage === s.key)}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any context about this connection..." style={{ ...inputStyle, resize: 'vertical', fontFamily: dmSans, fontSize: 13, fontWeight: 300 }} />
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} style={{
          width: '100%', marginTop: 20, background: '#E85D20', color: '#fff',
          fontFamily: dmSans, fontSize: 14, fontWeight: 500, borderRadius: 100,
          padding: '12px 24px', border: 'none', cursor: 'pointer',
          transition: 'background 0.2s', minHeight: 'auto',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#d44e14'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#E85D20'; }}
        >
          Add to Pipeline →
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