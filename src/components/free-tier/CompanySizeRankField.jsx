import React, { useState } from 'react';
import { ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';

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

export default function CompanySizeRankField({ value, skipped, isSaved, onChange, onSkip }) {
  const [order, setOrder] = useState(value || ['large', 'mid', 'startup']);
  const [isSkipped, setIsSkipped] = useState(skipped || false);
  const [collapsed, setCollapsed] = useState(!!(isSaved || skipped));
  const [showTooltip, setShowTooltip] = useState(false);

  const move = (idx, direction) => {
    const newOrder = [...order];
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setOrder(newOrder);
    onChange(newOrder);
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
            <span style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>Not set — we're showing a mix</span>
          ) : (
            <span style={{ fontSize: 13, color: '#555' }}>{order.map(id => SIZE_LABELS[id]).join(' → ')}</span>
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
            onClick={() => setShowTooltip(v => !v)}
          />
          {showTooltip && (
            <div style={{
              position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
              background: '#1A1A1A', color: '#fff', fontSize: 12, lineHeight: 1.5,
              padding: '8px 12px', borderRadius: 8, width: 240, zIndex: 50,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', pointerEvents: 'none',
            }}>
              Use the arrows to rank your preference — #1 at the top means we'll show you more of that type.
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #1A1A1A' }} />
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
        Rank from most to least preferred. Your #1 choice shapes which companies we surface first.
      </p>

      <div className="space-y-3">
        {order.map((id, idx) => {
          const card = CARDS[id];
          return (
            <div
              key={id}
              style={{
                background: '#fff',
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              {/* Rank + arrows */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, minWidth: 32 }}>
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: 2, minHeight: 'auto', minWidth: 'auto', opacity: idx === 0 ? 0.2 : 1 }}
                >
                  <ChevronUp style={{ width: 18, height: 18, color: '#E85D20' }} />
                </button>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#E85D20', lineHeight: 1 }}>{idx + 1}</span>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === order.length - 1}
                  style={{ background: 'none', border: 'none', cursor: idx === order.length - 1 ? 'default' : 'pointer', padding: 2, minHeight: 'auto', minWidth: 'auto', opacity: idx === order.length - 1 ? 0.2 : 1 }}
                >
                  <ChevronDown style={{ width: 18, height: 18, color: '#E85D20' }} />
                </button>
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
          );
        })}
      </div>

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