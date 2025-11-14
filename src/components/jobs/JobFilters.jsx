
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Marketing",
  "Consulting", "Real Estate", "Non-Profit", "Government", "Media",
  "Retail", "Manufacturing", "Other"
];

const JOB_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "internship", label: "Internship" }
];

export default function JobFilters({ onFilterChange, initialFilters }) {
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      industry: "all",
      // Ensure the reset value for job_type is valid after the change
      // If "all" is still desired, it should remain. If not, pick a default from the new list.
      // Based on the existing "all" option in SelectContent, it should remain valid.
      job_type: "all", 
      posted_by_parent: false
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({...prev, [field]: value}));
  };

  const handleParentToggle = (checked) => {
    setLocalFilters(prev => ({...prev, posted_by_parent: checked}));
  };

  return (
    <motion.div 
      className="p-6 bg-white border-b border-slate-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor="search" className="text-xs font-medium text-slate-600 mb-2 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search"
              placeholder="Search by job title or keyword"
              className="pl-8 h-9 text-sm"
              value={localFilters.search}
              onChange={(e) => handleChange("search", e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-600 mb-2 block">
            Industry
          </label>
          <Select
            value={localFilters.industry}
            onValueChange={(value) => handleChange("industry", value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select an industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry.toLowerCase().replace(/\s/g, '_')}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-2 block">
            Job Type
          </label>
          <Select
            value={localFilters.job_type}
            onValueChange={(value) => handleChange("job_type", value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Job Types</SelectItem>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 pt-2 self-center">
          <Switch
            id="parent-sponsored"
            checked={localFilters.posted_by_parent}
            onCheckedChange={handleParentToggle}
            aria-label="Filter by parent sponsored posts"
          />
          <Label htmlFor="parent-sponsored" className="text-sm font-medium text-slate-700">
            Parent Sponsored
          </Label>
        </div>

      </div>
      <div className="flex justify-end mt-4 gap-2">
        <Button variant="ghost" onClick={handleReset}>Reset</Button>
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </motion.div>
  );
}
