import React from 'react';

export default function ChipSelect({ options, selected, onChange, multi = false }) {
  const handleClick = (value) => {
    if (multi) {
      const arr = selected || [];
      if (arr.includes(value)) {
        onChange(arr.filter(v => v !== value));
      } else {
        onChange([...arr, value]);
      }
    } else {
      onChange(value);
    }
  };

  const isSelected = (value) => {
    if (multi) return (selected || []).includes(value);
    return selected === value;
  };

  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = isSelected(val);
        return (
          <button
            key={val}
            type="button"
            onClick={() => handleClick(val)}
            data-chip="true"
            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 border-2 ${
              active
                ? 'bg-orange-500/20 border-orange-400/60 text-orange-300'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/25 hover:text-white/80'
            }`}
            style={{ minHeight: 'auto', minWidth: 'auto' }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}