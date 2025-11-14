import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { formatOpportunityType } from '@/components/utils/format';

export default function OpportunityFilters({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    remoteOnly: false,
    sort: 'newest'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      type: '',
      location: '',
      remoteOnly: false,
      sort: 'newest'
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.type || filters.location || filters.remoteOnly;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/80 shadow-sm mb-8 sticky top-20 z-40">
      <div className="space-y-4">
        {/* Primary filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search titles, companies, or tags..." 
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
          
          <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger><SelectValue placeholder="Opportunity Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Types</SelectItem>
              <SelectItem value="internship">{formatOpportunityType('internship')}</SelectItem>
              <SelectItem value="fulltime">{formatOpportunityType('fulltime')}</SelectItem>
              <SelectItem value="parttime">{formatOpportunityType('parttime')}</SelectItem>
              <SelectItem value="contract">{formatOpportunityType('contract')}</SelectItem>
              <SelectItem value="shadowing">{formatOpportunityType('shadowing')}</SelectItem>
              <SelectItem value="project">{formatOpportunityType('project')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
            <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>All Locations</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
            <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="closing">Closing Soon</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            More
          </Button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="remote-only"
                  checked={filters.remoteOnly}
                  onCheckedChange={(checked) => handleFilterChange('remoteOnly', checked)}
                />
                <Label htmlFor="remote-only" className="text-sm font-medium">
                  Remote only
                </Label>
              </div>
              
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}