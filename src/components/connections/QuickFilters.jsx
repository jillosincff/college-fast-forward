import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function QuickFilters({ onFilterChange, jobTypes = [], industries = [] }) {
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  const handleJobTypeChange = (jobType, checked) => {
    const newSelected = checked 
      ? [...selectedJobTypes, jobType]
      : selectedJobTypes.filter(t => t !== jobType);
    
    setSelectedJobTypes(newSelected);
    onFilterChange({
      job_type: newSelected,
      target_industry: selectedIndustries
    });
  };

  const handleIndustryChange = (industry, checked) => {
    const newSelected = checked 
      ? [...selectedIndustries, industry]
      : selectedIndustries.filter(i => i !== industry);
    
    setSelectedIndustries(newSelected);
    onFilterChange({
      job_type: selectedJobTypes,
      target_industry: newSelected
    });
  };

  const clearAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedIndustries([]);
    onFilterChange({
      job_type: [],
      target_industry: []
    });
  };

  const hasActiveFilters = selectedJobTypes.length > 0 || selectedIndustries.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filters:</span>
      </div>

      {/* Job Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Job Type
            {selectedJobTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                {selectedJobTypes.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Job Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Array.isArray(jobTypes) && jobTypes.map((jobType) => (
            <DropdownMenuCheckboxItem
              key={jobType.id}
              checked={selectedJobTypes.includes(jobType.id)}
              onCheckedChange={(checked) => handleJobTypeChange(jobType.id, checked)}
            >
              {jobType.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Industry Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Industry
            {selectedIndustries.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                {selectedIndustries.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Industry</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Array.isArray(industries) && industries.map((industry) => (
            <DropdownMenuCheckboxItem
              key={industry}
              checked={selectedIndustries.includes(industry)}
              onCheckedChange={(checked) => handleIndustryChange(industry, checked)}
            >
              {industry}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filters Display */}
      {selectedJobTypes.map((jobType) => {
        const jobTypeObj = jobTypes.find(jt => jt.id === jobType);
        return (
          <Badge key={jobType} variant="secondary" className="flex items-center gap-1">
            {jobTypeObj?.label || jobType}
            <X 
              className="w-3 h-3 cursor-pointer hover:text-red-500" 
              onClick={() => handleJobTypeChange(jobType, false)}
            />
          </Badge>
        );
      })}

      {selectedIndustries.map((industry) => (
        <Badge key={industry} variant="secondary" className="flex items-center gap-1">
          {industry}
          <X 
            className="w-3 h-3 cursor-pointer hover:text-red-500" 
            onClick={() => handleIndustryChange(industry, false)}
          />
        </Badge>
      ))}

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAllFilters}
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}