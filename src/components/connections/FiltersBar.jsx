import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";

export default function FiltersBar({ filters, setFilters, onInviteClick }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSortChange = (value) => {
    if (value) {
      setFilters(prev => ({ ...prev, sortBy: value }));
    }
  };
  
  const sortingOptions = [
    { value: 'trending', label: 'Trending', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Sparkles },
    { value: 'urgent', label: 'Urgent', icon: AlertTriangle }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            className="pl-10 h-10 w-full"
            placeholder="Search by name, role, or keyword…"
            value={filters.q || ''}
            onChange={e => handleFilterChange('q', e.target.value)}
          />
        </div>

        {/* Sorting Buttons (replaces ToggleGroup) */}
        <div className="flex-shrink-0 flex items-center gap-2" role="group" aria-label="Sort requests by">
          {sortingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={filters.sortBy === option.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleSortChange(option.value)}
                aria-pressed={filters.sortBy === option.value}
                className={`transition-all rounded-full px-4 ${
                  filters.sortBy === option.value 
                    ? 'bg-slate-200 text-slate-800' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            );
          })}
        </div>
        
        {/* Invite Button */}
        <Button 
          onClick={onInviteClick}
          className="ml-auto bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-bold shadow-md w-full md:w-auto"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Alumni
        </Button>
      </div>
    </div>
  );
}