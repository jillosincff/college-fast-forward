import React, { useState } from 'react';
import { dmSans, playfair, CARD_BG, ORANGE, BORDER } from './constants';
import { X } from 'lucide-react';
import AskParentModal from './AskParentModal';

const MODAL_CONTENT = {
  'alumni-contacts': {
    icon: '👤',
    title: 'Meet the people who can open doors.',
    body: 'FastIQ shows you full alumni names, prioritizes who to contact first, and writes a personalized outreach message — ready to send.',
    testimonial: '"My son got 3 responses in a week after using this." — Parent, Class of 2026',
  },
  'resume-tailoring': {
    icon: '📄',
    title: 'A resume built for each role.',
    body: 'FastIQ tailors your resume and cover letter for every job you apply to — ATS-friendly and specific.',
  },
  'linkedin-review': {
    icon: '💼',
    title: 'Get recruiter-ready.',
    body: 'FastIQ reviews your LinkedIn profile and tells you exactly what to improve to get noticed by recruiters and alumni.',
  },
  'job-search-crm': {
    icon: '📊',
    title: 'Never lose track of where you stand.',
    body: 'FastIQ tracks every company, every contact, and every conversation — so nothing falls through the cracks.',
  },
  'follow-up-alerts': {
    icon: '🔔',
    title: 'Never let a conversation go cold.',
    body: 'FastIQ reminds you when to follow up and writes the message for you — so momentum never stalls.',
  },
};

export default function LockedTabModal({ tabId, user, onClose, onUnlock }) {
  const [showAskParent, setShowAskParent] = useState(false);
  const content = MODAL_CONTENT[tabId];
  if (!content) return null;

  if (showAskParent) {
    return <AskParentModal user={user} onClose={() => { setShowAskParent(false); onClose(); }} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: CARD_BG, border: `1px solid ${ORANGE}33`, borderRadius: 16, padding: '36px 28px', maxWidth: 460, width: '100%' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto' }}>
          <X size={20} />
        </button>

        <p style={{ fontSize: 36, marginBottom: 16 }}>{content.icon}</p>
        <h3 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>{content.title}</h3>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#888', lineHeight: 1.65, marginBottom: content.testimonial ? 20 : 28 }}>{content.body}</p>

        {content.testimonial && (
          <p style={{ fontFamily: dmSans, fontStyle: 'italic', fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, marginBottom: 28 }}>
            {content.testimonial}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button
            onClick={onUnlock}
            style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#fff',
              background: ORANGE, border: 'none', borderRadius: 100,
              padding: '12px 28px', cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Unlock FastIQ →
          </button>
          <button
            onClick={() => setShowAskParent(true)}
            style={{
              fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#888',
              background: 'transparent', border: '1px solid #333',
              borderRadius: 100, padding: '12px 28px', cursor: 'pointer', minHeight: 'auto',
            }}
          >
            Ask Your Parent →
          </button>
        </div>
      </div>
    </div>
  );
}