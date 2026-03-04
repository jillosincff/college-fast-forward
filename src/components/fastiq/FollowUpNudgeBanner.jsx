import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'fiq_nudge_dismissed';

function getDismissed() {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
    const now = Date.now();
    // Clean expired entries (3 day TTL)
    const clean = {};
    for (const [id, ts] of Object.entries(raw)) {
      if (now - ts < 3 * 24 * 60 * 60 * 1000) clean[id] = ts;
    }
    return clean;
  } catch { return {}; }
}

function dismissContact(contactId) {
  const current = getDismissed();
  current[contactId] = Date.now();
  localStorage.setItem(DISMISS_KEY, JSON.stringify(current));
}

export default function FollowUpNudgeBanner({ userEmail, onSendMessage }) {
  const [staleContacts, setStaleContacts] = useState([]);
  const [dismissed, setDismissed] = useState(getDismissed());
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!userEmail) return;
    const load = async () => {
      const pipeline = await base44.entities.NetworkingPipeline.filter(
        { user_email: userEmail, status: 'reached_out' }, '-reached_out_date', 20
      ).catch(() => []);
      const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
      const stale = pipeline.filter(p =>
        p.reached_out_date && new Date(p.reached_out_date).getTime() < fourDaysAgo
      );
      setStaleContacts(stale);
    };
    load();
  }, [userEmail]);

  const visible = staleContacts.filter(c => !dismissed[c.id]);
  if (visible.length === 0) return null;

  const contact = visible[currentIdx % visible.length];
  if (!contact) return null;

  const daysAgo = Math.round((Date.now() - new Date(contact.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));
  const followUpCount = contact.follow_up_count || 0;
  const isSecondFollowUp = followUpCount >= 1 && daysAgo >= 14;

  const handleDismiss = () => {
    dismissContact(contact.id);
    setDismissed(prev => ({ ...prev, [contact.id]: Date.now() }));
    setCurrentIdx(0);
  };

  const handleTheyReplied = () => {
    // Update pipeline status to replied
    base44.entities.NetworkingPipeline.update(contact.id, {
      status: 'replied',
      replied_date: new Date().toISOString(),
      status_date: new Date().toISOString(),
    }).catch(() => {});
    // Prompt user to paste the reply for response drafting
    onSendMessage(`I got a reply from ${contact.alumni_name} at ${contact.company}! Here's what they said:`);
    handleDismiss();
  };

  // Second follow-up: show alternative strategies instead of draft button
  if (isSecondFollowUp) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mx-4 mb-3"
        >
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            border: '1px solid #F59E0B',
            borderRadius: 14, padding: '14px 16px',
          }}>
            <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6, marginBottom: 8 }}>
              📭 <strong>{contact.alumni_name}</strong> hasn't replied after your follow-up. That happens — it doesn't mean they're not interested. Here's what I'd suggest:
            </div>
            <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.7, marginBottom: 10, paddingLeft: 8 }}>
              → Try connecting on LinkedIn with a brief note instead<br/>
              → Look for other UF alumni at {contact.company}<br/>
              → Move on to other targets — keep your momentum going
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  base44.entities.NetworkingPipeline.update(contact.id, {
                    status: 'no_response',
                    status_date: new Date().toISOString(),
                    notes: (contact.notes || '') + `\nMarked no_response on ${new Date().toLocaleDateString()}`
                  }).catch(() => {});
                  onSendMessage(`Find other UF alumni at ${contact.company}`);
                  handleDismiss();
                }}
                style={{
                  background: '#0021A5', color: '#fff', border: 'none',
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Find Other Alumni →
              </button>
              <button
                onClick={() => {
                  base44.entities.NetworkingPipeline.update(contact.id, {
                    status: 'no_response',
                    status_date: new Date().toISOString(),
                    notes: (contact.notes || '') + `\nMarked no_response on ${new Date().toLocaleDateString()}`
                  }).catch(() => {});
                  handleDismiss();
                }}
                style={{
                  background: 'none', color: '#92400E', border: '1px solid #F59E0B',
                  padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Mark as No Response
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none', color: '#B45309', border: 'none',
                  padding: '6px 8px', fontSize: 11, cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-4 mb-3"
      >
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
          border: '1px solid #FED7AA',
          borderRadius: 14, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6, marginBottom: 8 }}>
            📬 <strong>Quick check-in:</strong> You messaged <strong>{contact.alumni_name}</strong> at{' '}
            <strong>{contact.company}</strong> {daysAgo} days ago and haven't heard back.
            That's totally normal — most people are busy! A friendly follow-up can make all the difference.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => onSendMessage(`Draft a follow-up message to ${contact.alumni_name} at ${contact.company} — I reached out ${daysAgo} days ago and haven't heard back`)}
              style={{
                background: '#FA4616', color: '#fff', border: 'none',
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', minHeight: 'auto',
              }}
            >
              Draft a Follow-Up →
            </button>
            <button
              onClick={handleTheyReplied}
              style={{
                background: 'none', color: '#059669', border: '1.5px solid #10B981',
                padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                cursor: 'pointer', minHeight: 'auto',
              }}
            >
              They Already Replied ✓
            </button>
            {visible.length > 1 && (
              <button
                onClick={() => setCurrentIdx(prev => (prev + 1) % visible.length)}
                style={{
                  background: 'none', color: '#92400E', border: '1px solid #F59E0B',
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Next ({visible.length - 1} more)
              </button>
            )}
            <button
              onClick={handleDismiss}
              style={{
                background: 'none', color: '#B45309', border: 'none',
                padding: '6px 8px', fontSize: 11, cursor: 'pointer', minHeight: 'auto',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}