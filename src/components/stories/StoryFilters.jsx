import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter } from 'lucide-react';

const storyTypes = ["All", "Job", "Internship", "Roommate", "Career Change", "Mentorship", "Other"];

export default function StoryFilters({ onFilterChange }) {
  const [activeFilter, setActiveFilter] = useState('All');

  const handleFilterClick = (type) => {
    setActiveFilter(type);
    onFilterChange({ type });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap bg-slate-100 p-2 rounded-lg">
      <ListFilter className="w-5 h-5 text-slate-500 ml-2 hidden sm:block" />
      {storyTypes.map((type) => (
        <Button
          key={type}
          variant="ghost"
          size="sm"
          onClick={() => handleFilterClick(type)}
          className={`transition-colors duration-200 ${
            activeFilter === type
              ? 'bg-white text-[var(--uf-blue)] font-semibold shadow'
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          aria-pressed={activeFilter === type}
        >
          {type}
        </Button>
      ))}
    </div>
  );
}