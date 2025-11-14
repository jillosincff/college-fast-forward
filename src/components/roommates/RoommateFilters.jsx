
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from '@/components/ui/input';
import { X, MapPin, DollarSign, Calendar, Home } from 'lucide-react';

export default function RoommateFilters({ filters = {}, onFiltersChange, compact = false }) {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      post_type: 'all',
      location: '',
      budget_min: '',
      budget_max: '',
      move_in_date: '',
      amenities: []
    });
  };

  const hasActiveFilters = filters.post_type !== 'all' || 
                          filters.location || 
                          filters.budget_min || 
                          filters.budget_max || 
                          filters.move_in_date || 
                          (filters.amenities && filters.amenities.length > 0);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-3 items-center">
        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.post_type === 'seeking_roommate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('post_type', filters.post_type === 'seeking_roommate' ? 'all' : 'seeking_roommate')}
            className="h-8 text-xs"
          >
            <Home className="w-3 h-3 mr-1" />
            Has a Place
          </Button>
          
          <Button
            variant={filters.post_type === 'seeking_room' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('post_type', filters.post_type === 'seeking_room' ? 'all' : 'seeking_room')}
            className="h-8 text-xs"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Looking to Team Up
          </Button>
        </div>

        {/* Location Search */}
        <div className="flex-1 min-w-[200px] max-w-[300px]">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Location..."
              value={filters.location || ''}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="pl-10 h-8 text-sm"
            />
          </div>
        </div>

        {/* Budget Range */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <Input
            placeholder="Min"
            type="number"
            value={filters.budget_min || ''}
            onChange={(e) => updateFilter('budget_min', e.target.value)}
            className="w-20 h-8 text-sm"
          />
          <span className="text-slate-400">–</span>
          <Input
            placeholder="Max"
            type="number"
            value={filters.budget_max || ''}
            onChange={(e) => updateFilter('budget_max', e.target.value)}
            className="w-20 h-8 text-sm"
          />
        </div>

        {/* Move-in Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <Input
            type="month"
            value={filters.move_in_date || ''}
            onChange={(e) => updateFilter('move_in_date', e.target.value)}
            className="h-8 text-sm w-36"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-slate-500 hover:text-slate-700"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    );
  }

  // Full filters for non-compact mode
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Situation Type */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">Situation</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filters.post_type === "all" ? "default" : "outline"}
              onClick={() => onFiltersChange(prev => ({ ...prev, post_type: "all" }))}
              className={`rounded-full text-xs ${filters.post_type === 'all' ? 'bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)]' : ''}`}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filters.post_type === "seeking_roommate" ? "default" : "outline"}
              onClick={() => onFiltersChange(prev => ({ ...prev, post_type: "seeking_roommate" }))}
              className={`rounded-full text-xs ${filters.post_type === 'seeking_roommate' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              Has a place
            </Button>
            <Button
              size="sm"
              variant={filters.post_type === "seeking_room" ? "default" : "outline"}
              onClick={() => onFiltersChange(prev => ({ ...prev, post_type: "seeking_room" }))}
              className={`rounded-full text-xs ${filters.post_type === 'seeking_room' ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              Looking to team up
            </Button>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-semibold text-slate-700 mb-3 block">
            Max Budget: ${filters.max_rent || 5000}/month
          </Label>
          <Slider 
            value={[filters.max_rent || 5000]} 
            onValueChange={(v) => onFiltersChange(prev => ({ ...prev, max_rent: v[0] }))} 
            max={5000} 
            min={500} 
            step={100} 
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>$500</span>
            <span>$5000+</span>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-700">Special Filters</Label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Switch 
                id="pet-friendly" 
                checked={filters.pet_friendly || false} 
                onCheckedChange={(c) => onFiltersChange(prev => ({ ...prev, pet_friendly: c }))}
                className="focus:ring-2 focus:ring-[var(--uf-blue)] focus:ring-offset-2"
              />
              <Label htmlFor="pet-friendly" className="text-sm font-medium text-slate-700">
                Pet Friendly Only
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch 
                id="parent-offered" 
                checked={filters.posted_by_parent || false} 
                onCheckedChange={(c) => onFiltersChange(prev => ({ ...prev, posted_by_parent: c }))}
                className="focus:ring-2 focus:ring-[var(--uf-blue)] focus:ring-offset-2"
              />
              <Label htmlFor="parent-offered" className="text-sm font-medium text-slate-700">
                Parent Offerings Only
              </Label>
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch 
                id="favorites-only" 
                checked={filters.show_favorites || false} 
                onCheckedChange={(c) => onFiltersChange(prev => ({ ...prev, show_favorites: c }))}
                className="focus:ring-2 focus:ring-[var(--uf-blue)] focus:ring-offset-2"
              />
              <Label htmlFor="favorites-only" className="text-sm font-medium text-slate-700">
                My Favorites Only
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
