import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, MapPin, Briefcase, DollarSign, Zap, Globe, Calendar } from 'lucide-react';
import FilterDropdown from './FilterDropdown';
import QuickFilterChip from './QuickFilterChip';
import { AnimatePresence, motion } from 'framer-motion';

export default function HorizontalFilterBar({
    searchQuery, setSearchQuery,
    typeFilter, setTypeFilter,
    locationFilter, setLocationFilter,
    salaryFilter, setSalaryFilter,
    quickFilters, setQuickFilters,
    clearFilters
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (typeFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    if (salaryFilter !== 'all') count++;
    count += quickFilters.length;
    return count;
  }, [searchQuery, typeFilter, locationFilter, salaryFilter, quickFilters]);

  const handleQuickFilterToggle = (id) => {
    setQuickFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const quickFilterOptions = [
    { id: 'remote', label: 'Remote', icon: Globe },
    { id: 'new', label: 'Posted This Week', icon: Zap },
    { id: 'entry_level', label: 'Entry Level', icon: Calendar },
  ];

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 md:gap-4 flex-wrap">
        <div className="flex-grow min-w-[250px] md:min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by role, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow"
            />
          </div>
        </div>

        <FilterDropdown
          value={typeFilter}
          onChange={setTypeFilter}
          icon={Briefcase}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'internship', label: 'Internships' },
            { value: 'job', label: 'Full-time Jobs' },
            { value: 'student_gig', label: 'Student Gigs' }
          ]}
        />
        <FilterDropdown
          value={locationFilter}
          onChange={setLocationFilter}
          icon={MapPin}
          options={[
            { value: 'all', label: 'Any Location' },
            { value: 'remote', label: 'Remote' },
            { value: 'florida', label: 'Florida' },
          ]}
        />
        <FilterDropdown
          value={salaryFilter}
          onChange={setSalaryFilter}
          icon={DollarSign}
          options={[
            { value: 'all', label: 'Any Salary' },
            { value: 'paid', label: 'Paid' },
            { value: 'high_salary', label: 'High Pay ($75k+)' },
          ]}
        />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 hidden md:inline">More Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickFilterOptions.map(filter => (
                  <QuickFilterChip
                    key={filter.id}
                    {...filter}
                    isActive={quickFilters.includes(filter.id)}
                    onToggle={handleQuickFilterToggle}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}