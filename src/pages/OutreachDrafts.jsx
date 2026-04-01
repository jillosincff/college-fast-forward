import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Home, FileText, Search, Building2, MessageSquare, Plus, Send, Clock, CheckCircle, Archive, ChevronDown, ChevronUp, Loader2, Copy, Trash2, Bell } from 'lucide-react';

function SideNav() {
  const NAV = [
    { icon: Home, page: 'FreeTierDashboard' },
    { icon: FileText, page: 'ResumeTailoring' },
    { icon: Search, page: 'FreeTierDashboard?tab=alumni_search' },
    { icon: Building2, page: 'FreeTierDashboard?tab=company_intel' },
    { icon: MessageSquare, page: 'MyMessages' },
  ];
  return (
    <div style={{ width: 60, background: '#fff', borderRight: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
      {NAV.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.page} onClick={() => navigate(item.page)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    color: '#888',    bg: '#F5F5F5',    icon: FileText },
  sent:     { label: 'Sent',     color: '#3B82F6', bg: '#EFF6FF',    icon: Send },
  replied:  { label: 'Replied',  color: '#22C55E', bg: '#F0FFF4',    icon: CheckCircle },
  archived: { label: 'Archived', color: '#AAAAAA', bg: '#FAFAFA',    icon: Archive },
};

const CONTEXT_LABELS = {
  alumni_search:    'Alumni Outreach',
  cff_connection:   'CFF Connection',
  job_application:  'Job Application',
  cold_outreach:    'Cold Outreach',
  thank_you:        'Thank You Note',
};

function DraftCard({ draft, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(draft.message || '');
  const [notes, setNotes] = useState(draft.notes || '');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = STATUS_CONFIG[draft.status] || STATUS_CONFIG.draft;
  const followUpDue = draft.follow_up_due_at && !draft.follow_up_sent && draft.status === 'sent';
  const followUpOverdue = followUpDue && new Date(draft.follow_up_due_at) < new Date();

  const handleMarkSent = async () => {
    const sentAt = new Date().toISOString();
    const followUpDueAt = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const updated = await base44.entities.OutreachDraft.update(draft.id, {
      status: 'sent', sent_at: sentAt, follow_up_due_at: followUpDueAt,
    });
    onUpdate(updated);
  };

  const handleStatusChange = async (status) => {
    const updated = await base44.entities.OutreachDraft.update(draft.id, { status });
    onUpdate(updated);
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    const updated = await base44.entities.OutreachDraft.update(draft.id, { message, notes });
    onUpdate(updated);
    setSaving(false);
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft.message || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: '#fff', border: `1px solid ${followUpOverdue ? '#FCA5A5' : '#E5E5E5'}`,
      borderRadius: 14, overflow: 'hidden',
      boxShadow: followUpOverdue ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(p => !p)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                {draft.recipient_name}
              </p>
              <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {cfg.label}
              </span>
              {followUpOverdue && (
                <span style={{ background: '#FEF2F2', color: '#EF4444', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bell size={10} /> Follow-up overdue
                </span>
              )}
              {followUpDue && !followUpOverdue && (
                <span style={{ background: '#FFFBEB', color: '#F59E0B', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> Follow-up due {new Date(draft.follow_up_due_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
              {draft.recipient_title ? `${draft.recipient_title} · ` : ''}{draft.recipient_company}
              {draft.context ? ` · ${CONTEXT_LABELS[draft.context] || draft.context}` : ''}
            </p>
          </div>
          <div style={{ color: '#AAAAAA', flexShrink: 0 }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid #F0F0F0', padding: '16px 20px' }}>
          {/* Message */}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#AAAAAA', margin: '0 0 8px' }}>MESSAGE</p>
          {editing ? (
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ width: '100%', minHeight: 160, fontSize: 14, padding: '12px', border: '1px solid #E0E0E0', borderRadius: 10, fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
            />
          ) : (
            <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '14px 16px', marginBottom: 12, whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#333', lineHeight: 1.6 }}>
              {draft.message || <em style={{ color: '#AAAAAA' }}>No message yet.</em>}
            </div>
          )}

          {/* Notes */}
          {editing ? (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#AAAAAA', margin: '0 0 8px' }}>PRIVATE NOTES</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add private notes..."
                style={{ width: '100%', minHeight: 60, fontSize: 14, padding: '10px 12px', border: '1px solid #E0E0E0', borderRadius: 10, fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          ) : draft.notes ? (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#AAAAAA', margin: '0 0 6px' }}>NOTES</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: 0, fontStyle: 'italic' }}>{draft.notes}</p>
            </div>
          ) : null}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {editing ? (
              <>
                <button onClick={handleSaveEdits} disabled={saving} style={btnStyle('#E85D20', '#fff')}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : null} Save
                </button>
                <button onClick={() => { setEditing(false); setMessage(draft.message || ''); setNotes(draft.notes || ''); }} style={btnStyle('#fff', '#555', '#E0E0E0')}>Cancel</button>
              </>
            ) : (
              <>
                <button onClick={handleCopy} style={btnStyle('#fff', '#555', '#E0E0E0')}>
                  <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setEditing(true)} style={btnStyle('#fff', '#555', '#E0E0E0')}>Edit</button>
                {draft.status === 'draft' && (
                  <button onClick={handleMarkSent} style={btnStyle('#3B82F6', '#fff')}>
                    <Send size={13} /> Mark as Sent
                  </button>
                )}
                {draft.status === 'sent' && (
                  <>
                    <button onClick={() => handleStatusChange('replied')} style={btnStyle('#22C55E', '#fff')}>
                      <CheckCircle size={13} /> Mark Replied
                    </button>
                    {followUpDue && (
                      <button onClick={() => base44.entities.OutreachDraft.update(draft.id, { follow_up_sent: true }).then(onUpdate)} style={btnStyle('#F59E0B', '#fff')}>
                        <Bell size={13} /> Mark Follow-up Sent
                      </button>
                    )}
                  </>
                )}
                {draft.status !== 'archived' && (
                  <button onClick={() => handleStatusChange('archived')} style={btnStyle('#fff', '#AAAAAA', '#E0E0E0')}>
                    <Archive size={13} /> Archive
                  </button>
                )}
                <button onClick={() => onDelete(draft.id)} style={{ ...btnStyle('#fff', '#EF4444', '#FCA5A5'), marginLeft: 'auto' }}>
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>

          {/* LinkedIn link */}
          {draft.recipient_linkedin_url && (
            <a href={draft.recipient_linkedin_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#0077B5', textDecoration: 'none', fontWeight: 600 }}>
              View LinkedIn Profile →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg, color, border) => ({
  display: 'flex', alignItems: 'center', gap: 5,
  background: bg, color, border: `1px solid ${border || bg}`,
  borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto',
});

function NewDraftModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    recipient_name: '', recipient_title: '', recipient_company: '',
    recipient_linkedin_url: '', context: 'alumni_search', job_url: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generateMessage = async () => {
    if (!form.recipient_name || !form.recipient_company) return;
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a concise, warm, and personalized outreach message for a college student at University of Florida.

Student: ${user?.full_name || 'A UF student'}
Major: ${user?.major || user?.career_goals?.major || 'undeclared'}
Target roles: ${user?.career_goals?.target_roles?.join(', ') || 'open roles'}

Recipient: ${form.recipient_name}
Title: ${form.recipient_title || 'professional'}
Company: ${form.recipient_company}
Context: ${CONTEXT_LABELS[form.context]}
${form.job_url ? `Job URL: ${form.job_url}` : ''}

Rules:
- Keep it under 150 words
- Sound natural and human, not like a template
- Reference their company specifically
- Have a clear, low-friction ask (15-min call, advice, coffee chat)
- Do NOT use "I hope this message finds you well" or clichés
- Sign off with the student's first name only

Return only the message text.`,
      });
      setGeneratedMessage(typeof result === 'string' ? result : result?.response || '');
    } catch (e) {
      setGeneratedMessage('');
    }
    setGenerating(false);
  };

  const handleSave = async (status = 'draft') => {
    setSaving(true);
    const data = { ...form, message: generatedMessage, status };
    if (status === 'sent') {
      data.sent_at = new Date().toISOString();
      data.follow_up_due_at = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    }
    const created = await base44.entities.OutreachDraft.create(data);
    onCreated(created);
    setSaving(false);
    onClose();
  };

  const isReady = form.recipient_name && form.recipient_company;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>New Outreach Draft</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 22, minHeight: 'auto', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Recipient Name *', key: 'recipient_name', placeholder: 'e.g. Sarah Johnson' },
            { label: 'Their Title', key: 'recipient_title', placeholder: 'e.g. Senior Product Manager' },
            { label: 'Company *', key: 'recipient_company', placeholder: 'e.g. Google' },
            { label: 'LinkedIn URL', key: 'recipient_linkedin_url', placeholder: 'https://linkedin.com/in/...' },
            { label: 'Job Posting URL', key: 'job_url', placeholder: 'Optional — paste job URL if relevant' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', display: 'block', marginBottom: 6 }}>{field.label}</label>
              <input value={form[field.key]} onChange={e => update(field.key, e.target.value)} placeholder={field.placeholder}
                style={{ width: '100%', fontSize: 14, padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A', boxSizing: 'border-box', outline: 'none' }} />
            </div>
          ))}

          <div>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', display: 'block', marginBottom: 6 }}>Context</label>
            <select value={form.context} onChange={e => update('context', e.target.value)}
              style={{ width: '100%', fontSize: 14, padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A', background: '#fff', outline: 'none' }}>
              {Object.entries(CONTEXT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <button onClick={generateMessage} disabled={!isReady || generating}
            style={{ background: isReady ? '#0A0A0A' : '#F0F0F0', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: isReady ? '#fff' : '#AAAAAA', cursor: isReady ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 'auto' }}>
            {generating ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : '⚡ Generate AI Message'}
          </button>

          {generatedMessage && (
            <div>
              <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', display: 'block', marginBottom: 6 }}>GENERATED MESSAGE — Edit as needed</label>
              <textarea value={generatedMessage} onChange={e => setGeneratedMessage(e.target.value)}
                style={{ width: '100%', minHeight: 180, fontSize: 14, padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 10, fontFamily: "'DM Sans', sans-serif", color: '#1A1A1A', resize: 'vertical', boxSizing: 'border-box', outline: 'none', lineHeight: 1.6 }} />
            </div>
          )}

          {generatedMessage && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleSave('draft')} disabled={saving}
                style={{ flex: 1, background: '#fff', border: '1px solid #E0E0E0', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
                Save as Draft
              </button>
              <button onClick={() => handleSave('sent')} disabled={saving}
                style={{ flex: 1, background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} I Already Sent This
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OutreachDrafts({ onOpenUpgrade }) {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState('all');

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.OutreachDraft.filter({ created_by: user.email }, '-created_date', 100)
      .then(data => setDrafts(data || []))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const filtered = filter === 'all' ? drafts : drafts.filter(d => d.status === filter);
  const followUpCount = drafts.filter(d => d.status === 'sent' && !d.follow_up_sent && d.follow_up_due_at && new Date(d.follow_up_due_at) < new Date()).length;

  const handleUpdate = (updated) => setDrafts(prev => prev.map(d => d.id === updated.id ? updated : d));
  const handleDelete = async (id) => {
    if (!confirm('Delete this draft?')) return;
    await base44.entities.OutreachDraft.delete(id);
    setDrafts(prev => prev.filter(d => d.id !== id));
  };
  const handleCreated = (draft) => setDrafts(prev => [draft, ...prev]);

  const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Drafts' },
    { id: 'sent', label: 'Sent' },
    { id: 'replied', label: 'Replied' },
    { id: 'archived', label: 'Archived' },
  ];

  if (!isFastIQ) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <SideNav />
        <div style={{ flex: 1, maxWidth: 640, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✉️</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>Outreach Drafts</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
            AI-written, personalized outreach messages. Track your history and get follow-up reminders — all in one place.
          </p>
          <button onClick={() => onOpenUpgrade?.()} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Unlock FastIQ →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {showNew && <NewDraftModal user={user} onClose={() => setShowNew(false)} onCreated={handleCreated} />}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <SideNav />
        <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '40px 24px', width: '100%' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>OUTREACH DRAFTS</p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your Outreach</h1>
            </div>
            <button onClick={() => setShowNew(true)}
              style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8, minHeight: 'auto' }}>
              <Plus size={16} /> New Draft
            </button>
          </div>

          {/* Follow-up nudge */}
          {followUpCount > 0 && (
            <div style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bell size={18} color="#F59E0B" />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#92400E', margin: 0, fontWeight: 500 }}>
                You have <strong>{followUpCount}</strong> overdue follow-up{followUpCount > 1 ? 's' : ''}. Check your "Sent" messages below.
              </p>
            </div>
          )}

          {/* Stats */}
          {drafts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Total', value: drafts.length, color: '#1A1A1A' },
                { label: 'Sent', value: drafts.filter(d => d.status === 'sent').length, color: '#3B82F6' },
                { label: 'Replied', value: drafts.filter(d => d.status === 'replied').length, color: '#22C55E' },
                { label: 'Drafts', value: drafts.filter(d => d.status === 'draft').length, color: '#888' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 700, color: stat.color, margin: '0 0 2px' }}>{stat.value}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{ background: filter === f.id ? '#E85D20' : '#fff', border: `1px solid ${filter === f.id ? '#E85D20' : '#E0E0E0'}`, borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: filter === f.id ? 600 : 400, color: filter === f.id ? '#fff' : '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 40, height: 40, border: '3px solid #F0F0F0', borderTop: '3px solid #E85D20', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 20px' }}>
                {filter === 'all' ? "No outreach yet. Draft your first message!" : `No ${filter} messages.`}
              </p>
              {filter === 'all' && (
                <button onClick={() => setShowNew(true)} style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  + Create First Draft
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(draft => (
                <DraftCard key={draft.id} draft={draft} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}