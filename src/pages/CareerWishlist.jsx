import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bookmark, 
  BookmarkCheck, 
  Loader2, 
  Sparkles,
  TrendingUp,
  ExternalLink,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';

export default function CareerWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('getCareerWishlist');
      
      if (data?.success) {
        setWishlist(data.wishlist || []);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      toast({
        title: "Oops!",
        description: "Could not load your career wishlist.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (spotlightId) => {
    setRemovingId(spotlightId);
    
    try {
      const { data } = await base44.functions.invoke('unsaveJobSpotlight', {
        job_title_id: spotlightId
      });
      
      if (data?.success) {
        setWishlist(prev => prev.filter(item => item.id !== spotlightId));
        toast({
          title: "Removed from wishlist",
          description: "You can always save it again later.",
        });
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast({
        title: "Oops!",
        description: "Could not remove item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookmarkCheck className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              My Career Wishlist
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Track careers you're interested in and plan your path to get there.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-slate-600 mb-6">
                Start exploring job spotlights and save the ones that interest you
              </p>
              <Button
                onClick={() => navigate('JobSpotlightLibrary')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((spotlight) => (
              <Card
                key={spotlight.id}
                className="bg-white hover:shadow-xl transition-all duration-300 border-purple-100"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-start justify-between">
                    <span>🧠 {spotlight.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(spotlight.id)}
                      disabled={removingId === spotlight.id}
                      className="flex-shrink-0 text-slate-400 hover:text-red-600"
                    >
                      {removingId === spotlight.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-5 h-5" />
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
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {spotlight.what_they_do}
                  </p>

                  {/* Starter Path */}
                  {spotlight.starter_path && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Your Path:
                      </p>
                      <p className="text-xs text-purple-800">
                        {spotlight.starter_path}
                      </p>
                    </div>
                  )}

                  {/* Tools */}
                  {spotlight.tools && spotlight.tools.length > 0 && (
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold">Tools to Learn:</span>{' '}
                      {spotlight.tools.slice(0, 3).join(', ')}
                    </div>
                  )}

                  {/* Resources */}
                  {spotlight.resources && spotlight.resources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-700 mb-2">Get Started:</p>
                      <div className="space-y-1">
                        {spotlight.resources.slice(0, 2).map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}