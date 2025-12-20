import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Briefcase, MapPin, X, Frown, GraduationCap, Heart, Award, Filter, Crown } from 'lucide-react';
import UserCard from '@/components/directory/UserCard';
import MessageUserModal from '@/components/directory/MessageUserModal';
import ProfileModal from '@/components/directory/ProfileModal';
import { navigate } from '@/components/utils/navigation';
import logger from '@/components/utils/logger';
import { useAccessControl } from '@/components/access/useAccessControl';

// --- Helper Component: Moved outside the main component ---
const ErrorState = ({ error, onRetry }) => (
  <div className="text-center py-16 col-span-full bg-white rounded-lg shadow-md">
    <div className="inline-block p-4 bg-red-100 rounded-full mb-4">
      <Frown className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-xl font-semibold text-red-800">Oops! Something went wrong.</h3>
    <p className="text-red-600 mt-2 max-w-md mx-auto">
      We couldn't load the directory. This might be a temporary issue.
    </p>
    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
    <div className="mt-6 space-x-4">
      <Button onClick={onRetry} variant="secondary">
        Try Again
      </Button>
      <Button onClick={() => navigate('Dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  </div>
);


export default function GatorDirectory() {
  const { user } = useAuth();
  const accessInfo = useAccessControl(user);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ 
    members: 0, 
    responseRate: 95, 
    connections: 1247,
    students: 0,
    alumni: 0,
    parents: 0,
    gators: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    persona: 'all', 
    industry: 'all',
    expertise: 'all',
    canProvideReferrals: false,
    waysToHelp: 'all'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMessageModalOpen, setMessageModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadDirectoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await base44.functions.invoke('getDirectoryUsers', {});
      
      const responseData = response?.data;
      if (!responseData || !Array.isArray(responseData.data)) {
        throw new Error(responseData?.details || 'Invalid data from server.');
      }
      
      const validUsers = responseData.data.filter(u => u && u.full_name && u.persona);
      setAllUsers(validUsers);
      
      // Calculate persona breakdown
      const studentCount = validUsers.filter(u => u.persona === 'student' || u.persona === 'gator').length;
      const alumniCount = validUsers.filter(u => u.persona === 'alumni').length;
      const parentCount = validUsers.filter(u => u.persona === 'parent').length;
      
      setStats(prev => ({ 
        ...prev, 
        members: validUsers.length,
        students: studentCount,
        alumni: alumniCount,
        parents: parentCount,
        gators: studentCount + alumniCount
      }));
      logger.info(`[GatorDirectory] Loaded ${validUsers.length} users.`);

    } catch (err) {
      logger.error("[GatorDirectory] Failed to load users", { error: err });
      setError(err.message || 'Please try again in a few minutes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDirectoryData();
  }, [loadDirectoryData]);

  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(allUsers.map(u => u.industry).filter(Boolean))];
    return uniqueIndustries.sort();
  }, [allUsers]);

  const expertiseAreas = useMemo(() => {
    const allExpertise = allUsers
      .filter(u => u.expertise_areas && u.expertise_areas.length > 0)
      .flatMap(u => u.expertise_areas);
    return [...new Set(allExpertise)].sort();
  }, [allUsers]);

  // Normalize ways_to_help values to display-friendly format
  // These match the IDs from AlumniStep2Expertise onboarding
  const normalizeWayToHelp = (value) => {
    if (!value) return value;
    const lowercaseValue = value.toLowerCase();
    // Map all variations to consistent display names
    const mappings = {
      // From onboarding (AlumniStep2Expertise)
      'introductions': 'Introductions',
      'resume_feedback': 'Resume Review',
      'career_advice': 'Career Advice',
      'interview_prep': 'Interview Prep',
      'job_leads': 'Job Leads',
      'industry_insights': 'Industry Insights',
      // Legacy/alternate values that might exist
      'introduce': 'Introductions',
      'share_leads': 'Job Leads',
      'resume_review': 'Resume Review',
      'mock_interview': 'Interview Prep',
      'job_referral': 'Job Leads',
      'networking': 'Introductions',
      'mentorship': 'Career Advice',
    };
    return mappings[lowercaseValue] || value;
  };

  const waysToHelpOptions = useMemo(() => {
    const allWaysToHelp = allUsers
      .filter(u => u.ways_to_help && u.ways_to_help.length > 0)
      .flatMap(u => u.ways_to_help)
      .map(normalizeWayToHelp);
    return [...new Set(allWaysToHelp)].filter(Boolean).sort();
  }, [allUsers]);

  useEffect(() => {
    let users = [...allUsers];

    // Sort by access level: Premium/Founding first, then free users at bottom
    users.sort((a, b) => {
      // Premium users (founding, subscribed, or parents) go first
      const aIsPremium = a.is_founding_member || 
                        a.subscription_status === 'active' || 
                        a.subscription_tier === 'lifetime_family' ||
                        a.persona === 'parent';
      const bIsPremium = b.is_founding_member || 
                        b.subscription_status === 'active' || 
                        b.subscription_tier === 'lifetime_family' ||
                        b.persona === 'parent';
      
      if (aIsPremium && !bIsPremium) return -1;
      if (!aIsPremium && bIsPremium) return 1;
      
      // Within premium tier, founding members go first
      if (a.is_founding_member && !b.is_founding_member) return -1;
      if (!a.is_founding_member && b.is_founding_member) return 1;
      
      return 0;
    });

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      users = users.filter(user =>
        user.full_name?.toLowerCase().includes(lowercasedTerm) ||
        user.major?.toLowerCase().includes(lowercasedTerm) ||
        user.company?.toLowerCase().includes(lowercasedTerm) ||
        user.job_title?.toLowerCase().includes(lowercasedTerm) ||
        user.expertise_areas?.some(e => e.toLowerCase().includes(lowercasedTerm)) ||
        user.mentorship_topics?.some(m => m.toLowerCase().includes(lowercasedTerm))
      );
    }

    if (filters.persona && filters.persona !== 'all') {
      users = users.filter(user => user.persona === filters.persona);
    }

    if (filters.industry && filters.industry !== 'all') {
      users = users.filter(user => user.industry === filters.industry);
    }

    if (filters.expertise && filters.expertise !== 'all') {
      users = users.filter(user => 
        user.expertise_areas?.includes(filters.expertise)
      );
    }

    if (filters.waysToHelp && filters.waysToHelp !== 'all') {
      users = users.filter(user =>
        user.ways_to_help?.some(w => normalizeWayToHelp(w) === filters.waysToHelp)
      );
    }

    if (filters.canProvideReferrals) {
      users = users.filter(user => user.can_provide_referrals === true);
    }

    setFilteredUsers(users);
  }, [searchTerm, filters, allUsers]);

  const handleMessageUser = (user) => {
    setSelectedUser(user);
    setMessageModalOpen(true);
  };
  
  const handleViewProfile = (userId) => {
    setSelectedProfileId(userId);
    setProfileModalOpen(true);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ 
      persona: 'all', 
      industry: 'all',
      expertise: 'all',
      canProvideReferrals: false,
      waysToHelp: 'all'
    });
  };
  
  const hasActiveFilters = searchTerm || 
    filters.persona !== 'all' || 
    filters.industry !== 'all' || 
    filters.expertise !== 'all' ||
    filters.waysToHelp !== 'all' ||
    filters.canProvideReferrals;

  const isStudent = user?.persona === 'gator';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A1F3D' }}>
      {/* Hero Section - Gator Stadium Night Sky */}
      <div className="relative text-white py-20 px-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #001540 0%, #0021A5 50%, #002157 100%)',
      }}>
        {/* Stadium crowd texture overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        
        {/* Atmospheric glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-3 leading-tight text-white tracking-tight">
              Your Gator Network
            </h1>
            
            {/* Subtitle with emphasis */}
            <p className="text-xl md:text-2xl mb-8 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-white/90 font-medium">Invite-Only</span>
              <span className="text-white/50">•</span>
              <span className="text-[#FA4616] font-semibold">Parents open doors</span>
            </p>
            
            {/* Big Counter Pills */}
            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              {/* Gators Pill */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition"></div>
                <div className="relative px-8 py-4 bg-[#0021A5] rounded-full border-2 border-blue-400/50 shadow-xl">
                  <div className="text-4xl font-bold text-white mb-1">{loading ? '...' : stats.gators}</div>
                  <div className="text-sm text-blue-200 font-medium uppercase tracking-wide">Gators</div>
                </div>
              </div>
              
              {/* Parents Pill with BIGGER Glowing Crown */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur opacity-40 group-hover:opacity-60 transition"></div>
                <div className="relative px-8 py-4 bg-[#FA4616] rounded-full border-2 border-orange-400/50 shadow-xl">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div className="relative">
                      <div className="absolute inset-0 blur-sm">
                        <Crown className="w-8 h-8 text-yellow-300" />
                      </div>
                      <Crown className="w-8 h-8 text-yellow-300 relative drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                    </div>
                    <div className="text-4xl font-bold text-white">{loading ? '...' : stats.parents}</div>
                  </div>
                  <div className="text-sm text-orange-100 font-medium uppercase tracking-wide">Parents</div>
                </div>
              </div>
            </div>

            {/* ALWAYS show Founding Gators banner */}
            {!loading && (
              <div className="mt-8 inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <p className="text-white/90 text-sm font-medium">
                  Only <span className="text-[#FA4616] font-bold">{stats.members}</span> Founding Gators — be next
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className={`sticky top-0 z-100 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-none'
      }`} style={{ zIndex: 100 }}>
        <div className="bg-white px-4 sm:px-6 lg:px-8 transition-all duration-300" style={{
          padding: isScrolled ? '12px 2rem' : '1.5rem 2rem'
        }}>
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 ${
                isScrolled ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
              <Input
                id="search-directory"
                placeholder="Search parents & alumni by name, company, industry, expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 transition-all duration-300 border-2 border-slate-300 focus:border-[#0021A5] ${
                  isScrolled ? 'h-10 text-sm' : 'h-12 text-base'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          
          {/* Filters Bar - Scrolls Normally */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8">
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-600 font-medium">
                💡 <strong>Tip:</strong> Use search to find Gators by name, company, or skills. Filter by role to find parents/alumni. Click a profile to request an intro!
              </p>
            </div>
            
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="filter-persona" className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <Select value={filters.persona} onValueChange={(value) => setFilters(f => ({ ...f, persona: value }))}>
                  <SelectTrigger id="filter-persona" className="h-11">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="filter-industry" className="block text-sm font-medium text-slate-700 mb-1">
                  Industry
                </label>
                <Select value={filters.industry} onValueChange={(value) => setFilters(f => ({ ...f, industry: value }))}>
                  <SelectTrigger id="filter-industry" className="h-11">
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full h-11"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters - Collapsible */}
            {showAdvancedFilters && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expertiseAreas.length > 0 && (
                    <div>
                      <label htmlFor="filter-expertise" className="block text-sm font-medium text-slate-700 mb-1">
                        <Award className="w-4 h-4 inline mr-1" />
                        Expertise Area
                      </label>
                      <Select value={filters.expertise} onValueChange={(value) => setFilters(f => ({ ...f, expertise: value }))}>
                        <SelectTrigger id="filter-expertise" className="h-11">
                          <SelectValue placeholder="Any expertise" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Expertise Areas</SelectItem>
                          {expertiseAreas.map(expertise => (
                            <SelectItem key={expertise} value={expertise}>{expertise}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {waysToHelpOptions.length > 0 && (
                    <div>
                      <label htmlFor="filter-ways-to-help" className="block text-sm font-medium text-slate-700 mb-1">
                        <Heart className="w-4 h-4 inline mr-1" />
                        Type of Help
                      </label>
                      <Select value={filters.waysToHelp} onValueChange={(value) => setFilters(f => ({ ...f, waysToHelp: value }))}>
                        <SelectTrigger id="filter-ways-to-help" className="h-11">
                          <SelectValue placeholder="Any type of help" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types of Help</SelectItem>
                          {waysToHelpOptions.map(way => (
                            <SelectItem key={way} value={way}>{way}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Can Provide Referrals Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <input
                    type="checkbox"
                    id="filter-referrals"
                    checked={filters.canProvideReferrals}
                    onChange={(e) => setFilters(f => ({ ...f, canProvideReferrals: e.target.checked }))}
                    className="w-4 h-4 text-green-600"
                  />
                  <label htmlFor="filter-referrals" className="text-sm font-medium text-green-900">
                    Can provide job referrals at their company
                  </label>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-slate-600 font-medium">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.persona !== 'all' && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        Role: {filters.persona}
                        <button onClick={() => setFilters(f => ({ ...f, persona: 'all' }))} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.industry !== 'all' && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1">
                        Industry: {filters.industry}
                        <button onClick={() => setFilters(f => ({ ...f, industry: 'all' }))} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.expertise !== 'all' && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1 bg-purple-100 text-purple-800">
                        Expertise: {filters.expertise}
                        <button onClick={() => setFilters(f => ({ ...f, expertise: 'all' }))} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.waysToHelp !== 'all' && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1 bg-blue-100 text-blue-800">
                        Help: {filters.waysToHelp}
                        <button onClick={() => setFilters(f => ({ ...f, waysToHelp: 'all' }))} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {filters.canProvideReferrals && (
                      <Badge variant="secondary" className="pl-2 pr-1 py-1 bg-green-100 text-green-800">
                        Can provide referrals
                        <button onClick={() => setFilters(f => ({ ...f, canProvideReferrals: false }))} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-blue-600 hover:text-blue-800">
                    <X className="w-4 h-4 mr-1"/>
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <ErrorState error={error} onRetry={loadDirectoryData} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(directoryUser => (
                  <UserCard 
                    key={directoryUser.id} 
                    user={directoryUser} 
                    onMessage={handleMessageUser} 
                    onViewProfile={handleViewProfile}
                    isLimitedMode={accessInfo.isLimitedMode}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#FA4616]/30">
                  <div className="mb-4">
                    <div className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
                      <p className="text-white font-bold text-lg">
                        Only {stats.members} Founding Gators — be next
                      </p>
                    </div>
                  </div>
                  <Search className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No matches for your filters</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Try adjusting your search or filters.
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={resetFilters} className="mt-4" variant="outline">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {selectedUser && (
        <MessageUserModal
          isOpen={isMessageModalOpen}
          onClose={() => setMessageModalOpen(false)}
          recipientUser={selectedUser}
        />
      )}
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userId={selectedProfileId}
        onMessage={handleMessageUser}
      />
    </div>
  );
}