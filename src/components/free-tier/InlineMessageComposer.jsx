import React, { useState, useEffect } from 'react';
import { X, Copy, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InlineMessageComposer({ lead, user, isFastIQ, onClose, onMarkContacted, onSaveToNotebook }) {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAlumni = lead?.type === 'warm';
  const isFreeOnAlumni = isAlumni && !isFastIQ;

  useEffect(() => {
    if (isFreeOnAlumni) { setLoading(false); return; }
    if (!lead || !user) { setLoading(false); return; }
    const goals = user?.career_goals || {};
    const generate = async () => {
      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are FastIQ generating a personalized outreach message for a college student.

Student goals:
- Target role: ${goals.target_roles?.join(', ') || 'not set'}
- Target industry: ${goals.target_industries?.join(', ') || 'not set'}
- Location preference: ${goals.location_preference || 'flexible'}
- Experience level: ${goals.experience_level || 'entry level'}
- School: ${user.school || user.university || 'University of Florida'}

Contact details:
- Name: ${lead.name}
- Title: ${lead.title || 'Professional'}
- Company: ${lead.company || ''}
- Connection type: ${isAlumni ? 'alumni cold outreach' : 'CFF parent intro request'}
${lead.graduation_year ? `- Graduation year: ${lead.graduation_year}` : ''}

The student's school: ${user.school || user.university || 'University of Florida'}
The parent's school: ${lead.school || lead.university || ''}
Same school: ${(user.school || user.university || '') === (lead.school || lead.university || '') ? 'YES' : 'NO'}

If same school: use the school as the shared connection: "As a fellow [school] family, I found your profile on College Fast Forward..."
If different school: use CFF as the shared connection: "I found your profile on College Fast Forward — we're both part of the CFF network, which connects parents and students across schools for career conversations."

Write a concise, warm, specific outreach message. 2-3 short paragraphs.
          response_json_schema: {
            type: 'object',
            properties: {
              subject: { type: 'string' },
              message_body: { type: 'string' },
            },
          },
        });
        setSubject(result?.subject || `Reaching out — ${user.school || 'UF'} student`);
        setMessage(result?.message_body || '');
      } catch (e) {
        setMessage('Hi [Name],\n\nI came across your profile and wanted to reach out. I\'m a student at the University of Florida exploring opportunities in your field. Would you be open to a brief conversation?\n\nThank you for your time!');
        setSubject('Quick question from a UF student');
      }
      setLoading(false);
    };
    generate();
  }, [lead?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSend = async () => {
    if (!lead?.email) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        conversation_id: `goals_lead_${user.id}_${lead.id}_${Date.now()}`,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: lead.email,
        subject,
        body: message,
        message_type: 'directory_initial',
        is_read: false,
      });
      setSent(true);
      onMarkContacted?.();
    } catch (e) {
      console.error('Send failed:', e);
    }
    setSending(false);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500,
      background: '#fff', borderTop: '2px solid #E85D20',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
      maxHeight: '70vh', overflowY: 'auto',
      borderRadius: '16px 16px 0 0',
      padding: '20px 24px 32px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', margin: '0 0 4px' }}>⚡ FASTIQ OUTREACH DRAFT</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            To: {lead?.name} · {lead?.title} {lead?.company ? `· ${lead.company}` : ''}
          </p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', color: '#999' }}>
          <X style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {isFreeOnAlumni ? (
        <div style={{ background: '#0d1117', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>⚡ Upgrade to FastIQ</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', lineHeight: 1.6 }}>
            Draft and send outreach to alumni with FastIQ. You can still contact CFF Parents (Hot Leads) for free.
          </p>
          <button onClick={onClose} style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
            Unlock FastIQ →
          </button>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#E85D20' }}>
          <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0 }}>FastIQ is drafting your message...</p>
        </div>
      ) : sent ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 28, margin: '0 0 8px' }}>✓</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>Message sent!</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>Marked as contacted.</p>
          <button onClick={onClose} style={{ marginTop: 12, background: 'none', border: 'none', color: '#E85D20', fontSize: 13, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}>Close</button>
        </div>
      ) : (
        <div>
          {/* Subject */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#888', margin: '0 0 4px' }}>SUBJECT</p>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A' }} />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: '#888', margin: '0 0 4px' }}>MESSAGE</p>
            {editing ? (
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E85D20', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', resize: 'vertical' }} />
            ) : (
              <div style={{ background: '#F9F9F9', border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {message}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <button onClick={() => setEditing(p => !p)}
              style={{ background: 'none', border: '1.5px solid #E85D20', color: '#E85D20', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto' }}>
              {editing ? 'Done Editing' : 'Edit'}
            </button>
            <button onClick={handleCopy}
              style={{ background: 'none', border: '1px solid #E0E0E0', color: '#666', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Copy style={{ width: 13, height: 13 }} /> {copied ? 'Copied!' : 'Copy Message'}
            </button>
            {lead?.email && (
              <button onClick={handleSend} disabled={sending}
                style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 6, opacity: sending ? 0.7 : 1 }}>
                {sending ? <Loader2 style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: 13, height: 13 }} />}
                Send via CFF →
              </button>
            )}
            {onSaveToNotebook && (
              <button onClick={() => onSaveToNotebook(message)}
                style={{ background: 'none', border: '1px solid #E0E0E0', color: '#666', borderRadius: 100, padding: '8px 18px', fontSize: 13, cursor: 'pointer', minHeight: 'auto' }}>
                Save to Notebook
              </button>
            )}
          </div>

          <button onClick={() => { onMarkContacted?.(); onClose(); }}
            style={{ background: 'none', border: 'none', color: '#E85D20', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: 0 }}>
            ✓ Mark as Contacted
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}