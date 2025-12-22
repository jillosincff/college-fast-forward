import React from 'react';

export default function ChipSelector({ 
  options, 
  selected = [], 
  onChange, 
  multiple = true,
  columns = 2 
}) {
  const handleClick = (id) => {
    if (multiple) {
      if (selected.includes(id)) {
        onChange(selected.filter(s => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange([id]);
    }
  };

  return (
    <div 
      className={`grid gap-2 ${
        columns === 2 ? 'grid-cols-2' : 
        columns === 3 ? 'grid-cols-3' : 
        'grid-cols-1'
      }`}
    >
      {options.map(option => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleClick(option.id)}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-xl text-left
              transition-all duration-200 border-2
              ${isSelected 
                ? 'bg-blue-50 border-[#0021A5] text-[#0021A5]' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }
            `}
          >
            <span className="text-base">{option.emoji}</span>
            <span className="text-xs font-medium flex-1">{option.label}</span>
            {isSelected && (
              <span className="text-[#0021A5] text-sm">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}