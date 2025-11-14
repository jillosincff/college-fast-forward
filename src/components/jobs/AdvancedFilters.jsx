
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // New import
import { RadioGroup } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Briefcase, MapPin, RotateCcw, Search, X } from "lucide-react"; // X is new import
import MultiSelectFilter from './MultiSelectFilter';

const LOCATIONS = [
  "New York, NY", "Miami, FL", "San Francisco, CA", "Chicago, IL", "Austin, TX", "Boston, MA", "Los Angeles, CA", "Seattle, WA", "Atlanta, GA", "Denver, CO", "Remote"
].map(loc => ({ value: loc, label: loc }));

const ROLES = [
  "Internship", "Full-Time", "Contract"
].map(role => ({ value: role.toLowerCase().replace('-', '_'), label: role }));

// New FilterChip component
const FilterChip = ({ label, onRemove }) => (
  <Badge variant="secondary" className="flex items-center gap-1.5 pl-3 pr-1 py-1.5 text-sm bg-blue-100 text-blue-800 border-blue-200/80">
    {label}
    <button onClick={onRemove} className="rounded-full hover:bg-blue-200 p-0.5" aria-label={`Remove ${label} filter`}>
      <X className="w-3 h-3" />
    </button>
  </Badge>
);

export default function AdvancedFilters({ filters, onFilterChange, resultCount }) {
  const hasActiveFilters = filters.search || (filters.roles && filters.roles.length > 0) || (filters.locations && filters.locations.length > 0) || filters.postedWithin !== "all";

  const handleFilterChangeInternal = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  const clearAllFilters = () => {
    onFilterChange({
      search: "",
      roles: [],
      locations: [],
      postedWithin: "all",
      show_favorites: false,
    });
  };

  // New removeFilter function
  const removeFilter = (type, value) => {
    if (type === 'search') {
      onFilterChange({ ...filters, search: '' });
    } else {
      onFilterChange({ ...filters, [type]: filters[type].filter(item => item !== value) });
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm mb-8 py-4 px-4 rounded-xl">
      <div className="flex flex-col md:flex-row flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="search"
            placeholder="Search by role, company, or keyword..."
            className="pl-11 pr-4 h-12 text-base rounded-lg w-full"
            value={filters.search || ''}
            onChange={(e) => handleFilterChangeInternal('search', e.target.value)}
          />
        </div>

        {/* Date Filter Pills */}
        <RadioGroup
          defaultValue="all"
          value={filters.postedWithin}
          onValueChange={(value) => handleFilterChangeInternal('postedWithin', value)}
          className="flex items-center gap-2"
        >
          {['all', '7', '30'].map(value => (
            <Label
              key={value}
              htmlFor={`date-${value}`}
              className={`flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition-colors border ${
                filters.postedWithin === value
                  ? 'bg-[var(--uf-blue)] text-white border-[var(--uf-blue)]'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {value === 'all' ? 'All Time' : `Last ${value}d`}
            </Label>
          ))}
        </RadioGroup>

        {/* Dropdown Filters */}
        <div className="w-full md:w-48">
          <MultiSelectFilter
            options={ROLES}
            selectedValues={filters.roles}
            onChange={(values) => handleFilterChangeInternal('roles', values)}
            placeholder="Select Roles"
            icon={<Briefcase className="w-5 h-5 text-slate-500" />}
          />
        </div>
        <div className="w-full md:w-48">
          <MultiSelectFilter
            options={LOCATIONS}
            selectedValues={filters.locations}
            onChange={(values) => handleFilterChangeInternal('locations', values)}
            placeholder="Select Locations"
            icon={<MapPin className="w-5 h-5 text-slate-500" />}
          />
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters} className="text-slate-600 hover:text-slate-900">
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
      
      {/* New Filter Chip Display Section */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
          {filters.search && (
            <FilterChip label={`Keyword: "${filters.search}"`} onRemove={() => removeFilter('search')} />
          )}
          {(filters.roles || []).map(role => (
            <FilterChip key={role} label={ROLES.find(r => r.value === role)?.label || role} onRemove={() => removeFilter('roles', role)} />
          ))}
          {(filters.locations || []).map(location => (
            <FilterChip key={location} label={location} onRemove={() => removeFilter('locations', location)} />
          ))}
        </div>
      )}

      {resultCount > 0 && (
        <div className="text-sm text-slate-500 mt-3 pl-1">
          Showing <span className="font-semibold text-slate-700">{resultCount}</span> matching requests
        </div>
      )}
    </div>
  );
}
