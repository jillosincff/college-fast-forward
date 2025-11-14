import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Briefcase, X, Frown, GraduationCap, Heart, Award, Filter } from 'lucide-react';
import UserCard from '@/components/directory/UserCard';
import MessageUserModal from '@/components/directory/MessageUserModal';
import ProfileModal from '@/components/directory/ProfileModal';
import { navigate } from '@/components/utils/navigation';
import logger from '@/components/utils/logger';

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
    parents: 0
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
      const studentCount = validUsers.filter(u => u.persona === 'student').length;
      const alumniCount = validUsers.filter(u => u.persona === 'alumni').length;
      const parentCount = validUsers.filter(u => u.persona === 'parent').length;
      
      setStats(prev => ({ 
        ...prev, 
        members: validUsers.length,
        students: studentCount,
        alumni: alumniCount,
        parents: parentCount
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

  const waysToHelpOptions = useMemo(() => {
    const allWaysToHelp = allUsers
      .filter(u => u.ways_to_help && u.ways_to_help.length > 0)
      .flatMap(u => u.ways_to_help);
    return [...new Set(allWaysToHelp)].sort();
  }, [allUsers]);

  useEffect(() => {
    let users = [...allUsers];

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
        user.ways_to_help?.includes(filters.waysToHelp)
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
    <div className="min-h-screen bg-slate-100">
      
      {/* Gator Blue Hero Section */}
      <div className="relative text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/f025b6c93_image.png')`,
            willChange: 'transform'
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-800/85 via-blue-700/80 to-orange-600/75" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl" role="img" aria-label="alligator">🐊</span>
              <span className="px-3 py-1 bg-white/20 text-white text-sm font-semibold rounded-full backdrop-blur-sm">
                Gator Network
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-shadow-lg">
              Gator Directory
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-medium mb-4 leading-relaxed text-shadow-md">
              {isStudent 
                ? 'Find parents and alumni with the expertise you need to succeed'
                : 'Connect with fellow students, alumni, and parents from the Gator Nation'
              }
            </p>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto leading-relaxed text-shadow-sm">
              {isStudent
                ? 'Search by industry, expertise, or type of help you need'
                : 'Find mentors, make connections, and tap into the power of our community'
              }
            </p>
            
            {/* Stats Row - Enhanced with Persona Breakdown */}
            <div className="mt-8 flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {/* Total Members */}
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 min-w-[140px]">
                  <div className="text-3xl font-bold text-orange-300 mb-1">{loading ? '...' : stats.members}</div>
                  <div className="text-sm text-blue-200">Gator Members</div>
                </div>
                
                {/* Students */}
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 min-w-[140px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <GraduationCap className="w-5 h-5 text-blue-300" />
                    <div className="text-3xl font-bold text-blue-300">{loading ? '...' : stats.students}</div>
                  </div>
                  <div className="text-sm text-blue-200">Students</div>
                </div>
                
                {/* Alumni */}
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 min-w-[140px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Briefcase className="w-5 h-5 text-green-300" />
                    <div className="text-3xl font-bold text-green-300">{loading ? '...' : stats.alumni}</div>
                  </div>
                  <div className="text-sm text-blue-200">Alumni</div>
                </div>
                
                {/* Parents */}
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 min-w-[140px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Heart className="w-5 h-5 text-purple-300" />
                    <div className="text-3xl font-bold text-purple-300">{loading ? '...' : stats.parents}</div>
                  </div>
                  <div className="text-sm text-blue-200">Parents</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          
          {/* Filters Bar */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 sticky top-[80px] z-30">
            {/* Search Bar */}
            <div className="mb-4">
              <label htmlFor="search-directory" className="block text-sm font-medium text-slate-700 mb-2">
                Search by name, company, expertise...
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="search-directory"
                  placeholder="e.g., 'Product Manager', 'Software Engineering', 'Career Advice'"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
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

          {/* Results Count */}
          {!loading && !error && (
            <div className="mb-4 text-sm text-slate-600">
              Showing <strong>{filteredUsers.length}</strong> of <strong>{allUsers.length}</strong> members
              {hasActiveFilters && filteredUsers.length < allUsers.length && (
                <span className="text-blue-600 ml-2">
                  ({allUsers.length - filteredUsers.length} hidden by filters)
                </span>
              )}
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <UserCard key={user.id} user={user} onMessage={handleMessageUser} onViewProfile={handleViewProfile} />
                ))
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-lg shadow">
                  <Search className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-lg font-medium text-slate-900">No Gators Found</h3>
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