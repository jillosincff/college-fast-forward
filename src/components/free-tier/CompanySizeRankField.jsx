import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, HelpCircle } from 'lucide-react';

const CARDS = {
  large: {
    id: 'large',
    title: 'Large Company',
    size: '1,000+ employees',
    pros: [
      'Structured onboarding and clear training programs',
      'Recognizable brand name on your resume from day one',
      'Defined career ladder — you know what promotion looks like',
    ],
    cons: [
      'Slower advancement — more people competing for the same roles',
      "Less ownership — you're one of thousands",
      'Harder to stand out and get noticed by leadership',
    ],
    bestFor: 'Students who want stability, structure, and a proven path',
  },
  mid: {
    id: 'mid',
    title: 'Mid-Size Company',
    size: '100–999 employees',
    pros: [
      'More responsibility faster — your work actually moves the needle',
      'Visible impact on the business without the chaos of a startup',
      'Still has resources, benefits, and some structure',
    ],
    cons: [
      'Less brand recognition — you may need to explain where you work',
      'More ambiguity — roles can be undefined or shifting',
      'Fewer formal mentorship or training programs',
    ],
    bestFor: 'Students who want real ownership without giving up stability entirely',
  },
  startup: {
    id: 'startup',
    title: 'Startup',
    size: 'Under 100 employees',
    pros: [
      "Wear many hats — you'll learn more in one year than three at a big company",
      'Direct access to founders and leadership from day one',
      'Equity potential — if it works, you were there early',
    ],
    cons: [
      'Less job security — startups fail, roles disappear',
      'Less structured mentorship — you figure a lot out yourself',
      'Long hours and high ambiguity are the norm, not the exception',
    ],
    bestFor: 'Students who want to build something, move fast, and bet on themselves',
  },
};

const SIZE_LABELS = { large: 'Large Company', mid: 'Mid-Size Company', startup: 'Startup' };

const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function CompanySizeRankField({ value, skipped, isSaved, onChange, onSkip }) {
  const [order, setOrder] = useState(value || ['large', 'mid', 'startup']);
  const [isSkipped, setIsSkipped] = useState(skipped || false);
  const [collapsed, setCollapsed] = useState(!!(isSaved || skipped));
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const dragItem = useRef(null);
  const touchStartY = useRef(null);
  const itemRefs = useRef([]);
  const mobile = isMobile();

  // Single bounce animation on first load
  useEffect(() => {
    if (collapsed) return;
    const t = setTimeout(() => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 600);
    }, 400);
    return () => clearTimeout(t);
  }, [collapsed]);

  const handleDragStart = (e, idx) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === idx) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragItem.current, 1);
    newOrder.splice(idx, 0, moved);
    setOrder(newOrder);
    onChange(newOrder);
    setHasDragged(true);
    dragItem.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
    dragItem.current = null;
  };

  // Touch drag support
  const handleTouchStart = (e, idx) => {
    dragItem.current = idx;
    setDraggingIdx(idx);
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (dragItem.current === null) return;
    const touchY = e.touches[0].clientY;
    // Find which item we're hovering over
    let overIdx = null;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (touchY >= rect.top && touchY <= rect.bottom) overIdx = i;
    });
    if (overIdx !== null && overIdx !== dragItem.current) setDragOverIdx(overIdx);
  };

  const handleTouchEnd = () => {
    if (dragItem.current !== null && dragOverIdx !== null && dragItem.current !== dragOverIdx) {
      const newOrder = [...order];
      const [moved] = newOrder.splice(dragItem.current, 1);
      newOrder.splice(dragOverIdx, 0, moved);
      setOrder(newOrder);
      onChange(newOrder);
      setHasDragged(true);
    }
    dragItem.current = null;
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleSkip = () => {
    setIsSkipped(true);
    setCollapsed(true);
    onSkip();
  };

  const handleEdit = () => {
    setIsSkipped(false);
    setCollapsed(false);
  };

  if (collapsed) {
    return (
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
          What kind of company do you see yourself at?
        </label>
        <div
          className="flex items-center justify-between bg-white border border-[#E0E0E0] rounded-lg px-4 py-3 cursor-pointer hover:border-[#E85D20] transition-all"
          onClick={handleEdit}
        >
          {isSkipped ? (
            <span style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>
              Not set — we're showing a mix
            </span>
          ) : (
            <span style={{ fontSize: 13, color: '#555' }}>
              {order.map(id => SIZE_LABELS[id]).join(' → ')}
            </span>
          )}
          <span style={{ fontSize: 13, color: '#E85D20', fontWeight: 600 }}>
            {isSkipped ? 'Set preference →' : 'Edit →'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes cardBounce {
          0%   { transform: translateY(0) scale(1); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
          40%  { transform: translateY(-4px) scale(1.01); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
          70%  { transform: translateY(-1px) scale(1.005); }
          100% { transform: translateY(0) scale(1); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        }
        .card-bounce { animation: cardBounce 0.6s ease-in-out; }
        .drag-label { transition: opacity 0.4s ease; }
      `}</style>

      {/* Label + tooltip */}
      <div className="flex items-center gap-2 mb-1">
        <label className="block text-sm font-semibold text-[#1A1A1A]">
          What kind of company do you see yourself at?
        </label>
        <div className="relative" style={{ display: 'inline-flex' }}>
          <HelpCircle
            style={{ width: 15, height: 15, color: '#BBBBBB', cursor: 'pointer', flexShrink: 0 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onTouchStart={() => setShowTooltip(v => !v)}
          />
          {showTooltip && (
            <div style={{
              position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
              background: '#1A1A1A', color: '#fff', fontSize: 12, lineHeight: 1.5,
              padding: '8px 12px', borderRadius: 8, width: 240, zIndex: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none',
            }}>
              Drag the cards to rank your preference — #1 at the top means we'll show you more of that type. Not sure? Skip it and we'll show a mix.
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1A1A1A' }} />
            </div>
          )}
        </div>
      </div>

      {/* Helper text */}
      <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
        This helps us find companies that actually fit how you like to work — not just the biggest names everyone already knows.
      </p>

      {/* Instruction line */}
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#444444', textAlign: 'center', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ fontSize: 16 }}>↕</span>
        {mobile
          ? 'Tap and hold to reorder from most to least preferred.'
          : 'Drag to rank from most preferred to least preferred. Your #1 choice shapes which companies we surface first.'}
      </p>

      <div className="space-y-3">
        {order.map((id, idx) => {
          const card = CARDS[id];
          const isDragging = draggingIdx === idx;
          const isDragOver = dragOverIdx === idx && draggingIdx !== idx;
          const isFirstCard = idx === 0;
          return (
            <div
              key={id}
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDrop={e => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={isFirstCard && bouncing ? 'card-bounce' : ''}
              style={{
                background: '#fff',
                border: isDragOver ? '1.5px solid #E85D20' : '1px solid #E5E5E5',
                borderRadius: 12,
                padding: 16,
                cursor: 'grab',
                transform: isDragging ? 'scale(1.02)' : undefined,
                boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                opacity: isDragging ? 0.85 : 1,
                transition: 'box-shadow 0.15s, border-color 0.15s, opacity 0.15s',
                userSelect: 'none',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Drag handle + rank */}
                <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0" style={{ minWidth: 28 }}>
                  <GripVertical style={{ width: 20, height: 20, color: '#E85D20' }} />
                  {!hasDragged && (
                    <span className="drag-label" style={{ fontSize: 9, fontWeight: 700, color: '#E85D20', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: hasDragged ? 0 : 1 }}>
                      DRAG
                    </span>
                  )}
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#E85D20', lineHeight: 1 }}>{idx + 1}</span>
                </div>

                {/* Card content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{card.title}</p>
                    <p style={{ fontSize: 12, color: '#999', margin: 0 }}>{card.size}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-4 mb-2">
                    <div>
                      {card.pros.map((p, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#16A34A', margin: '2px 0' }}>✓ {p}</p>
                      ))}
                    </div>
                    <div>
                      {card.cons.map((c, i) => (
                        <p key={i} style={{ fontSize: 12, color: '#EF4444', margin: '2px 0' }}>✗ {c}</p>
                      ))}
                    </div>
                  </div>

                  <p style={{ fontSize: 11, fontStyle: 'italic', color: '#E85D20', margin: 0 }}>
                    Best for: {card.bestFor}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip option */}
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#999', margin: '0 0 2px', fontStyle: 'italic' }}>
          Not sure yet? That's completely normal.
        </p>
        <button
          onClick={handleSkip}
          style={{ fontSize: 12, color: '#999', fontStyle: 'italic', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', padding: 0, textDecoration: 'underline' }}
        >
          Skip for now — we'll suggest a mix and you can update this anytime →
        </button>
      </div>
    </div>
  );
}