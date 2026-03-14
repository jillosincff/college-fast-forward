import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const TYPE_STYLES = {
  behavioral: { bg: 'rgba(33,150,243,0.08)', color: '#1565c0' },
  technical: { bg: 'rgba(156,39,176,0.08)', color: '#6a1b9a' },
  product: { bg: 'rgba(232,93,32,0.08)', color: '#E85D20' },
  case: { bg: 'rgba(76,175,80,0.08)', color: '#2e7d32' },
  other: { bg: 'rgba(0,0,0,0.04)', color: '#888' },
};

const TYPE_OPTIONS = ['behavioral', 'technical', 'product', 'case', 'other'];
const LEVEL_OPTIONS = ['entry', 'mid', 'senior'];
const LEVEL_LABELS = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', intern: 'Intern' };

function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: dmSans, fontSize: 12, fontWeight: active ? 500 : 400,
      color: active ? '#fff' : '#888',
      background: active ? '#E85D20' : '#fff',
      border: `0.5px solid ${active ? '#E85D20' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: 100, padding: '6px 14px', cursor: 'pointer',
      transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
    }}>{label}</button>
  );
}

export default function InterviewPrepTab() {
  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [formData, setFormData] = useState({ company: '', question_type: 'behavioral', experience_level: 'entry', question_text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [iq, ir] = await Promise.all([
        base44.entities.InterviewQuestion.list('-created_date', 200).catch(() => []),
        base44.entities.InterviewReport.list('-created_date', 200).catch(() => []),
      ]);
      setQuestions(iq || []);
      setReports(ir || []);
      setLoading(false);
    })();
  }, []);

  // Merge into unified list
  const items = [
    ...(questions || []).filter(q => q.is_visible !== false).map(q => ({
      id: q.id, company: q.company || 'Unknown', type: q.question_type || 'other',
      level: q.experience_level || 'entry', text: q.question_text,
      tips: q.answer_tips, confirmations: q.confirmation_count || 0,
      role: q.role, date: q.interview_date,
    })),
    ...(reports || []).filter(r => r.is_visible !== false).map(r => ({
      id: r.id, company: r.company || 'Unknown', type: (r.interview_types || [])[0] || 'other',
      level: r.experience_level || 'entry', text: r.what_they_asked,
      tips: r.tips_for_students, confirmations: 0,
      role: r.role, date: r.interview_date, difficulty: r.difficulty,
    })),
  ];

  // Top companies for filter
  const companyCount = {};
  items.forEach(i => { const c = i.company.toLowerCase().trim(); companyCount[c] = (companyCount[c] || 0) + 1; });
  const topCompanies = Object.entries(companyCount).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);

  const totalConfirmations = items.reduce((s, i) => s + (i.confirmations || 0), 0);

  // Filter
  let filtered = items;
  if (companyFilter !== 'all') filtered = filtered.filter(i => i.company.toLowerCase().trim() === companyFilter);
  if (typeFilter !== 'all') filtered = filtered.filter(i => i.type === typeFilter);

  const handleSubmit = async () => {
    if (!formData.company.trim() || !formData.question_text.trim()) return;
    setSubmitting(true);
    await base44.entities.InterviewQuestion.create({
      company: formData.company.trim(),
      question_type: formData.question_type,
      experience_level: formData.experience_level,
      question_text: formData.question_text.trim(),
      is_visible: true,
    });
    setShowShareModal(false);
    setFormData({ company: '', question_type: 'behavioral', experience_level: 'entry', question_text: '' });
    // Reload
    const iq = await base44.entities.InterviewQuestion.list('-created_date', 200).catch(() => []);
    setQuestions(iq || []);
    setSubmitting(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 48 }}>
      <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    </div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 22, color: '#1a1a1a', margin: '0 0 4px' }}>Interview Prep</h2>
          <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
            Real interview questions from real companies — contributed by the network.
          </p>
        </div>
        <button onClick={() => setShowShareModal(true)} style={{
          fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#E85D20',
          background: 'none', border: '1px solid rgba(232,93,32,0.4)', borderRadius: 100,
          padding: '8px 18px', cursor: 'pointer', transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
        }}>+ Share a question</button>
      </div>

      {/* Social proof */}
      {totalConfirmations > 0 && (
        <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', marginBottom: 16 }}>
          {totalConfirmations} confirmations across {items.length} questions
        </p>
      )}

      {/* Company filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <Pill label="All" active={companyFilter === 'all'} onClick={() => setCompanyFilter('all')} />
        {topCompanies.map(c => (
          <Pill key={c} label={c.charAt(0).toUpperCase() + c.slice(1)} active={companyFilter === c} onClick={() => setCompanyFilter(c)} />
        ))}
      </div>

      {/* Type filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <Pill label="All" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
        {TYPE_OPTIONS.map(t => (
          <Pill key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
        ))}
      </div>

      {/* Question cards */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888' }}>No questions match this filter.</p>
        </div>
      ) : filtered.slice(0, 20).map(q => {
        const ts = TYPE_STYLES[q.type] || TYPE_STYLES.other;
        const isExpanded = expanded === q.id;
        return (
          <div key={q.id} style={{
            background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 12,
            padding: '16px 18px', marginBottom: 8, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onClick={() => setExpanded(isExpanded ? null : q.id)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {/* Top row badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 100, padding: '2px 8px', color: '#555' }}>{q.company}</span>
              <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, background: ts.bg, borderRadius: 100, padding: '2px 8px', color: ts.color }}>{q.type.charAt(0).toUpperCase() + q.type.slice(1)}</span>
              {q.level && <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '2px 8px', color: '#888' }}>{LEVEL_LABELS[q.level] || q.level}</span>}
            </div>
            {/* Question text */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.5, margin: 0, flex: 1 }}>{q.text}</p>
              {isExpanded ? <ChevronUp size={16} color="#aaa" style={{ flexShrink: 0, marginLeft: 8 }} /> : <ChevronDown size={16} color="#aaa" style={{ flexShrink: 0, marginLeft: 8 }} />}
            </div>
            {/* Expanded */}
            {isExpanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                {q.role && <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', marginBottom: 4 }}><strong>Role:</strong> {q.role}</p>}
                {q.tips && (
                  <div style={{ background: 'rgba(76,175,80,0.06)', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
                    <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#2e7d32', marginBottom: 4 }}>💡 Tips</p>
                    <p style={{ fontFamily: dmSans, fontSize: 13, color: '#2e7d32', margin: 0 }}>{q.tips}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'center' }}>
                  {q.confirmations > 0 && <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa' }}>{q.confirmations} people confirmed this question</span>}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Share modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <h3 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a', marginBottom: 16 }}>Share an Interview Question</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Company name</label>
              <input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Google"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontFamily: dmSans, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Question type</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {TYPE_OPTIONS.map(t => <Pill key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={formData.question_type === t} onClick={() => setFormData(p => ({ ...p, question_type: t }))} />)}
              </div>
            </div>
            <div>
              <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Level</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {LEVEL_OPTIONS.map(l => <Pill key={l} label={LEVEL_LABELS[l]} active={formData.experience_level === l} onClick={() => setFormData(p => ({ ...p, experience_level: l }))} />)}
              </div>
            </div>
            <div>
              <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Question text</label>
              <textarea value={formData.question_text} onChange={e => setFormData(p => ({ ...p, question_text: e.target.value.slice(0, 300) }))} placeholder="What did they ask you?"
                rows={3} style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontFamily: dmSans, fontSize: 14, resize: 'vertical' }} />
              <p style={{ fontFamily: dmSans, fontSize: 11, color: '#aaa', marginTop: 4 }}>{formData.question_text.length}/300</p>
            </div>
            <button onClick={handleSubmit} disabled={submitting || !formData.company.trim() || !formData.question_text.trim()} style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#fff',
              background: '#E85D20', borderRadius: 100, padding: '14px 32px', border: 'none',
              cursor: 'pointer', opacity: submitting ? 0.6 : 1, transition: 'opacity 0.2s',
            }}>
              {submitting ? 'Adding...' : 'Add to the database →'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}