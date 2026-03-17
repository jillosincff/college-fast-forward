import React, { useState } from 'react';
import { X, Send, CheckCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";

export default function IntroRequestModal({ isOpen, onClose, connection, userSchool, userName, onSuccess }) {
  const firstName = userName?.split(/[\s,]+/)[0] || 'Student';
  const connectionFirstName = connection.name.split(' ')[0];

  const defaultMessage = `Hi ${connectionFirstName}, I'm a student at ${userSchool || 'university'} exploring opportunities at ${connection.company}.

I came across your profile through College Fast Forward and would really appreciate the chance to learn from your experience.

Would you be open to a quick conversation?`;

  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    
    // Simulate sending (in real app, this would create an IntroOffer or similar entity)
    try {
      await base44.entities.IntroOffer.create({
        student_name: userName,
        student_email: '', // Would be filled from auth
        target_company: connection.company,
        helper_name: connection.name,
        helper_type: connection.type?.toLowerCase() || 'parent',
        message: message,
        status: 'pending',
      });
    } catch (e) {
      // Silently fail for demo
      console.log('Demo mode - intro request simulated');
    }

    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1000);
  };

  const handleDone = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 460,
        background: '#0D0F13',
        border: '1px solid #23252B',
        borderRadius: 20,
        zIndex: 1101,
        overflow: 'hidden',
      }}>
        {sent ? (
          /* Success State */
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(76,175,80,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={28} style={{ color: '#4CAF50' }} />
            </div>

            <h2 style={{
              fontFamily: dmSans,
              fontSize: 22,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 10,
            }}>
              Request sent
            </h2>

            <p style={{
              fontFamily: dmSans,
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              marginBottom: 8,
            }}>
              If they're open to helping, they'll respond or make an introduction.
            </p>

            <p style={{
              fontFamily: dmSans,
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(79,140,255,0.8)',
              lineHeight: 1.6,
              marginBottom: 28,
            }}>
              You can continue reaching out to other contacts in the meantime.
            </p>

            <button
              onClick={handleDone}
              style={{
                background: '#4F8CFF',
                border: 'none',
                borderRadius: 12,
                padding: '14px 36px',
                cursor: 'pointer',
                fontFamily: dmSans,
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s',
                minHeight: 'auto',
                boxShadow: '0 4px 20px rgba(79,140,255,0.25)',
              }}
            >
              Continue <ArrowRight size={16} />
            </button>

            <p style={{
              fontFamily: dmSans,
              fontSize: 11,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.25)',
              marginTop: 16,
              fontStyle: 'italic',
            }}>
              Keep moving while you wait
            </p>
          </div>
        ) : (
          /* Request Form */
          <>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #1A1C22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{
                  fontFamily: dmSans,
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#fff',
                  margin: 0,
                }}>
                  Request an introduction
                </h2>
                <p style={{
                  fontFamily: dmSans,
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.45)',
                  margin: '4px 0 0',
                }}>
                  We'll help you make a great first impression.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.4)',
                  transition: 'all 0.15s',
                  minHeight: 'auto',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Recipient info */}
            <div style={{
              padding: '16px 24px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid #1A1C22',
            }}>
              <p style={{
                fontFamily: dmSans,
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 4,
              }}>
                To:
              </p>
              <p style={{
                fontFamily: dmSans,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                margin: 0,
              }}>
                {connection.name} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>— {connection.role} at {connection.company}</span>
              </p>
            </div>

            {/* Message */}
            <div style={{ padding: '20px 24px' }}>
              <label style={{
                fontFamily: dmSans,
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.5)',
                display: 'block',
                marginBottom: 8,
              }}>
                Your message
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #2A2D35',
                  fontFamily: dmSans,
                  fontSize: 14,
                  fontWeight: 400,
                  color: '#fff',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(79,140,255,0.4)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#2A2D35'; }}
              />
            </div>

            {/* Actions */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
            }}>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid #2A2D35',
                  borderRadius: 10,
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontFamily: dmSans,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)',
                  transition: 'all 0.15s',
                  minHeight: 'auto',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2D35'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                style={{
                  background: sending ? 'rgba(79,140,255,0.5)' : '#4F8CFF',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 28px',
                  cursor: sending ? 'default' : 'pointer',
                  fontFamily: dmSans,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  minHeight: 'auto',
                  boxShadow: '0 4px 16px rgba(79,140,255,0.2)',
                }}
              >
                {sending ? (
                  <>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                    Sending...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Send request
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}