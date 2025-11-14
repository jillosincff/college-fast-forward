import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, value, onValueChange, defaultValue, ...props }, ref) => {
  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <select
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none pr-10",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  // For compatibility with existing code that uses SelectTrigger/SelectValue pattern
  return <div ref={ref} className={cn("w-full", className)} {...props}>{children}</div>;
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => {
  // Placeholder is handled by the native select
  return null;
};

const SelectContent = ({ children }) => {
  // Native select handles this automatically
  return <>{children}</>;
};

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  return (
    <option
      ref={ref}
      value={value}
      className={cn("py-2", className)}
      {...props}
    >
      {children}
    </option>
  );
});
SelectItem.displayName = "SelectItem";

const SelectGroup = ({ children }) => {
  return <optgroup>{children}</optgroup>;
};

const SelectLabel = ({ children }) => {
  return <option disabled>{children}</option>;
};

const SelectSeparator = () => {
  // Native select doesn't support separators
  return null;
};

const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}