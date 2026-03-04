import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function FollowUpNudgeBanner({ userEmail, onSendMessage }) {
  const [staleContacts, setStaleContacts] = useState([]);
  const [dismissed, setDismissed] = useState(false);
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

  if (dismissed || staleContacts.length === 0) return null;

  const contact = staleContacts[currentIdx] || staleContacts[0];
  const daysAgo = Math.round((Date.now() - new Date(contact.reached_out_date).getTime()) / (1000 * 60 * 60 * 24));

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
            📬 <strong>Quick reminder:</strong> You messaged <strong>{contact.alumni_name}</strong> at{' '}
            <strong>{contact.company}</strong> {daysAgo} days ago. Most people reply after a follow-up.
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
              Draft Follow-Up →
            </button>
            {staleContacts.length > 1 && (
              <button
                onClick={() => setCurrentIdx(prev => (prev + 1) % staleContacts.length)}
                style={{
                  background: 'none', color: '#92400E', border: '1px solid #F59E0B',
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', minHeight: 'auto',
                }}
              >
                Next ({staleContacts.length - 1} more)
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
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