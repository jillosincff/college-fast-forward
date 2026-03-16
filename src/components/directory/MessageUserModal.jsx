import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import { useAccessControl } from '@/components/access/useAccessControl';
import { X } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

const AVATAR_COLORS = [
  '#E85D20', '#0821A5', '#6A2A60', '#16a34a', '#0891b2',
  '#7c3aed', '#dc2626', '#ca8a04', '#4f46e5', '#059669',
];

function getAvatarColor(str) {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(user) {
  if (!user) return 'M';
  const first = user.first_name || '';
  const last = user.last_name || '';
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  const full = user.full_name || '';
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return 'M';
}

function getFirstName(user) {
  if (!user) return '';
  return user.first_name || (user.full_name || '').split(' ')[0] || '';
}

function getLastInitial(user) {
  if (!user) return '';
  if (user.last_name) return user.last_name[0].toUpperCase() + '.';
  const full = user.full_name || '';
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1][0].toUpperCase() + '.';
  return '';
}

function getRoleBadge(user) {
  const p = user?.persona;
  if (p === 'parent') return { label: 'Parent', bg: '#E85D20', color: '#fff' };
  if (p === 'alumni') {
    const isHelper = user.alumni_intent === 'help_students' || (user.ways_to_help && user.ways_to_help.length > 0);
    if (isHelper) return { label: 'Alumni Helper', bg: '#E85D20', color: '#fff' };
    return { label: 'Alumni', bg: '#e5e7eb', color: '#555' };
  }
  return { label: 'Student', bg: '#e5e7eb', color: '#555' };
}

function normalizeHelpTag(h) {
  const s = (h || '').toLowerCase().replace(/_/g, ' ');
  if (s.includes('career') || s.includes('advice')) return 'Career Guidance';
  if (s.includes('job') || s.includes('referral') || s.includes('lead') || s.includes('internship')) return 'Jobs & Referrals';
  if (s.includes('resume') || s.includes('interview') || s.includes('linkedin')) return 'Resume & Interviews';
  if (s.includes('industry') || s.includes('insight')) return 'Industry Insights';
  if (s.includes('intro') || s.includes('networking') || s.includes('informational')) return 'Introductions';
  return null;
}

function getHelpTags(user) {
  const tags = new Set();
  (user?.ways_to_help || []).forEach(h => { const t = normalizeHelpTag(h); if (t) tags.add(t); });
  (user?.mentorship_topics || []).forEach(h => { const t = normalizeHelpTag(h); if (t) tags.add(t); });
  (user?.expertise_areas || []).forEach(h => { const t = normalizeHelpTag(h); if (t) tags.add(t); });
  if (user?.can_provide_referrals) tags.add('Jobs & Referrals');
  return Array.from(tags);
}

const MAX_CHARS = 500;

export default function MessageUserModal({ isOpen, onClose, recipientUser }) {
  const { user, refreshUser } = useAuth();
  const accessInfo = useAccessControl(user);
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const firstName = useMemo(() => getFirstName(recipientUser), [recipientUser]);
  const lastInit = useMemo(() => getLastInitial(recipientUser), [recipientUser]);
  const initials = useMemo(() => getInitials(recipientUser), [recipientUser]);
  const avatarColor = useMemo(() => getAvatarColor(recipientUser?.id || recipientUser?.full_name), [recipientUser]);
  const roleBadge = useMemo(() => getRoleBadge(recipientUser), [recipientUser]);
  const helpTags = useMemo(() => getHelpTags(recipientUser), [recipientUser]);

  useEffect(() => {
    if (recipientUser && isOpen) {
      const fn = getFirstName(recipientUser);
      setMessage(`Hi ${fn},\n\n`);
      setSent(false);
    }
  }, [recipientUser, isOpen]);

  const handleSubmit = async () => {
    if (!message.trim() || !user || !recipientUser) return;

    if (accessInfo.isLimitedMode && !accessInfo.canSendMessages) {
      toast({
        title: "Daily message limit reached",
        description: "You've used all 3 messages today. Upgrade to Full Access for unlimited messaging!",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    trackEvent('send_message_submitted', { recipient_persona: recipientUser?.persona });

    try {
      const senderName = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.full_name || user.email;

      const recipientName = recipientUser.full_name || `${recipientUser.first_name || ''} ${recipientUser.last_name || ''}`.trim() || recipientUser.email;

      const newMessage = await Message.create({
        sender_email: user.email,
        recipient_email: recipientUser.email,
        subject: `A message from ${senderName}`,
        body: message,
      });

      // Track daily message count for free tier
      if (accessInfo.isLimitedMode && user.persona === 'gator') {
        const now = new Date();
        const etOptions = { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' };
        const currentDayET = new Intl.DateTimeFormat('en-US', etOptions).format(now);
        const currentCount = user.messages_day_reset === currentDayET
          ? (user.messages_sent_today || 0)
          : 0;
        try {
          await base44.auth.updateMe({
            messages_sent_today: currentCount + 1,
            messages_day_reset: currentDayET
          });
          refreshUser?.();
        } catch (countErr) {
          console.error('Failed to update message count:', countErr);
        }
      }

      // Background: increment message count
      setTimeout(async () => {
        try {
          await base44.functions.invoke('incrementMessageCount', { recipientEmail: recipientUser.email });
        } catch (e) { /* silent */ }
      }, 50);

      // Show sent state
      setSent(true);
      setIsSending(false);

      document.dispatchEvent(new CustomEvent('cff:message-sent', {
        detail: { recipientEmail: recipientUser.email }
      }));

      // Background: email notification
      setTimeout(async () => {
        try {
          await base44.functions.invoke('sendMessageNotification', {
            messageId: newMessage.id,
            senderName, senderEmail: user.email,
            recipientEmail: recipientUser.email,
            recipientName,
            subject: `A message from ${senderName}`,
            body: message
          });
        } catch (e) { /* silent */ }
      }, 100);

      // Background: parent → student boost + pay it forward
      if ((user.persona === 'parent' || user.roles?.includes('parent')) &&
        (recipientUser.persona === 'gator' || recipientUser.roles?.includes('gator'))) {
        setTimeout(async () => {
          try {
            await base44.functions.invoke('boostStudentRequests', {
              parentId: user.id, parentEmail: user.email, actionType: 'message_sent'
            });
          } catch (e) { /* silent */ }
        }, 200);
        setTimeout(async () => {
          try {
            await base44.functions.invoke('sendPayItForwardNotification', {
              helper_parent_email: user.email,
              helper_parent_name: user.full_name || user.first_name || 'A Gator Parent',
              student_email: recipientUser.email,
              student_name: recipientUser.full_name || recipientUser.first_name,
              trigger_type: 'message'
            });
          } catch (e) { /* silent */ }
        }, 300);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsSending(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen || !recipientUser) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(13,17,23,0.6)',
          animation: 'mmFadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 9999,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 480,
        borderRadius: 16, overflow: 'hidden',
        background: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'mmSlideUp 0.25s ease',
      }}
        className="msg-modal-shell"
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
        }}>
          <X style={{ width: 14, height: 14, color: '#999' }} />
        </button>

        <div style={{ padding: 24 }}>
          {/* HEADER: Avatar + Name + Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontFamily: dmSans, fontSize: 18, fontWeight: 600, color: '#fff' }}>{initials}</span>
            </div>
            <div>
              <h2 style={{
                fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a',
                letterSpacing: '-0.01em', margin: 0, lineHeight: 1.2,
              }}>
                Message {firstName} {lastInit}
              </h2>
              <span style={{
                display: 'inline-block', marginTop: 4,
                fontFamily: dmSans, fontSize: 11, fontWeight: 500,
                background: roleBadge.bg, color: roleBadge.color,
                borderRadius: 100, padding: '2px 10px',
              }}>
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* CONTEXT STRIP — help tags */}
          {helpTags.length > 0 && (
            <div style={{
              background: '#f4f2ee', borderRadius: 10, padding: '12px 14px', marginBottom: 16,
            }}>
              <p style={{
                fontFamily: dmSans, fontSize: 10, fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#999', margin: '0 0 8px',
              }}>
                HERE TO HELP WITH
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {helpTags.map(tag => (
                  <span key={tag} style={{
                    fontFamily: dmSans, fontSize: 12, color: '#E85D20',
                    border: '1px solid rgba(232,93,32,0.3)', borderRadius: 100,
                    padding: '3px 11px', background: '#fff',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Free tier warning */}
          {accessInfo.isLimitedMode && user?.persona === 'gator' && !sent && (
            <div style={{
              background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 10,
              padding: '10px 14px', marginBottom: 12,
              fontFamily: dmSans, fontSize: 12,
            }}>
              <span style={{ fontWeight: 600, color: '#9A3412' }}>
                {accessInfo.messagesRemaining} message{accessInfo.messagesRemaining !== 1 ? 's' : ''} remaining today
              </span>
            </div>
          )}

          {/* SENT STATE */}
          {sent ? (
            <div style={{
              textAlign: 'center', padding: '40px 0 20px',
              animation: 'mmFadeIn 0.3s ease',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#E85D20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{
                fontFamily: playfair, fontWeight: 700, fontSize: 20, color: '#1a1a1a',
                margin: '0 0 6px',
              }}>
                Message sent to {firstName}!
              </p>
              <p style={{
                fontFamily: dmSans, fontSize: 13, color: '#888', margin: '0 0 16px',
              }}>
                You'll be notified when they reply.{' '}
                <button
                  onClick={() => { onClose(); navigate('MyMessages'); }}
                  style={{
                    fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#E85D20',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    minHeight: 'auto', width: 'auto',
                  }}
                >
                  View it in Messages →
                </button>
              </p>
            </div>
          ) : (
            <>
              {/* TEXTAREA */}
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <textarea
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CHARS) setMessage(e.target.value);
                  }}
                  placeholder="What would you like to ask or share? Being specific gets better responses."
                  style={{
                    fontFamily: dmSans, fontSize: 14, color: '#333',
                    width: '100%', minHeight: 140, resize: 'vertical',
                    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10,
                    padding: '14px 16px', outline: 'none', background: '#fafafa',
                    lineHeight: 1.6, boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#E85D20'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
                />
                <span style={{
                  position: 'absolute', bottom: 10, right: 14,
                  fontFamily: dmSans, fontSize: 11, color: '#bbb',
                }}>
                  {message.length} / {MAX_CHARS}
                </span>
              </div>

              {/* BUTTONS */}
              <button
                onClick={handleSubmit}
                disabled={isSending || !message.trim()}
                style={{
                  width: '100%', fontFamily: dmSans, fontSize: 15, fontWeight: 600,
                  color: '#fff', background: '#E85D20', border: 'none', borderRadius: 10,
                  padding: '14px 0', cursor: isSending || !message.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSending || !message.trim() ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {isSending ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      animation: 'mmSpin 0.6s linear infinite',
                    }} />
                    Sending…
                  </>
                ) : (
                  'Send Message →'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <button onClick={onClose} style={{
                  fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#E85D20',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  minHeight: 'auto', width: 'auto',
                }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes mmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mmSlideUp { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
        @keyframes mmSpin { to { transform: rotate(360deg); } }

        @media (max-width: 520px) {
          .msg-modal-shell {
            max-width: calc(100% - 32px) !important;
          }
        }
      `}</style>
    </>
  );
}