import React from 'react';
import { dmSans, ORANGE } from './ParentOnboardingShell';

/**
 * Multi-select industry chips — parents often span more than one profession
 * (e.g. "Law & Legal Services" and "Real Estate"), so this replaces the old
 * single-value dropdown.
 */
export default function IndustryMultiSelect({ options, selected = [], onChange }) {
  const toggle = (industry) => {
    onChange(
      selected.includes(industry)
        ? selected.filter(i => i !== industry)
        : [...selected, industry]
    );
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
      {options.map(industry => {
        const active = selected.includes(industry);
        return (
          <button
            key={industry}
            type="button"
            onClick={() => toggle(industry)}
            aria-pressed={active}
            style={{
              padding: '9px 14px',
              borderRadius: 100,
              fontFamily: dmSans,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              minHeight: 'auto',
              minWidth: 'auto',
              textAlign: 'center',
              background: active ? ORANGE : 'transparent',
              color: active ? '#fff' : '#334155',
              border: `1.5px solid ${active ? ORANGE : '#E2E8F0'}`,
            }}
          >
            {active ? '✓ ' : ''}{industry}
          </button>
        );
      })}
    </div>
  );
}