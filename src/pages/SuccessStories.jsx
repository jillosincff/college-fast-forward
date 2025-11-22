
import React, { useState, useEffect, useMemo } from 'react';
import { SuccessStory } from '@/entities/SuccessStory';
import { Button } from '@/components/ui/button';
import StoryCard from '../components/stories/StoryCard';
import SubmissionModal from '../components/stories/SubmissionModal';
import { Award, Sparkles, Filter } from 'lucide-react'; // Updated Lucide imports as per outline
import { motion, AnimatePresence } from 'framer-motion';
import StoryFilters from '@/components/stories/StoryFilters'; // New import for StoryFilters

// A simple mock for useAuth, assuming it would provide user information.
// In a real application, this would come from an authentication context.
const useAuth = () => {
  // Replace with actual authentication context in a real app
  return {
    user: { id: 'test-user', name: 'Test User' }, // Example user data
    // isAuthenticated: true,
    // login: () => {},
    // logout: () => {}
  };
};

export default function SuccessStories() {
  const { user } = useAuth(); // Use the useAuth hook
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false); // Renamed from isModalOpen
  const [filters, setFilters] = useState({ type: 'All' }); // New state for filters

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      // FIX: Only fetch stories that are approved.
      const approvedStories = await SuccessStory.filter({ is_approved: true }, '-created_date');
      setStories(approvedStories || []);
    } catch (error) {
      console.error("Error loading success stories:", error);
    }
    setIsLoading(false);
  };
  
  // Filter stories based on the current filters state
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      if (filters.type === 'All') return true;
      return story.story_type === filters.type;
    });
  }, [stories, filters]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header Section */}
      <header className="bg-gradient-to-r from-[var(--uf-blue)] to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
            className="inline-block p-4 bg-white/20 rounded-full mb-4"
          >
            <Award className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Gator Success Stories</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg opacity-90">
            See how the Gator Nation helps its own. Real stories from students and alumni who found their next opportunity right here.
          </p>
        </div>
      </header>
      
      {/* Main Content Section */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filter and Share Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <StoryFilters onFilterChange={setFilters} currentFilter={filters.type} />
          <Button
            onClick={() => setShowSubmissionModal(true)}
            className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-bold w-full md:w-auto"
            aria-label="Share your success story"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Share Your Story
          </Button>
        </div>
        
        {/* Story Grid / Loading / No Stories */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Loading skeletons */}
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredStories.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <StoryCard story={story} /> {/* Removed index prop as it was not used by StoryCard in previous version and not specified in outline */}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">No Stories Found</h3>
            <p className="text-slate-500 mt-2">
              There are no stories matching your current filter. Try selecting another category!
            </p>
          </div>
        )}
      </main>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && (
          <SubmissionModal
            isOpen={showSubmissionModal}
            onClose={() => setShowSubmissionModal(false)}
            onStorySubmitted={() => {
              loadStories(); // Reload stories after successful submission
              setShowSubmissionModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
