import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer"

// Hook to detect mobile (< 768px)
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const SelectContext = React.createContext({
  value: undefined,
  onValueChange: () => {},
});

const Select = React.forwardRef(({ className, children, value, onValueChange, defaultValue, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value ?? defaultValue);

  // Sync external value
  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  // Collect options from children for the drawer
  const options = React.useMemo(() => {
    const opts = [];
    const extract = (children) => {
      React.Children.forEach(children, (child) => {
        if (!child) return;
        if (child.type === SelectItem) {
          opts.push({ value: child.props.value, label: child.props.children });
        } else if (child.type === SelectContent || child.type === SelectGroup || child.type === SelectTrigger) {
          extract(child.props.children);
        } else if (child.props?.children) {
          extract(child.props.children);
        }
      });
    };
    extract(children);
    return opts;
  }, [children]);

  const selectedLabel = options.find(o => o.value === internalValue)?.label || '';

  const handleChange = (newVal) => {
    setInternalValue(newVal);
    if (onValueChange) onValueChange(newVal);
  };

  // Desktop: native select
  if (!isMobile) {
    return (
      <SelectContext.Provider value={{ value: internalValue, onValueChange: handleChange }}>
        <div className="relative">
          <select
            ref={ref}
            value={internalValue}
            defaultValue={defaultValue}
            onChange={(e) => handleChange(e.target.value)}
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
      </SelectContext.Provider>
    );
  }

  // Mobile: drawer bottom sheet
  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleChange }}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm ring-offset-background transition-all duration-200 text-left",
            !internalValue && "text-muted-foreground",
            className
          )}
          style={{ minHeight: 'auto' }}
        >
          <span className="truncate">{selectedLabel || 'Select...'}</span>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
        </button>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="max-h-[60vh]">
            <DrawerTitle className="sr-only">Select an option</DrawerTitle>
            <div className="overflow-y-auto py-2 px-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleChange(opt.value);
                    setDrawerOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full px-4 py-3 text-sm rounded-lg transition-colors text-left",
                    opt.value === internalValue
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                  )}
                  style={{ minHeight: 'auto' }}
                >
                  <span className="flex-1">{opt.label}</span>
                  {opt.value === internalValue && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </SelectContext.Provider>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return <div ref={ref} className={cn("w-full", className)} {...props}>{children}</div>;
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => {
  return null;
};

const SelectContent = ({ children }) => {
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

const SelectSeparator = () => null;
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