import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Briefcase, 
  Clock,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '@/components/context/UserContext';

// Debounce hook for search performance
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function EnhancedSearchBar({ onSearch, onFilterChange }) {
  const { preferences } = useUserContext();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false); // New state to control suggestions visibility
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    jobType: '',
    urgency: '',
    sortBy: 'recent'
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Popular searches for suggestions
  const popularSearches = [
    'Software Engineer',
    'Marketing Internship',
    'Finance',
    'Data Science',
    'Product Manager',
    'Consulting'
  ];

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Consulting', 
    'Marketing', 'Sales', 'Engineering', 'Design'
  ];

  const jobTypes = [
    { value: 'internship', label: 'Internships' },
    { value: 'full_time', label: 'Full Time' },
    { value: 'part_time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' }
  ];

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Update suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = popularSearches.filter(search =>
        search.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions(popularSearches.slice(0, 3));
    }
  }, [query]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== query) return; // Prevent initial trigger
    
    setIsSearching(true);
    onSearch(debouncedQuery);
    
    // Simulate search delay for UX
    setTimeout(() => setIsSearching(false), 500);
  }, [debouncedQuery, onSearch]);

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterUpdate = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      location: '',
      jobType: '',
      urgency: '',
      sortBy: 'recent'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'recent');

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false); // Hide suggestions after selection
  };

  // Handle input focus and blur
  const handleInputFocus = () => {
    setShowSuggestions(query.length === 0); // Only show for empty query
  };

  const handleInputBlur = () => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length === 0); // Show suggestions only when empty
  };

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
              isSearching ? 'text-blue-600 animate-pulse' : 'text-slate-400'
            }`} />
            <Input
              type="text"
              placeholder="Search for roles, companies, or skills..."
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="pl-10 pr-20 h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setSuggestions(popularSearches.slice(0, 3));
                    setShowSuggestions(false);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-8 ${hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}`}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-blue-600 text-white text-xs">
                    {Object.values(filters).filter(v => v && v !== 'recent').length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Suggestions - Fixed positioning and z-index */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                style={{ zIndex: 1000 }} // Ensure it's above other content
              >
                <div className="p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular searches
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-sm px-3 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-slate-50 rounded-lg border"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    Industry
                  </label>
                  <select
                    value={filters.industry}
                    onChange={(e) => handleFilterUpdate('industry', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Industries</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, State"
                    value={filters.location}
                    onChange={(e) => handleFilterUpdate('location', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Job Type
                  </label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterUpdate('jobType', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Urgency
                  </label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => handleFilterUpdate('urgency', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Requests</option>
                    <option value="urgent">Urgent</option>
                    <option value="interviewing">Interviewing Now</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterUpdate('sortBy', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="urgent">Most Urgent</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}