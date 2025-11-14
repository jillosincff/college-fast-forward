import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink,
  TrendingUp,
  Loader2,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function JobSpotlightLibrary() {
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const { toast } = useToast();

  // Extract unique tags and majors for filters
  const allTags = [...new Set(spotlights.flatMap(s => s.tags || []))];
  const allMajors = [...new Set(spotlights.flatMap(s => s.majors || []))];

  useEffect(() => {
    loadSpotlights(true);
  }, [searchQuery, selectedTag, selectedMajor]);

  const loadSpotlights = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        page: reset ? 1 : page,
        limit: 20
      };

      if (searchQuery) params.q = searchQuery;
      if (selectedTag) params.tag = selectedTag;
      if (selectedMajor) params.major = selectedMajor;

      // Track filter usage
      if (selectedTag || selectedMajor || searchQuery) {
        trackEvent('library_filter_applied', {
          filter_key: selectedTag ? 'tag' : selectedMajor ? 'major' : 'search',
          filter_value: selectedTag || selectedMajor || searchQuery
        });
      }

      const { data } = await base44.functions.invoke('getJobSpotlightLibrary', params);

      if (data?.success) {
        if (reset) {
          setSpotlights(data.spotlights || []);
        } else {
          setSpotlights(prev => [...prev, ...(data.spotlights || [])]);
        }
        setHasMore(data.hasMore);
        setPage(data.page + 1);
      }
    } catch (error) {
      console.error('Failed to load spotlights:', error);
      toast({
        title: "Oops!",
        description: "Could not load job spotlights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSave = async (spotlight) => {
    setSavingId(spotlight.id);
    trackEvent('spotlight_save_clicked', { job_title_id: spotlight.id });

    try {
      if (spotlight.isSaved) {
        // Unsave
        const { data } = await base44.functions.invoke('unsaveJobSpotlight', {
          job_title_id: spotlight.id
        });
        
        if (data?.success) {
          setSpotlights(prev => prev.map(s => 
            s.id === spotlight.id ? { ...s, isSaved: false } : s
          ));
          toast({
            title: "Removed from wishlist",
            description: "You can always save it again later.",
          });
        }
      } else {
        // Save
        const { data } = await base44.functions.invoke('saveJobSpotlight', {
          job_title_id: spotlight.id
        });
        
        if (data?.success) {
          setSpotlights(prev => prev.map(s => 
            s.id === spotlight.id ? { ...s, isSaved: true } : s
          ));
          trackEvent('spotlight_saved', { 
            job_title_id: spotlight.id,
            student_id: data.student_id 
          });
          
          toast({
            title: "✨ Saved to Career Wishlist!",
            description: `We'll help you track your path to becoming a ${spotlight.title}`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to save spotlight:', error);
      toast({
        title: "Oops!",
        description: "Could not save right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setSelectedMajor('');
  };

  const hasActiveFilters = searchQuery || selectedTag || selectedMajor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Jobs Nobody Told You About
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Discover modern careers beyond the obvious. From UX Designer to Solutions Engineer.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-purple-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search job titles, tools, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tag Filter */}
              <div>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Categories</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Major Filter */}
              <div>
                <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Majors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Majors</SelectItem>
                    {allMajors.map(major => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-slate-600">Active filters:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : spotlights.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No jobs found
              </h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Grid of Job Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {spotlights.map((spotlight) => (
                <JobSpotlightCard
                  key={spotlight.id}
                  spotlight={spotlight}
                  onSave={handleSave}
                  saving={savingId === spotlight.id}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={() => loadSpotlights(false)}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Job Spotlight Card Component
function JobSpotlightCard({ spotlight, onSave, saving }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card
      className="bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border-purple-100"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-start justify-between">
          <span>🧠 {spotlight.title}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSave(spotlight);
            }}
            disabled={saving}
            className="flex-shrink-0"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : spotlight.isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-purple-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 hover:text-purple-600" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            💰 {spotlight.salary_range_entry}
          </Badge>
          {spotlight.tags && spotlight.tags[0] && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {spotlight.tags[0]}
            </Badge>
          )}
        </div>

        {/* What They Do */}
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
          {spotlight.what_they_do}
        </p>

        {/* Majors */}
        {spotlight.majors && spotlight.majors.length > 0 && (
          <div className="text-xs text-slate-500">
            <span className="font-semibold">Common Majors:</span>{' '}
            {spotlight.majors.slice(0, 3).join(', ')}
            {spotlight.majors.length > 3 && ` +${spotlight.majors.length - 3} more`}
          </div>
        )}

        {/* Tools */}
        {spotlight.tools && spotlight.tools.length > 0 && (
          <div className="text-xs text-slate-500">
            <span className="font-semibold">Key Tools:</span>{' '}
            {spotlight.tools.slice(0, 3).join(', ')}
          </div>
        )}

        {/* Starter Path (shows on hover) */}
        {showDetails && spotlight.starter_path && (
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Starter Path:
            </p>
            <p className="text-xs text-purple-800">
              {spotlight.starter_path}
            </p>
          </div>
        )}

        {/* Resources */}
        {spotlight.resources && spotlight.resources.length > 0 && showDetails && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 mb-2">Learn More:</p>
            <div className="space-y-1">
              {spotlight.resources.slice(0, 2).map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  {resource.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}