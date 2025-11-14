import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, SlidersHorizontal, Users } from "lucide-react";

export default function CompactFilters({ filters, onFilterChange, industries, counts = { degree: {}, status: {}, industry: {} } }) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const activeFilterCount = Object.values(filters).filter(value => value !== "all" && value !== "").length;

  const clearFilters = () => { onFilterChange({ degree: "all", industry: "all", status: "all" }); };

  const getCountForOption = (type, value) => counts[type]?.[value] || 0;

  const pillStyle = "px-2 py-1 text-xs font-semibold border";
  const pillBorderRadius = { borderRadius: '4px' };
  const activePillClass = "bg-[var(--uf-orange)] text-white border-[var(--uf-orange)] shadow-md ring-2 ring-offset-1 ring-[var(--uf-orange)]/40 hover:bg-[var(--uf-orange)]/90";
  const inactivePillClass = "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400";

  const FilterContent = ({ isMobile = false }) => (
    <div className={`flex items-center ${isMobile ? 'flex-col gap-3 p-4' : 'flex-row gap-2'}`}>
      <span className="text-sm font-semibold text-slate-600 hidden md:inline">Filters:</span>
      <Popover><PopoverTrigger asChild><Button variant="outline" size="sm" className={`flex items-center gap-2 ${isMobile ? 'w-full justify-start' : ''} ${filters.degree !== "all" ? activePillClass : inactivePillClass} ${pillStyle}`} style={pillBorderRadius}><Users className="w-4 h-4" />Connection{filters.degree !== "all" && (<Badge variant="secondary" className="ml-1 bg-white/30 text-white text-xs px-1 py-0" style={pillBorderRadius}>{filters.degree}°</Badge>)}</Button></PopoverTrigger><PopoverContent className="w-48 p-1" style={{ fontFamily: 'Inter' }}>{[{ value: "all", label: "All Degrees" }, { value: "1", label: "1° Direct" }, { value: "2", label: "2° Friends" }, { value: "3", label: "3°+ Extended" }].map((degree) => (<Button key={degree.value} variant={filters.degree === degree.value ? "secondary" : "ghost"} size="sm" className="w-full justify-between px-2 py-1 h-8 text-xs" onClick={() => onFilterChange({ ...filters, degree: degree.value })}><span>{degree.label}</span><span className="text-xs text-slate-500">({getCountForOption('degree', degree.value)})</span></Button>))}</PopoverContent></Popover>
      <Select value={filters.industry} onValueChange={(value) => onFilterChange({ ...filters, industry: value })}><SelectTrigger className={`${isMobile ? 'w-full' : 'w-32'} ${filters.industry !== "all" ? activePillClass : inactivePillClass} ${pillStyle}`} style={pillBorderRadius}><SelectValue placeholder="Industry" /></SelectTrigger><SelectContent style={{ fontFamily: 'Inter' }}><SelectItem value="all">All Industries</SelectItem>{industries.map((industry) => (<SelectItem key={industry} value={industry}>{industry} ({getCountForOption('industry', industry)})</SelectItem>))}</SelectContent></Select>
      <Select value={filters.status || "all"} onValueChange={(value) => onFilterChange({ ...filters, status: value })}><SelectTrigger className={`${isMobile ? 'w-full' : 'w-28'} ${filters.status && filters.status !== "all" ? activePillClass : inactivePillClass} ${pillStyle}`} style={pillBorderRadius}><SelectValue placeholder="Status" /></SelectTrigger><SelectContent style={{ fontFamily: 'Inter' }}><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="boosted">Boosted</SelectItem><SelectItem value="featured">Featured</SelectItem></SelectContent></Select>
      {activeFilterCount > 0 && (<Button variant="ghost" size="sm" onClick={clearFilters} className={`text-slate-600 hover:text-slate-800 hover:bg-slate-100 ${isMobile ? 'w-full justify-center' : ''} ${pillStyle}`} style={pillBorderRadius}><X className="w-4 h-4 mr-1" />Clear ({activeFilterCount})</Button>)}
    </div>
  );

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60" style={{ marginTop: '8px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '16px', paddingRight: '16px' }}>
      <div className="hidden md:block"><FilterContent /></div>
      <div className="md:hidden">
        <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}><SheetTrigger asChild><Button variant="outline" className="w-full flex items-center justify-center gap-2 h-10 border-slate-300"><SlidersHorizontal className="w-4 h-4" />Filter Requests{activeFilterCount > 0 && (<Badge variant="secondary" className="ml-1 bg-[var(--uf-orange)] text-white text-xs px-2 py-1 rounded">{activeFilterCount}</Badge>)}</Button></SheetTrigger><SheetContent side="bottom" className="p-0"><SheetHeader className="p-4 border-b"><SheetTitle>Filter Requests</SheetTitle></SheetHeader><FilterContent isMobile /></SheetContent></Sheet>
      </div>
    </div>
  );
}