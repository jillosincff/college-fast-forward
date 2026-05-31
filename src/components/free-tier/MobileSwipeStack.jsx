import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function SwipeCard({ lead, onSwipeRight, onSwipeLeft, onTap, isTop }) {
  const [dragX, setDragX] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const rightIntensity = Math.min(1, Math.max(0, dragX / 120));
  const leftIntensity = Math.min(1, Math.max(0, -dragX / 120));

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 90) {
      onSwipeRight(lead);
    } else if (info.offset.x < -90) {
      onSwipeLeft(lead);
    }
    setDragX(0);
  };

  return (
    <>
      <motion.div
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 12 }}
        style={{ position: 'absolute', width: '100%', touchAction: 'pan-y' }}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div style={{ position: 'relative', userSelect: 'none' }}>
          {/* Green overlay — swipe right */}
          {dragX > 10 && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 20, zIndex: 10,
              background: `rgba(34,197,94,${rightIntensity * 0.35})`,
              border: `2px solid rgba(34,197,94,${rightIntensity * 0.7})`,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
              padding: '0 24px', pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 40, opacity: rightIntensity }}>✅</span>
            </div>
          )}
          {/* Red overlay — swipe left */}
          {dragX < -10 && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 20, zIndex: 10,
              background: `rgba(239,68,68,${leftIntensity * 0.25})`,
              border: `2px solid rgba(239,68,68,${leftIntensity * 0.6})`,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              padding: '0 24px', pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 40, opacity: leftIntensity }}>✕</span>
            </div>
          )}

          {/* Card Body */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '20px 20px 16px', minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h4 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 18, color: '#111827', margin: 0, lineHeight: 1.2, flex: 1 }}>{lead.company}</h4>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', background: '#eff6ff', borderRadius: 6, padding: '3px 8px', marginLeft: 8, whiteSpace: 'nowrap' }}>Discovery</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, color: '#6b7280', margin: '2px 0 12px', fontWeight: 500 }}>{lead.role}</p>

              <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: '12px 14px' }}>
                <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {lead.jobDescription || lead.description || 'No description available.'}
                </p>
                <button
                  onClick={() => setShowFullDesc(true)}
                  style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#7c3aed', fontWeight: 700, background: 'none', border: 'none', padding: '6px 0 0', cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline' }}
                >
                  Read more →
                </button>
              </div>

              <div style={{ marginTop: 12, background: '#f0fdf4', borderRadius: 10, padding: '8px 12px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13 }}>🔒</span>
                <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#065f46', margin: 0, fontWeight: 600 }}>Matches your target profile</p>
              </div>
            </div>

            {/* Gesture hint */}
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <button
                onClick={() => onSwipeLeft(lead)}
                style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 0', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: '#dc2626', cursor: 'pointer', minHeight: 'auto' }}
              >
                ✕ Skip
              </button>
              <button
                onClick={() => onSwipeRight(lead)}
                style={{ flex: 2, background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', borderRadius: 12, padding: '10px 0', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}
              >
                📩 Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Full description modal */}
      {showFullDesc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', padding: 0 }} onClick={() => setShowFullDesc(false)}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '80vh', overflow: 'auto', padding: '20px 20px 32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 800, fontSize: 16, color: '#111827', margin: 0 }}>{lead.role}</h3>
                <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>{lead.company}</p>
              </div>
              <button onClick={() => setShowFullDesc(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14, minHeight: 'auto' }}>✕</button>
            </div>
            <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
              {lead.jobDescription || lead.description}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => { setShowFullDesc(false); onSwipeLeft(lead); }} style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 0', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#dc2626', cursor: 'pointer', minHeight: 'auto' }}>✕ Skip</button>
              <button onClick={() => { setShowFullDesc(false); onSwipeRight(lead); }} style={{ flex: 2, background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', borderRadius: 12, padding: '12px 0', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', minHeight: 'auto' }}>📩 Add to Pipeline</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MobileSwipeStack({ leads, onAddToPipeline }) {
  const [stack, setStack] = useState(leads);
  const [toast, setToast] = useState(null);
  const [exiting, setExiting] = useState(null); // { id, direction }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const removeTop = (direction, lead) => {
    setExiting({ key: `${lead.company}-${lead.role}`, direction });
    setTimeout(() => {
      setStack(prev => prev.filter(l => !(l.company === lead.company && l.role === lead.role)));
      setExiting(null);
    }, 320);
  };

  const handleSwipeRight = (lead) => {
    onAddToPipeline && onAddToPipeline(lead);
    showToast('📩 Added to Pipeline!');
    removeTop('right', lead);
  };

  const handleSwipeLeft = (lead) => {
    removeTop('left', lead);
  };

  if (stack.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f9fafb', borderRadius: 20, border: '1px dashed #d1d5db' }}>
        <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 700, color: '#6b7280', margin: 0 }}>✨ All caught up!</p>
        <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: '#9ca3af', margin: '6px 0 0', lineHeight: 1.6 }}>CLiFF is monitoring 24/7 for your next matches.</p>
      </div>
    );
  }

  // Show top 2 cards stacked
  const visibleStack = stack.slice(0, 2);

  return (
    <div style={{ position: 'relative' }}>
      {/* Remaining count indicator */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>
          {stack.length} match{stack.length !== 1 ? 'es' : ''} to review
        </span>
      </div>

      {/* Card stack */}
      <div style={{ position: 'relative', height: 400 }}>
        <AnimatePresence>
          {[...visibleStack].reverse().map((lead, reversedIdx) => {
            const isTop = reversedIdx === visibleStack.length - 1;
            const key = `${lead.company}-${lead.role}`;
            const isExiting = exiting?.key === key;

            return (
              <motion.div
                key={key}
                initial={false}
                animate={isExiting
                  ? { x: exiting.direction === 'right' ? 400 : -400, opacity: 0, rotate: exiting.direction === 'right' ? 20 : -20 }
                  : { x: 0, opacity: 1, scale: isTop ? 1 : 0.95, y: isTop ? 0 : 14 }
                }
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ position: 'absolute', width: '100%' }}
              >
                <SwipeCard
                  lead={lead}
                  isTop={isTop && !isExiting}
                  onSwipeRight={handleSwipeRight}
                  onSwipeLeft={handleSwipeLeft}
                  onTap={() => {}}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Swipe hint */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#ef4444', fontWeight: 600 }}>← Skip</span>
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#9ca3af' }}>swipe to triage</span>
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Pipeline →</span>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              background: '#111827', color: '#fff', borderRadius: 12, padding: '12px 20px',
              fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 700,
              zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}