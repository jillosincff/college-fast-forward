import { useState } from 'react';
import { motion } from 'framer-motion';
import { dmSans, ORANGE, BORDER, SURFACE, TEXT, MUTED, FAINT } from './theme';

/**
 * Generic single- or multi-select chip question used throughout Act 1.
 * Style mirrors components/onboarding-fastiq/StepInterests.jsx so the visual
 * language stays consistent.
 *
 * Props:
 *   - label:        small uppercase eyebrow above the question
 *   - title:        the question itself
 *   - subtitle:     optional helper text under the title
 *   - options:      array of { label, emoji?, value? }
 *   - multi:        boolean — false (default) means radio-style, true means checkboxes
 *   - exclusiveValue: option value that, when chosen, clears all other selections
 *                     (e.g. "Not sure yet" / "I haven't started")
 *   - allowOther:   show a free-text "Other" field
 *   - value:        current selection. String when !multi, array when multi
 *   - onChange:     (newValue) => void
 *   - onContinue:   () => void  — fires when CTA pressed
 *   - continueLabel
 */
export default function ChipQuestion({
  label,
  title,
  subtitle,
  options,
  multi = false,
  exclusiveValue,
  allowOther = false,
  value,
  onChange,
  onContinue,
  continueLabel = 'Continue',
}) {
  const [otherText, setOtherText] = useState(() => {
    if (!multi) return typeof value === 'string' && !options.some(o => (o.value ?? o.label) === value) ? value || '' : '';
    return '';
  });

  const selectedSet = multi ? new Set(value || []) : new Set(value ? [value] : []);

  const toggle = (optValue) => {
    if (!multi) {
      onChange(optValue);
      return;
    }
    const next = new Set(selectedSet);
    if (exclusiveValue && optValue === exclusiveValue) {
      onChange(next.has(exclusiveValue) ? [] : [exclusiveValue]);
      return;
    }
    if (exclusiveValue) next.delete(exclusiveValue);
    if (next.has(optValue)) next.delete(optValue);
    else next.add(optValue);
    onChange(Array.from(next));
  };

  const submitOther = () => {
    const trimmed = otherText.trim();
    if (!trimmed) return;
    if (multi) {
      const next = new Set(selectedSet);
      if (exclusiveValue) next.delete(exclusiveValue);
      next.add(trimmed);
      onChange(Array.from(next));
      setOtherText('');
    } else {
      onChange(trimmed);
    }
  };

  const hasSelection = multi ? (value || []).length > 0 : !!value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ padding: '32px 20px 40px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      {label && (
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.16em',
          color: ORANGE, margin: '0 0 12px',
        }}>
          {label}
        </p>
      )}
      <h1 style={{
        fontFamily: dmSans, fontSize: 26, fontWeight: 700,
        color: TEXT, lineHeight: 1.25, margin: '0 0 12px', letterSpacing: '-0.01em',
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontFamily: dmSans, fontSize: 14, color: MUTED, lineHeight: 1.55, margin: '0 0 24px' }}>
          {subtitle}
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
        {options.map((opt) => {
          const optValue = opt.value ?? opt.label;
          const active = selectedSet.has(optValue);
          return (
            <button
              key={optValue}
              onClick={() => toggle(optValue)}
              style={{
                background: active ? 'rgba(232,93,32,0.14)' : SURFACE,
                border: `1px solid ${active ? ORANGE : BORDER}`,
                borderRadius: 12, padding: '12px 18px',
                cursor: 'pointer', transition: 'all 0.18s',
                fontFamily: dmSans, fontSize: 14, fontWeight: active ? 600 : 500,
                color: active ? TEXT : 'rgba(255,255,255,0.78)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                minHeight: 'auto', width: 'auto',
              }}
            >
              {opt.emoji && <span style={{ fontSize: 16 }}>{opt.emoji}</span>}
              {opt.label}
            </button>
          );
        })}
      </div>

      {allowOther && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: FAINT, margin: '0 0 8px' }}>
            Don't see it? Add your own:
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitOther(); }}
              placeholder="Type and press add"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '12px 14px', fontFamily: dmSans, fontSize: 14,
                color: TEXT, outline: 'none', minHeight: 'auto',
              }}
            />
            <button
              onClick={submitOther}
              disabled={!otherText.trim()}
              style={{
                background: otherText.trim() ? ORANGE : 'rgba(232,93,32,0.3)',
                border: 'none', borderRadius: 10, padding: '0 18px',
                color: TEXT, fontFamily: dmSans, fontSize: 14, fontWeight: 600,
                cursor: otherText.trim() ? 'pointer' : 'not-allowed',
                minHeight: 'auto',
              }}
            >
              Add
            </button>
          </div>
          {multi && (value || []).filter(v => !options.some(o => (o.value ?? o.label) === v)).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {(value || [])
                .filter(v => !options.some(o => (o.value ?? o.label) === v))
                .map(custom => (
                  <button
                    key={custom}
                    onClick={() => onChange((value || []).filter(v => v !== custom))}
                    style={{
                      background: 'rgba(232,93,32,0.18)', border: `1px solid ${ORANGE}`,
                      borderRadius: 999, padding: '6px 12px', fontFamily: dmSans,
                      fontSize: 12, color: TEXT, cursor: 'pointer', minHeight: 'auto',
                    }}
                  >
                    {custom} ✕
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={!hasSelection}
        style={{
          width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
          background: hasSelection ? ORANGE : 'rgba(232,93,32,0.28)',
          color: TEXT, fontFamily: dmSans, fontSize: 16, fontWeight: 600,
          cursor: hasSelection ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s', minHeight: 'auto',
        }}
      >
        {continueLabel} →
      </button>
    </motion.div>
  );
}
