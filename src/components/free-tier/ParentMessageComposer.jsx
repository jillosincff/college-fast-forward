import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function generateSubjectLine(parent, student) {
  const company = parent.company || parent.current_company || parent.employer || null;
  const school = student?.school || student?.university || 'University of Florida';
  if (company) return `${school} student — quick question about ${company}`;
  return `${school} student seeking career guidance`;
}

function generateOutreachMessage(student, parent) {
  const studentName = student?.first_name || student?.full_name?.split(' ')[0] || 'a student';
  const studentSchool = student?.school || student?.university || 'University of Florida';
  const studentRole = student?.career_goals?.role || null;
  const studentIndustry = student?.career_goals?.industries?.[0] || null;

  const parentFirstName = parent.first_name || parent.full_name?.split(' ')[0] || 'there';
  const parentTitle = parent.job_title || parent.role_title || parent.current_role || null;
  const parentCompany = parent.company || parent.current_company || parent.employer || 'your company';
  const parentIndustry = parent.industry || studentIndustry || 'your field';

  let opening = '';
  if (parentTitle && parentCompany) {
    opening = `I came across your profile and noticed you're a ${parentTitle} at ${parentCompany}`;
  } else if (parentCompany && parentCompany !== 'your company') {
    opening = `I came across your profile and noticed you work at ${parentCompany}`;
  } else if (parentIndustry) {
    opening = `I came across your profile and noticed your background in ${parentIndustry}`;
  } else {
    opening = `I came across your profile on College Fast Forward`;
  }

  let ask = '';
  if (studentRole) {
    ask = `I'm currently exploring opportunities in ${studentRole} and would love to hear about your experience and any advice you might have for someone starting out in this field.`;
  } else if (studentIndustry) {
    ask = `I'm currently exploring careers in ${studentIndustry} and would love to hear about your career path and any advice for someone just starting out.`;
  } else {
    ask = `I would love to hear about your career path and any advice you might have for a student entering the workforce.`;
  }

  return `Hi ${parentFirstName},\n\nMy name is ${studentName} and I'm a student at ${studentSchool}. ${opening}.\n\n${ask}\n\nWould you be open to a brief 15-minute conversation? I'd really appreciate any guidance you could offer.\n\nThank you,\n${studentName}`;
}

export default function ParentMessageComposer({ user, parent, onClose, onSent }) {
  const parentFirst = parent.first_name || parent.full_name?.split(' ')[0] || 'there';
  const parentLastInitial = (parent.last_name || parent.full_name?.split(' ').slice(1).join(' ') || '')[0];
  const parentDisplayName = `${parentFirst}${parentLastInitial ? ` ${parentLastInitial.toUpperCase()}.` : ''}`;
  const parentTitle = parent.job_title || parent.role_title || parent.current_role || null;
  const parentCompany = parent.company || parent.current_company || parent.employer || null;

  const [subject, setSubject] = useState(() => generateSubjectLine(parent, user));
  const [body, setBody] = useState(() => generateOutreachMessage(user, parent));
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [threadState, setThreadState] = useState('loading'); // loading | fresh | awaiting_reply | awaiting_followup | blocked
  const [existingThread, setExistingThread] = useState(null);
  const [daysSinceInitial, setDaysSinceInitial] = useState(0);

  useEffect(() => {
    if (!user?.email || !parent?.email) { setThreadState('fresh'); return; }
    base44.entities.Message.filter({ sender_email: user.email, recipient_email: parent.email })
      .then(msgs => {
        const sorted = (msgs || []).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        if (sorted.length === 0) { setThreadState('fresh'); return; }

        // Check if parent has replied in conversation
        const convId = sorted[0].conversation_id;
        base44.entities.Message.filter({ conversation_id: convId, sender_email: parent.email })
          .then(replies => {
            if ((replies || []).length > 0) {
              // Active conversation — allow free messaging
              setExistingThread(sorted[0]);
              setThreadState('fresh');
              return;
            }
            const initials = sorted.filter(m => m.message_type === 'directory_initial');
            const followups = sorted.filter(m => m.message_type === 'directory_followup');
            if (followups.length > 0) { setThreadState('blocked'); return; }
            if (initials.length > 0) {
              const days = (Date.now() - new Date(initials[0].created_date).getTime()) / (1000 * 60 * 60 * 24);
              setDaysSinceInitial(Math.floor(days));
              setExistingThread(initials[0]);
              setThreadState(days >= 7 ? 'awaiting_followup' : 'awaiting_reply');
              return;
            }
            setThreadState('fresh');
          }).catch(() => setThreadState('fresh'));
      }).catch(() => setThreadState('fresh'));
  }, [user?.email, parent?.email]);

  const handleSend = async (isFollowup = false) => {
    if (body.trim().length < 50) return;
    setSending(true);
    try {
      const convId = existingThread?.conversation_id || `dir_${user.id}_${parent.id}_${Date.now()}`;
      const msgType = isFollowup ? 'directory_followup' : 'directory_initial';

      await base44.entities.Message.create({
        conversation_id: convId,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: parent.email,
        subject: isFollowup ? `Follow-up: ${subject}` : subject,
        body: body.trim(),
        message_type: msgType,
        is_read: false,
      });

      // Send notification email via backend
      base44.integrations.Core.SendEmail({
        to: parent.email,
        subject: 'A student reached out to you on College Fast Forward',
        body: `Hi ${parentFirst},\n\n${user.full_name || 'A student'}${user?.major ? `, a ${user.major} student` : ''} at ${user?.school || user?.university || 'their university'}, sent you a message on College Fast Forward.\n\n"${body.trim().substring(0, 100)}${body.trim().length > 100 ? '...' : ''}"\n\nThey're looking for guidance in ${parent.industry || 'your industry'}. Takes just a minute to respond.\n\nLog in to read and reply: ${window.location.origin}/#MyMessages\n\n— The College Fast Forward Team`,
      }).catch(() => {});

      setSent(true);
      setTimeout(() => { onSent && onSent(); }, 1500);
    } catch (e) {
      console.error('Send failed:', e);
    }
    setSending(false);
  };

  const handleFollowup = () => {
    const followupBody = `Hi ${parentFirst}, I wanted to follow up on my earlier message. I'm still very interested in learning about your experience at ${parent.company || 'your company'}. Would you have a few minutes to connect? I'd really appreciate any guidance you could share.`;
    setBody(followupBody);
    handleSend(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-3 border-b border-[#F0F0F0]">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Message {parentDisplayName}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#999', padding: 4 }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient context strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: '#F9F9F9', borderBottom: '1px solid #EEEEEE' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {(parentFirst[0] || '').toUpperCase()}{(parentLastInitial || '').toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A', margin: 0 }}>{parentDisplayName}</p>
            {(parentTitle || parentCompany) && (
              <p style={{ fontSize: 12, color: '#666', margin: '2px 0 0' }}>
                {parentTitle}{parentTitle && parentCompany ? ' · ' : ''}{parentCompany}
              </p>
            )}
            {parent.linkedin_url && (
              <a href={parent.linkedin_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: '#0077B5', textDecoration: 'none', marginTop: 2, display: 'inline-block' }}>
                View LinkedIn →
              </a>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {threadState === 'loading' && (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-[#E85D20] animate-spin" /></div>
          )}

          {threadState === 'awaiting_reply' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
                You've already reached out to {parentMasked} — waiting for their response.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#78350F' }}>
                {daysSinceInitial} day{daysSinceInitial !== 1 ? 's' : ''} since you sent your initial message.
              </p>
            </div>
          )}

          {threadState === 'awaiting_followup' && !sent && (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
                  It's been a week — would you like to send a follow-up?
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#78350F', marginBottom: 0 }}>
                  {daysSinceInitial} days since your initial message with no response.
                </p>
              </div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value.slice(0, 500))}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-[#1A1A1A] resize-none"
                placeholder="Write your follow-up message..."
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
              />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 }}>
                {body.length}/500
              </p>
              <button
                onClick={handleFollowup}
                disabled={body.trim().length < 50 || sending}
                className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                style={{ minHeight: 'auto' }}
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Follow-up →'}
              </button>
            </div>
          )}

          {threadState === 'blocked' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666' }}>
                {parentMasked} hasn't responded yet. Consider reaching out to someone else in the network.
              </p>
            </div>
          )}

          {(threadState === 'fresh') && !sent && (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-[#1A1A1A]"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                />
              </div>

              {/* Message body */}
              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 6 }}>Message</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value.slice(0, 500))}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-[#E0E0E0] bg-[#FAFAFA] text-[#1A1A1A] resize-none"
                  placeholder="Introduce yourself and explain why you're reaching out..."
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
                />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', textAlign: 'right', marginTop: 2 }}>{body.length}/500</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginTop: 4 }}>
                  Keep it brief and specific. Parents respond best to concise, genuine messages.
                </p>
              </div>

              <button
                onClick={() => handleSend(false)}
                disabled={body.trim().length < 50 || sending}
                className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ minHeight: 'auto' }}
              >
                {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Message →'}
              </button>
              <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#999', minHeight: 'auto', paddingTop: 4 }}>
                Cancel
              </button>
            </div>
          )}

          {sent && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span style={{ fontSize: 28 }}>✓</span>
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>Message sent!</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666' }}>
                {parentMasked} has been notified. Check your Messages tab for their reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}