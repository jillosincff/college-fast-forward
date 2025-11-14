import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuickFilterChip = ({ label, isActive, onClick, count }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative overflow-hidden px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActive 
        ? 'bg-[var(--uf-blue)] text-white shadow-lg' 
        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`ml-2 text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
        {count}
      </span>
    )}
    {isActive && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: [-100, 100] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    )}
  </motion.button>
);

export default function FilterBar({ filters, onFiltersChange }) {
  const activeFiltersCount = (
    (filters.role_type?.length || 0) + 
    (filters.work_mode?.length || 0) +
    (filters.search ? 1 : 0) +
    (filters.location ? 1 : 0)
  );

  const quickFilters = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'trending', label: '🔥 Trending', count: 12 },
    { key: 'internship', label: '🎓 Internships', count: 34 },
    { key: 'full_time', label: '💼 Full-time', count: 28 },
    { key: 'remote', label: '🖥 Remote', count: 45 },
    { key: 'urgent', label: '⏱ Urgent', count: 7 }
  ];

  const handleQuickFilter = (filterKey) => {
    if (filterKey === 'all') {
      onFiltersChange({ sort: 'recent' });
    } else if (filterKey === 'trending') {
      onFiltersChange({ ...filters, sort: 'trending' });
    } else if (['internship', 'full_time'].includes(filterKey)) {
      const newRoleTypes = filters.role_type?.includes(filterKey) 
        ? filters.role_type.filter(t => t !== filterKey)
        : [...(filters.role_type || []), filterKey];
      onFiltersChange({ ...filters, role_type: newRoleTypes });
    } else if (filterKey === 'remote') {
      const newWorkModes = filters.work_mode?.includes('remote')
        ? filters.work_mode.filter(m => m !== 'remote')
        : [...(filters.work_mode || []), 'remote'];
      onFiltersChange({ ...filters, work_mode: newWorkModes });
    } else if (filterKey === 'urgent') {
      onFiltersChange({ ...filters, urgency: filters.urgency === 'Urgent' ? undefined : 'Urgent' });
    }
  };

  const isQuickFilterActive = (filterKey) => {
    if (filterKey === 'all') return !filters.sort || filters.sort === 'recent';
    if (filterKey === 'trending') return filters.sort === 'trending';
    if (['internship', 'full_time'].includes(filterKey)) {
      return filters.role_type?.includes(filterKey) || false;
    }
    if (filterKey === 'remote') return filters.work_mode?.includes('remote') || false;
    if (filterKey === 'urgent') return filters.urgency === 'Urgent';
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-white rounded-2xl p-4 shadow-sm border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search requests, industries, names..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 border-0 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={filters.sort || 'recent'}
            onValueChange={(value) => onFiltersChange({ ...filters, sort: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">🕒 Newest</SelectItem>
              <SelectItem value="trending">🔥 Trending</SelectItem>
              <SelectItem value="featured">✨ Featured</SelectItem>
            </SelectContent>
          </Select>

          <AnimatePresence>
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({ sort: 'recent' })}
                  className="gap-2"
                >
                  <X className="w-3 h-3" />
                  Clear ({activeFiltersCount})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <QuickFilterChip
            key={filter.key}
            label={filter.label}
            count={filter.count}
            isActive={isQuickFilterActive(filter.key)}
            onClick={() => handleQuickFilter(filter.key)}
          />
        ))}
      </div>
    </div>
  );
}