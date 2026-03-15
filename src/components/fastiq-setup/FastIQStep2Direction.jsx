import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const TargetIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={orange} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="12" /><circle cx="16" cy="16" r="7" /><circle cx="16" cy="16" r="2" />
  </svg>
);

const CompassIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="rgba(244,240,232,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="16" cy="16" r="13" />
    <polygon points="20,10 22,22 12,18 10,10" fill="none" />
  </svg>
);

const CARDS = [
  {
    id: 'focused',
    Icon: TargetIcon,
    title: "I know what I want",
    desc: "I have target companies or roles in mind. Help me find alumni there, draft outreach, and get my foot in the door.",
    tags: ['Alumni finder', 'Outreach drafting', 'Company intel', 'Follow-up nudges'],
    cta: 'Set up my target companies →',
  },
  {
    id: 'explorer',
    Icon: CompassIcon,
    title: "I'm still figuring it out",
    desc: "I'm not sure what I want yet. Help me explore careers, talk to people doing interesting work, and find my direction.",
    tags: ['Career exploration', 'Alumni conversations', 'Path discovery', 'Guided advice'],
    cta: 'Start exploring →',
  },
];

export default function FastIQStep2Direction({ selected, onSelect }) {
  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        How can FASTIQ help you best?
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', lineHeight: 1.6, marginBottom: 24 }}>
        Pick the one that feels most like where you are right now.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {CARDS.map(card => {
          const isSelected = selected === card.id;
          return (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              style={{
                background: isSelected ? 'rgba(232,93,32,0.08)' : 'rgba(255,255,255,0.04)',
                border: isSelected ? '1px solid rgba(232,93,32,0.5)' : '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: 24, cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.2s', width: '100%', minHeight: 'auto',
              }}
              onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; } }}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
            >
              <card.Icon />
              <p style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#f4f0e8', marginTop: 12, marginBottom: 0 }}>{card.title}</p>
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.6, marginTop: 6, marginBottom: 0 }}>{card.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {card.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: dmSans, fontSize: 11, fontWeight: 400,
                    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 100, padding: '3px 10px', color: 'rgba(244,240,232,0.5)',
                  }}>{t}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.2 }}>
            {/* CTA rendered by parent via bottom nav */}
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.25)', textAlign: 'center', marginTop: 8 }}>
        You can switch between modes anytime inside FASTIQ.
      </p>
    </div>
  );
}