import { useState, useEffect, useMemo } from 'react';
import { Opportunity } from '@/entities/Opportunity';
import { Button } from '@/components/ui/button';
import { Bookmark, Search } from 'lucide-react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityCardSkeleton from '@/components/opportunities/OpportunityCardSkeleton';
import { navigate } from '@/components/utils/navigation';

// Helper hook to read from localStorage
const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setState(e.newValue ? JSON.parse(e.newValue) : defaultValue);
        } catch {
          setState(defaultValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, state, defaultValue]);

  return [state, setState];
};

export default function FavoritesPage() {
  const [savedOpportunityIds, setSavedOpportunityIds] = useLocalStorageState('gator_saved_opportunities', []);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOpportunities = async () => {
      setIsLoading(true);
      try {
        const fetchedOpportunities = await Opportunity.filter({}, '-created_date', 200);
        setAllOpportunities(fetchedOpportunities || []);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);
  
  const savedOpportunities = useMemo(() => {
    if (!allOpportunities.length || !savedOpportunityIds.length) {
      return [];
    }
    const savedSet = new Set(savedOpportunityIds);
    return allOpportunities.filter(opp => savedSet.has(opp.id));
  }, [allOpportunities, savedOpportunityIds]);
  
  const toggleSaveOpportunity = (opportunityId) => {
    setSavedOpportunityIds(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">My Favorite Opportunities</h1>
          </div>
          <p className="text-slate-600">
            This is your personal collection of saved jobs. They are saved on this browser.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => <OpportunityCardSkeleton key={index} />)}
          </div>
        ) : savedOpportunities.length > 0 ? (
          <div className="grid gap-4">
            {savedOpportunities.map((opp, index) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onToggleSave={toggleSaveOpportunity}
                isSaved={true}
                cardIndex={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed flex flex-col items-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">No Saved Opportunities Yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm">
              Click the bookmark icon on any job listing to save it here for later.
            </p>
            <Button 
              variant="default" 
              className="mt-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('Opportunities')}
            >
              Browse Opportunities
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}