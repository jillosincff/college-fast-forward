import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter, Users, SlidersHorizontal } from "lucide-react";

const FilterSection = ({ title, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-slate-700 block">{title}</label>
    {children}
  </div>
);

const FilterContent = ({ filters, onFilterChange, industries, jobTypes, locations, groupedRequests, isMobile = false }) => {
  const getDegreeInfo = (degree) => {
    const counts = {
      1: groupedRequests[1]?.length || 0,
      2: groupedRequests[2]?.length || 0,
      3: groupedRequests[3]?.length || 0
    };
    
    switch (degree) {
      case "1": return { label: "1° Direct", count: counts[1], icon: Users };
      case "2": return { label: "2° Friends", count: counts[2], icon: Users };
      case "3": return { label: "3°+ Extended", count: counts[3], icon: Users };
      default: return { label: "All Degrees", count: counts[1] + counts[2] + counts[3], icon: Users };
    }
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-2'}`} role="group" aria-label="Filter options">
      <FilterSection title="Connection Degree">
        <Select 
          value={filters.degree} 
          onValueChange={(value) => onFilterChange({ ...filters, degree: value })}
          aria-label="Filter by connection degree"
        >
          <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Degrees</SelectItem>
            <SelectItem value="1">1° Direct ({getDegreeInfo("1").count})</SelectItem>
            <SelectItem value="2">2° Friends ({getDegreeInfo("2").count})</SelectItem>
            <SelectItem value="3">3°+ Extended ({getDegreeInfo("3").count})</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Industry">
        <Select 
          value={filters.industry} 
          onValueChange={(value) => onFilterChange({ ...filters, industry: value })}
          aria-label="Filter by industry"
        >
          <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map(industry => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Job Type">
        <Select 
          value={filters.jobType} 
          onValueChange={(value) => onFilterChange({ ...filters, jobType: value })}
          aria-label="Filter by job type"
        >
          <SelectTrigger><SelectValue placeholder="Select job type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Types</SelectItem>
            {jobTypes.map(type => <SelectItem key={type} value={type}>{type.split('_').join(' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Location">
        <Select 
          value={filters.location} 
          onValueChange={(value) => onFilterChange({ ...filters, location: value })}
          aria-label="Filter by location"
        >
          <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(location => <SelectItem key={location} value={location}>{location}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Status">
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFilterChange({ ...filters, status: value })}
          aria-label="Filter by status"
        >
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="boosted">Boosted</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>
    </div>
  );
};

export default function SixDegreesFilters({ 
  filters, 
  onFilterChange, 
  industries, 
  jobTypes, 
  locations,
  groupedRequests 
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const activeFilterCount = Object.values(filters).filter(value => value !== "all").length;

  const DesktopFilters = () => (
    <div className="hidden lg:flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 transition-colors duration-200"
            aria-label={`Open filters panel${activeFilterCount > 0 ? `, ${activeFilterCount} active filters` : ''}`}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-[var(--uf-blue)] text-white text-xs px-2 py-1"
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" role="dialog" aria-label="Filter options">
          <FilterContent {...{ filters, onFilterChange, industries, jobTypes, locations, groupedRequests }} />
        </PopoverContent>
      </Popover>
    </div>
  );

  const MobileFilters = () => (
    <div className="lg:hidden">
      <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 transition-colors duration-200"
            aria-label={`Open filters panel${activeFilterCount > 0 ? `, ${activeFilterCount} active filters` : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-[var(--uf-blue)] text-white text-xs px-2 py-1"
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col" role="dialog" aria-labelledby="mobile-filters-title">
          <SheetHeader className="p-4 border-b">
            <SheetTitle id="mobile-filters-title">Filter Opportunities</SheetTitle>
          </SheetHeader>
          <div className="flex-grow overflow-y-auto">
            <FilterContent {...{ filters, onFilterChange, industries, jobTypes, locations, groupedRequests }} isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <>
      <DesktopFilters />
      <MobileFilters />
    </>
  );
}