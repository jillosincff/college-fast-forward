import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Bookmark, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import confetti from 'canvas-confetti';
import { getJobIntroLine, getJobWhyItMatters, getJobStarterPathCopy } from '@/components/utils/tagMicrocopy';

export default function JobLearnMoreModal({ 
  open, 
  onClose, 
  onSave, 
  onSeeAll, 
  job,
  isSaved 
}) {
  const [justSaved, setJustSaved] = React.useState(false);

  useEffect(() => {
    if (open && job?.id) {
      trackEvent('spotlight_learn_more_opened', { 
        job_title_id: job.id,
        tags: job.tags,
        has_custom_copy: !!(job.intro_line && job.why_it_matters)
      });
    }
  }, [open, job?.id]);

  const handleResourceClick = (url) => {
    trackEvent('spotlight_resource_clicked', { 
      job_title_id: job.id, 
      url 
    });
  };

  const handleSaveClick = async () => {
    trackEvent('spotlight_save_clicked', { 
      job_title_id: job.id, 
      surface: 'modal',
      tags: job.tags 
    });
    
    await onSave();
    
    // Visual feedback: confetti + checkmark
    if (!isSaved) {
      setJustSaved(true);
      
      // Trigger confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#9333ea', '#3b82f6', '#10b981']
      });
      
      // Reset after animation
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  if (!job) return null;

  // Determine growth status based on tags
  const isGrowthRole = job.tags?.some(tag => 
    ['ai', 'climate', 'fast-growing', 'hot', 'emerging', 'high-growth'].includes(tag.toLowerCase())
  );

  // Get microcopy using tag-based system
  const introLine = getJobIntroLine(job);
  const whyItMatters = getJobWhyItMatters(job);
  const starterPathCopy = getJobStarterPathCopy(job);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {job.title}
            {isGrowthRole && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            )}
          </DialogTitle>
          {job.salary_range_entry && (
            <p className="text-sm text-slate-600 mt-1">
              💰 {job.salary_range_entry}
            </p>
          )}
          
          {/* Intro Line + Why it Matters */}
          <div className="space-y-2 mt-2">
            <p className="text-sm text-purple-700 bg-purple-50 rounded-lg p-3 border border-purple-200">
              <Sparkles className="w-4 h-4 inline mr-1" />
              {introLine}
            </p>
            
            <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
              {whyItMatters}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* What They Actually Do */}
          {job.what_they_do && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                What They Actually Do
              </h3>
              <p className="text-sm leading-relaxed text-slate-800">
                {job.what_they_do}
              </p>
            </section>
          )}

          {/* Starter Path */}
          {starterPathCopy && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Starter Path
              </h3>
              <p className="text-sm text-slate-800 bg-blue-50 rounded-lg p-3 border border-blue-200">
                {starterPathCopy}
              </p>
            </section>
          )}

          {/* Common Majors */}
          {job.majors && job.majors.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Common Majors
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.majors.map((major) => (
                  <Badge 
                    key={major} 
                    variant="outline" 
                    className="bg-white"
                  >
                    🎓 {major}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Tools */}
          {job.tools && job.tools.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Key Tools
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.tools.map((tool) => (
                  <Badge 
                    key={tool} 
                    variant="secondary"
                    className="bg-slate-100"
                  >
                    🛠️ {tool}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* Resources */}
          {job.resources && job.resources.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Learning Resources
              </h3>
              <ul className="space-y-2">
                {job.resources.map((resource, idx) => (
                  <li key={idx}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleResourceClick(resource.url)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {resource.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Alumni Profile Link */}
          {job.alumni_profile_url && (
            <a
              href={job.alumni_profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 hover:underline font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              See a Gator in this job →
            </a>
          )}
        </div>

        {/* Footer Actions with Save Feedback */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onSeeAll}
            className="flex-1"
          >
            See All Roles
          </Button>
          <Button
            onClick={handleSaveClick}
            className={`flex-1 transition-all ${
              isSaved || justSaved
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {justSaved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 animate-bounce" />
                Saved!
              </>
            ) : isSaved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-2" />
                Save to Wishlist
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}