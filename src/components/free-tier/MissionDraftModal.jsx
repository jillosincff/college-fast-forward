import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Check, Loader2 } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Opens the follow-up draft right where the student is — no navigation.
export default function MissionDraftModal({ task, user, onClose, onSent }) {
  const [message, setMessage] = useState('');
  const [drafting, setDrafting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const school = (user?.school_code || 'your school').toUpperCase();
  const firstName = user?.full_name?.split(' ')[0] || '';

  useEffect(() => {
    let cancelled = false;
    base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, polite follow-up message (under 100 words) from ${firstName || 'a student'}, a ${school} student, to ${task.contactName || 'the recruiting team'} at ${task.company}, following up on ${task.role ? `their application for the ${task.role} role` : 'their recent application'}. Reiterate genuine interest in one sentence, keep it warm and respectful of their time, no corporate jargon, no placeholders — ready to send, signed with the student's first name.`,
    })
      .then(res => { if (!cancelled) setMessage(typeof res === 'string' ? res.trim() : ''); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setDrafting(false); });
    return () => { cancelled = true; };
  }, []);

  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const markSent = async () => {
    setSaving(true);
    if (task.pipelineId) {
      await base44.entities.NetworkingPipeline.update(task.pipelineId, {
        follow_up_date: new Date().toISOString(),
        follow_up_count: (task.followUpCount || 0) + 1,
      }).catch(() => {});
    }
    setSaving(false);
    onSent();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 60000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', fontFamily: dm }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#111827', margin: 0 }}>✍️ Your follow-up, written</p>
            <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{[task.role, task.company].filter(Boolean).join(' · ')}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#9ca3af', cursor: 'pointer', padding: 4, lineHeight: 1, minHeight: 'auto', minWidth: 'auto' }}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {drafting ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Loader2 size={24} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '10px 0 0' }}>Writing your follow-up…</p>
            </div>
          ) : (
            <>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6}
                style={{ width: '100%', boxSizing: 'border-box', background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', fontFamily: dm, fontSize: 13, color: '#111827', lineHeight: 1.6, outline: 'none', resize: 'vertical' }} />
              <button onClick={copyMessage}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '11px', borderRadius: 10, border: `1.5px solid ${copied ? '#86efac' : '#ddd6fe'}`, background: copied ? '#f0fdf4' : '#faf5ff', color: copied ? '#16a34a' : '#6d28d9', fontFamily: dm, fontSize: 13, fontWeight: 800, cursor: 'pointer', minHeight: 44 }}>
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied!' : 'Copy message'}
              </button>
              <button onClick={markSent} disabled={saving}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, minHeight: 48 }}>
                {saving ? 'Saving…' : '✓ I sent it'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}