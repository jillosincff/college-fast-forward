import React from 'react';

export default function ChipSelector({ 
  options, 
  selected = [], 
  onChange, 
  multiple = true,
  columns = 2 
}) {
  // Ensure selected is always an array
  const safeSelected = Array.isArray(selected) ? selected : [];
  
  const handleClick = (id) => {
    let newSelected;
    if (multiple) {
      if (safeSelected.includes(id)) {
        newSelected = safeSelected.filter(s => s !== id);
      } else {
        newSelected = [...safeSelected, id];
      }
    } else {
      newSelected = [id];
    }
    onChange(newSelected);
  };

  return (
    <div 
      className={`grid gap-2 ${
        columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 
        columns === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 
        'grid-cols-1'
      }`}
    >
      {options.map(option => {
        const isSelected = safeSelected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            data-chip="true"
            onClick={() => handleClick(option.id)}
            className={`
              chip-btn flex items-center gap-2 px-4 py-3 rounded-xl text-left
              transition-all duration-200 border-2
              ${isSelected 
                ? 'bg-orange-50 border-[#FA4616] text-slate-800 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }
            `}
          >
            <span className="text-lg">{option.emoji}</span>
            <span className="text-sm font-medium flex-1">{option.label}</span>
            {isSelected && (
              <span className="text-[#FA4616] text-base font-bold">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}