import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bookmark, BookmarkCheck, ExternalLink, TrendingUp, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import JobLearnMoreModal from './JobLearnMoreModal';
import { motion } from 'framer-motion';

export default function JobSpotlightWidget() {
  const [spotlight, setSpotlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSpotlight();
  }, []);

  const loadSpotlight = async () => {
    try {
      const { data } = await base44.functions.invoke('getJobSpotlightToday');
      
      if (data?.success && data?.spotlight) {
        setSpotlight(data.spotlight);
        trackEvent('spotlight_impression', { 
          job_title_id: data.spotlight.id,
          surface: 'dashboard'
        });
      }
    } catch (error) {
      console.error('Failed to load job spotlight:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!spotlight) return;
    
    setSaving(true);
    trackEvent('spotlight_save_clicked', { job_title_id: spotlight.id });

    try {
      if (spotlight.isSaved) {
        // Unsave
        const { data } = await base44.functions.invoke('unsaveJobSpotlight', {
          job_title_id: spotlight.id
        });
        
        if (data?.success) {
          setSpotlight({ ...spotlight, isSaved: false });
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
          setSpotlight({ ...spotlight, isSaved: true });
          trackEvent('spotlight_saved', { 
            job_title_id: spotlight.id,
            student_id: data.student_id 
          });
          
          toast({
            title: "✨ Saved to Career Wishlist!",
            description: "We'll help you track your path to becoming a " + spotlight.title,
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
      setSaving(false);
    }
  };

  const handleSeeAll = () => {
    trackEvent('spotlight_see_all_clicked', { 
      job_title_id: spotlight?.id 
    });
    navigate('JobSpotlightLibrary');
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (!spotlight) {
    return null;
  }

  return (
    <>
      {/* Series Branding Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-2"
      >
        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-none shadow-sm">
          <Sparkles className="w-3 h-3 mr-1" />
          ✨ Jobs Nobody Told You About
        </Badge>
      </motion.div>

      {/* Main Card with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card 
          className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-all duration-300"
          onMouseEnter={() => setShowPath(true)}
          onMouseLeave={() => setShowPath(false)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Job You Should Know
                </CardTitle>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                This Week
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                🧠 {spotlight.title}
              </h3>
            </div>

            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white">
                💰 {spotlight.salary_range_entry}
              </Badge>
              {spotlight.majors && spotlight.majors.length > 0 && (
                <Badge variant="outline" className="bg-white">
                  🎓 {spotlight.majors.slice(0, 2).join(', ')}
                  {spotlight.majors.length > 2 && ` +${spotlight.majors.length - 2}`}
                </Badge>
              )}
              {spotlight.tools && spotlight.tools.length > 0 && (
                <Badge variant="outline" className="bg-white">
                  🛠️ {spotlight.tools.slice(0, 2).join(', ')}
                </Badge>
              )}
              {spotlight.tags && spotlight.tags[0] && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                  {spotlight.tags[0]}
                </Badge>
              )}
            </div>

            {/* What They Do */}
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <p className="text-sm font-medium text-slate-700 mb-1">
                What They Actually Do:
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {spotlight.what_they_do}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 text-sm text-purple-600 hover:text-purple-800 underline underline-offset-2 hover:no-underline font-medium"
                aria-haspopup="dialog"
              >
                Learn more
              </button>
            </div>

            {/* Starter Path (shows on hover) */}
            {showPath && spotlight.starter_path && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-purple-100 rounded-lg p-3 border border-purple-200"
              >
                <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Starter Path:
                </p>
                <p className="text-sm text-purple-800">
                  {spotlight.starter_path}
                </p>
              </motion.div>
            )}

            {/* CTAs */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className={
                  spotlight.isSaved
                    ? "flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    : "flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                }
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : spotlight.isSaved ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {spotlight.isSaved ? 'Saved' : 'Save to Wishlist'}
              </Button>
              
              <Button
                onClick={handleSeeAll}
                variant="ghost"
                className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
              >
                See all roles
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Optional: Link to Gator in this role */}
            {spotlight.alumni_profile_url && (
              <a
                href={spotlight.alumni_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:text-purple-800 underline block text-center"
              >
                See a Gator in this job →
              </a>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Learn More Modal */}
      <JobLearnMoreModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onSeeAll={handleSeeAll}
        job={spotlight}
        isSaved={spotlight.isSaved}
      />
    </>
  );
}