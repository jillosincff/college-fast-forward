import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Opportunity } from '@/entities/Opportunity';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Grid3x3, List, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import OpportunityCardSkeleton from '@/components/opportunities/OpportunityCardSkeleton';
import ApplyModal from '@/components/opportunities/ApplyModal';
import OpportunityModal from '@/components/opportunities/OpportunityModal';
import ManageOpportunityModal from '@/components/opportunities/ManageOpportunityModal';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from '@/components/ui/checkbox';

const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
};

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  
  // Advanced filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [companySizeFilter, setCompanySizeFilter] = useState('all');
  const [salaryMinFilter, setSalaryMinFilter] = useState('');
  const [postedByFilter, setPostedByFilter] = useState('all');
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('card');
  
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  
  const [savedOpportunityIds, setSavedOpportunityIds] = useLocalStorageState('gator_saved_opportunities', []);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorageState('gator_recently_viewed', []);
  
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);

  const loadOpportunities = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedOpportunities = await Opportunity.filter({}, '-created_date', 200);
      const validOpportunities = (fetchedOpportunities || []).filter(opp => opp.title && opp.opportunity_type);
      setOpportunities(validOpportunities);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
      toast({
        title: "Failed to load opportunities",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadApplications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const [byId, byEmail] = await Promise.all([
        OpportunityApplication.filter({ applicant_id: user.id }).catch(() => []),
        OpportunityApplication.filter({ created_by: user.email }).catch(() => [])
      ]);
      
      const allApps = [...byId];
      const existingIds = new Set(byId.map(app => app.id));
      
      byEmail.forEach(app => {
        if (!existingIds.has(app.id)) {
          allApps.push(app);
        }
      });
      
      const appliedIds = [...new Set(allApps.map(app => app.opportunity_id))];
      setAppliedOpportunityIds(appliedIds);
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  }, [user]);

  useEffect(() => {
    loadOpportunities();
    loadApplications();
  }, [loadOpportunities, loadApplications]);

  useEffect(() => {
    if (!opportunities.length || !user) return;

    const hashPart = window.location.hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(hashPart);
    const manageId = urlParams.get('manage');
    const viewId = urlParams.get('view');
    
    if (manageId) {
      const oppToManage = opportunities.find(opp => opp.id === manageId);
      if (oppToManage && oppToManage.created_by === user.email) {
        setSelectedOpportunity(oppToManage);
        setShowManageModal(true);
        window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
      }
    } else if (viewId) {
      const oppToView = opportunities.find(opp => opp.id === viewId);
      if (oppToView) {
        setSelectedOpportunity(oppToView);
        setShowDetailsModal(true);
        window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
      }
    }
  }, [opportunities, user]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveQuickFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setLocationTypeFilter('all');
    setIndustryFilter('all');
    setCompanySizeFilter('all');
    setSalaryMinFilter('');
    setPostedByFilter('all');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeQuickFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    if (locationTypeFilter !== 'all') count++;
    if (industryFilter !== 'all') count++;
    if (companySizeFilter !== 'all') count++;
    if (salaryMinFilter) count++;
    if (postedByFilter !== 'all') count++;
    return count;
  }, [activeQuickFilter, typeFilter, locationFilter, locationTypeFilter, industryFilter, companySizeFilter, salaryMinFilter, postedByFilter]);

  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Quick filters
    if (activeQuickFilter === 'gator') {
      filtered = filtered.filter(opp => opp.posting_type === 'manual_entry' && opp.created_by);
    } else if (activeQuickFilter === 'internships') {
      filtered = filtered.filter(opp => opp.opportunity_type === 'internship');
    } else if (activeQuickFilter === 'remote') {
      filtered = filtered.filter(opp => opp.location_type === 'remote');
    } else if (activeQuickFilter === 'entry') {
      filtered = filtered.filter(opp => 
        opp.title?.toLowerCase().includes('entry') || 
        opp.title?.toLowerCase().includes('new grad') ||
        opp.description?.toLowerCase().includes('entry level')
      );
    } else if (activeQuickFilter === 'saved') {
      filtered = filtered.filter(opp => savedOpportunityIds.includes(opp.id));
    }

    // Search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(lowercasedQuery) ||
        (opp.org_name && opp.org_name.toLowerCase().includes(lowercasedQuery)) ||
        (opp.description && opp.description.toLowerCase().includes(lowercasedQuery)) ||
        (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)))
      );
    }

    // Advanced filters
    if (typeFilter !== 'all') {
      filtered = filtered.filter(opp => opp.opportunity_type === typeFilter);
    }

    if (locationFilter !== 'all') {
      if (locationFilter === 'florida') {
        filtered = filtered.filter(opp => opp.state?.toLowerCase() === 'fl' || opp.state?.toLowerCase() === 'florida');
      } else if (locationFilter === 'remote') {
        filtered = filtered.filter(opp => opp.location_type === 'remote');
      }
    }

    if (locationTypeFilter !== 'all') {
      filtered = filtered.filter(opp => opp.location_type === locationTypeFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(opp => 
        opp.tags?.some(tag => tag.toLowerCase().includes(industryFilter.toLowerCase()))
      );
    }

    if (companySizeFilter !== 'all') {
      // This would require company_size field on opportunities
      // For now, we can filter by some heuristics or skip
    }

    if (salaryMinFilter) {
      const minSalary = parseInt(salaryMinFilter);
      filtered = filtered.filter(opp => {
        const salary = opp.salary_min || opp.salary_max || (opp.hourly_wage ? opp.hourly_wage * 2080 : 0);
        return salary >= minSalary;
      });
    }

    if (postedByFilter !== 'all') {
      if (postedByFilter === 'gator') {
        filtered = filtered.filter(opp => opp.posting_type === 'manual_entry' && opp.created_by);
      } else if (postedByFilter === 'external') {
        filtered = filtered.filter(opp => opp.posting_type === 'shared_link');
      }
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'salary-high') {
      filtered.sort((a, b) => {
        const salaryA = a.salary_max || a.salary_min || (a.hourly_wage ? a.hourly_wage * 2080 : 0);
        const salaryB = b.salary_max || b.salary_min || (b.hourly_wage ? b.hourly_wage * 2080 : 0);
        return salaryB - salaryA;
      });
    } else if (sortBy === 'salary-low') {
      filtered.sort((a, b) => {
        const salaryA = a.salary_max || a.salary_min || (a.hourly_wage ? a.hourly_wage * 2080 : 0);
        const salaryB = b.salary_max || b.salary_min || (b.hourly_wage ? b.hourly_wage * 2080 : 0);
        return salaryA - salaryB;
      });
    } else if (sortBy === 'relevance' && user) {
      // AI-powered relevance matching based on user profile
      filtered.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Match by major
        if (user.major && a.tags?.some(tag => tag.toLowerCase().includes(user.major.toLowerCase()))) {
          scoreA += 3;
        }
        if (user.major && b.tags?.some(tag => tag.toLowerCase().includes(user.major.toLowerCase()))) {
          scoreB += 3;
        }

        // Match by location
        if (user.location && a.city && user.location.toLowerCase().includes(a.city.toLowerCase())) {
          scoreA += 2;
        }
        if (user.location && b.city && user.location.toLowerCase().includes(b.city.toLowerCase())) {
          scoreB += 2;
        }

        // Prioritize Gator network postings
        if (a.posting_type === 'manual_entry') scoreA += 1;
        if (b.posting_type === 'manual_entry') scoreB += 1;

        // Recent posts get slight boost
        const daysOldA = (Date.now() - new Date(a.created_date)) / (1000 * 60 * 60 * 24);
        const daysOldB = (Date.now() - new Date(b.created_date)) / (1000 * 60 * 60 * 24);
        if (daysOldA < 7) scoreA += 1;
        if (daysOldB < 7) scoreB += 1;

        return scoreB - scoreA;
      });
    }

    return filtered;
  }, [searchQuery, activeQuickFilter, typeFilter, locationFilter, locationTypeFilter, industryFilter, companySizeFilter, salaryMinFilter, postedByFilter, opportunities, sortBy, user, savedOpportunityIds]);
  
  const gatorNetworkJobs = useMemo(() => {
    return filteredOpportunities
      .filter(opp => opp.posting_type === 'manual_entry' && opp.created_by)
      .slice(0, 5);
  }, [filteredOpportunities]);

  const regularJobs = useMemo(() => {
    const gatorIds = new Set(gatorNetworkJobs.map(o => o.id));
    return filteredOpportunities.filter(opp => !gatorIds.has(opp.id));
  }, [filteredOpportunities, gatorNetworkJobs]);

  const visibleJobs = useMemo(() => {
    return regularJobs.slice(0, visibleCount);
  }, [regularJobs, visibleCount]);

  const handleApply = async (opportunity) => {
    if (!user) {
      navigate('LandingPage');
      return;
    }

    if (opportunity.posting_type === 'shared_link') {
      const externalUrl = opportunity.external_apply_url || opportunity.contact_url;
      
      if (externalUrl) {
        // Open the URL immediately for mobile compatibility
        window.location.href = externalUrl;
        
        // Track application in background
        try {
          const applicationData = {
            opportunity_id: opportunity.id,
            applicant_id: user.id,
            method: 'external',
            status: 'applied',
            opportunity_title: opportunity.title,
            opportunity_company: opportunity.org_name,
            opportunity_type: opportunity.opportunity_type,
            opportunity_deleted: false
          };
          
          OpportunityApplication.create(applicationData).catch(err => 
            console.error('Failed to track external application:', err)
          );
          
          setAppliedOpportunityIds(prev => [...new Set([...prev, opportunity.id])]);
        } catch (error) {
          console.error('Failed to track external application:', error);
        }
      }
      return;
    }

    setSelectedOpportunity(opportunity);
    setShowApplyModal(true);
  };

  const handleViewDetails = (opportunity) => {
    const updatedRecentlyViewed = [
        { ...opportunity, viewedAt: new Date().toISOString() },
        ...recentlyViewed.filter(item => item.id !== opportunity.id)
    ].slice(0, 10);
    setRecentlyViewed(updatedRecentlyViewed);
    
    setSelectedOpportunity(opportunity);
    setShowDetailsModal(true);
  };
  
  const toggleSaveOpportunity = (opportunityId) => {
    setSavedOpportunityIds(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );
  };

  const handleApplicationSuccess = useCallback((opportunityId) => {
    setAppliedOpportunityIds(prev => [...new Set([...prev, opportunityId])]);
    loadApplications();
  }, [loadApplications]);

  const handleDeleteOpportunity = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return;
    }

    try {
      await Opportunity.delete(opportunityId);
      toast({
        title: "✅ Deleted!",
        description: "Your opportunity has been deleted.",
      });
      setShowManageModal(false);
      setSelectedOpportunity(null);
      await loadOpportunities();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOpportunity = async (opportunityId, updates) => {
    try {
      await Opportunity.update(opportunityId, updates);
      toast({
        title: "✅ Updated!",
        description: "Your opportunity has been updated successfully.",
      });
      setShowManageModal(false);
      setSelectedOpportunity(null);
      await loadOpportunities();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      {selectedOpportunity && showApplyModal && (
        <ApplyModal 
          isOpen={showApplyModal} 
          onClose={() => setShowApplyModal(false)} 
          opportunity={selectedOpportunity} 
          user={user}
          onSuccess={() => handleApplicationSuccess(selectedOpportunity.id)}
        />
      )}
      {selectedOpportunity && showDetailsModal && (
        <OpportunityModal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)} 
          opportunity={selectedOpportunity} 
          onApply={() => handleApply(selectedOpportunity)} 
          hasApplied={appliedOpportunityIds.includes(selectedOpportunity.id)}
        />
      )}
      {selectedOpportunity && showManageModal && (
        <ManageOpportunityModal
          isOpen={showManageModal}
          onClose={() => {
            setShowManageModal(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
          onDelete={handleDeleteOpportunity}
          onUpdate={handleUpdateOpportunity}
          applicationsCount={appliedOpportunityIds.filter(id => id === selectedOpportunity.id).length}
        />
      )}

      {/* Enhanced Search Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Title and Post Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Find Opportunities</h1>
              <p className="text-slate-600 mt-1">Discover internships, jobs, and gigs from the Gator network</p>
            </div>
            <Button
              onClick={() => navigate('PostOpportunity')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hidden sm:flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Post an Opportunity
            </Button>
          </div>

          {/* Main Search */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search jobs, companies, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 focus:bg-white transition-all text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Sheet open={showFiltersSheet} onOpenChange={setShowFiltersSheet}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="px-6 py-4 h-auto rounded-xl font-semibold border-2 relative"
                >
                  <SlidersHorizontal className="w-5 h-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Advanced Filters</SheetTitle>
                  <SheetDescription>
                    Refine your search to find the perfect opportunity
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6">
                  {/* Job Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Job Type</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="student_gig">Student Gig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Type */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Work Location</label>
                    <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="onsite">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Geographic Location */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Geographic Area</label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Areas</SelectItem>
                        <SelectItem value="florida">Florida</SelectItem>
                        <SelectItem value="remote">Remote Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Industry</label>
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Salary */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Minimum Salary</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50000"
                      value={salaryMinFilter}
                      onChange={(e) => setSalaryMinFilter(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Posted By */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Posted By</label>
                    <Select value={postedByFilter} onValueChange={setPostedByFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="gator">🐊 Gator Network</SelectItem>
                        <SelectItem value="external">External Partners</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setShowFiltersSheet(false)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <Button
              variant={activeQuickFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveQuickFilter('all')}
              className={`rounded-full px-5 py-2 font-medium ${
                activeQuickFilter === 'all' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
            >
              All Jobs
            </Button>
            <Button
              variant={activeQuickFilter === 'gator' ? 'default' : 'outline'}
              onClick={() => setActiveQuickFilter('gator')}
              className={`rounded-full px-5 py-2 font-medium ${
                activeQuickFilter === 'gator' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
            >
              🐊 Gator Network
            </Button>
            <Button
              variant={activeQuickFilter === 'saved' ? 'default' : 'outline'}
              onClick={() => setActiveQuickFilter('saved')}
              className={`rounded-full px-5 py-2 font-medium ${
                activeQuickFilter === 'saved' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
            >
              ⭐ Saved ({savedOpportunityIds.length})
            </Button>
            <Button
              variant={activeQuickFilter === 'internships' ? 'default' : 'outline'}
              onClick={() => setActiveQuickFilter('internships')}
              className={`rounded-full px-5 py-2 font-medium ${
                activeQuickFilter === 'internships' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
            >
              Internships
            </Button>
            <Button
              variant={activeQuickFilter === 'remote' ? 'default' : 'outline'}
              onClick={() => setActiveQuickFilter('remote')}
              className={`rounded-full px-5 py-2 font-medium ${
                activeQuickFilter === 'remote' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
            >
              Remote
            </Button>
            <Button
              variant={activeQuickFilter === 'entry' ? 'default' : 'outline'}
              onClick={() => setActiveQuickFilter('entry')}
              className={`rounded-full px-5 py-2 font-medium ${
                activeQuickFilter === 'entry' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50'
              }`}
            >
              Entry Level
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-600">Active filters:</span>
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Type: {typeFilter}
                  <button onClick={() => setTypeFilter('all')} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {locationTypeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Location: {locationTypeFilter}
                  <button onClick={() => setLocationTypeFilter('all')} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {industryFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Industry: {industryFilter}
                  <button onClick={() => setIndustryFilter('all')} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {salaryMinFilter && (
                <Badge variant="secondary" className="gap-1">
                  Min Salary: ${salaryMinFilter}
                  <button onClick={() => setSalaryMinFilter('')} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center pb-6 border-b-2 border-slate-200">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">
              {filteredOpportunities.length.toLocaleString()} Opportunities Found
            </h2>
            {user?.major && sortBy === 'relevance' && (
              <p className="text-slate-600 text-base font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Personalized for {user.major} • {user.graduation_year ? `Class of '${user.graduation_year.toString().slice(-2)}` : 'Junior Level'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">🎯 Best Match</option>
              <option value="recent">📅 Most Recent</option>
              <option value="salary-high">💰 Salary: High to Low</option>
              <option value="salary-low">💸 Salary: Low to High</option>
            </select>

            <div className="hidden md:flex border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'card' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium transition-colors border-l border-slate-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Gator Network Featured Section */}
        {gatorNetworkJobs.length > 0 && activeQuickFilter === 'all' && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900">
                Gator Network Exclusives
              </h3>
              <Badge className="bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-bold uppercase">
                Alumni Posted
              </Badge>
            </div>
            
            {isLoading ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <OpportunityCardSkeleton key={`skeleton-gator-${index}`} />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {gatorNetworkJobs.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onApply={handleApply}
                    onViewDetails={handleViewDetails}
                    onToggleSave={toggleSaveOpportunity}
                    isSaved={savedOpportunityIds.includes(opp.id)}
                    hasApplied={appliedOpportunityIds.includes(opp.id)}
                    isEditable={user && opp.created_by === user.email}
                    onEdit={() => {
                      setSelectedOpportunity(opp);
                      setShowManageModal(true);
                    }}
                    isFeatured={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Opportunities Section */}
        <div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">
              {activeQuickFilter === 'saved' ? 'Saved Opportunities' : 'All Opportunities'}
            </h3>
            <span className="text-slate-500 text-base font-medium">
              {regularJobs.length} jobs
            </span>
          </div>
          
          {isLoading ? (
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <OpportunityCardSkeleton key={`skeleton-regular-${index}`} />
              ))}
            </div>
          ) : visibleJobs.length > 0 ? (
            <div className="space-y-5">
              <AnimatePresence>
                {visibleJobs.map((opp, index) => (
                  <motion.div
                    key={opp.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <OpportunityCard
                      opportunity={opp}
                      onApply={handleApply}
                      onViewDetails={handleViewDetails}
                      onToggleSave={toggleSaveOpportunity}
                      isSaved={savedOpportunityIds.includes(opp.id)}
                      hasApplied={appliedOpportunityIds.includes(opp.id)}
                      isEditable={user && opp.created_by === user.email}
                      onEdit={() => {
                        setSelectedOpportunity(opp);
                        setShowManageModal(true);
                      }}
                      cardIndex={index}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No Opportunities Found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters or check back later.</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && visibleJobs.length < regularJobs.length && (
          <div className="text-center pt-10 mt-10 border-t-2 border-slate-200">
            <Button
              onClick={handleLoadMore}
              className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-2 border-slate-300 hover:from-slate-200 hover:to-slate-300 px-8 py-4 rounded-xl font-semibold mb-3"
            >
              Load More Opportunities
            </Button>
            <p className="text-slate-500 text-sm font-medium">
              Showing {visibleCount} of {regularJobs.length} results
            </p>
          </div>
        )}

        {/* FAB: Post Opportunity - Mobile Only */}
        <button
          onClick={() => navigate('PostOpportunity')}
          className="sm:hidden fixed bottom-8 right-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-110 z-40 touch-manipulation"
          aria-label="Post an opportunity"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}