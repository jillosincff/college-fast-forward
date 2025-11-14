import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef(({ className = '', checked, onCheckedChange, id, ...props }, ref) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        ref={ref}
        checked={checked}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
      <div
        className={`
          min-h-[44px] min-w-[44px] shrink-0 rounded border border-primary ring-offset-background 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-colors
          flex items-center justify-center
          ${checked 
            ? 'bg-primary text-primary-foreground border-primary' 
            : 'bg-background border-input hover:border-primary/50'
          }
          ${className}
        `}
        onClick={() => onCheckedChange && onCheckedChange(!checked)}
      >
        {checked && (
          <Check className="h-4 w-4 text-white" />
        )}
      </div>
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };