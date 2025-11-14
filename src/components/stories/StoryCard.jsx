import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Share2, ExternalLink, Copy, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const categoryColors = {
  Job: 'bg-blue-100 text-blue-800 border-blue-300',
  Internship: 'bg-green-100 text-green-800 border-green-300',
  Roommate: 'bg-purple-100 text-purple-800 border-purple-300',
  'Career Change': 'bg-orange-100 text-orange-800 border-orange-300',
  Mentorship: 'bg-amber-100 text-amber-800 border-amber-300',
  Other: 'bg-gray-100 text-gray-800 border-gray-300'
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function StoryCard({ story }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [cheerCount, setCheerCount] = useState(story.cheer_count || 0);
  const [hasCheered, setHasCheered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCheer = (e) => {
    e.stopPropagation();
    if (!hasCheered) {
      setCheerCount(prev => prev + 1);
      setHasCheered(true);
    }
  };

  const handleShare = (type) => {
    const storyUrl = `${window.location.origin}${window.location.pathname}#story-${story.id}`;
    const shareText = `Check out this inspiring Gator success story from ${story.user_name}: "${story.story_text.substring(0, 100)}..."`;
    
    switch(type) {
      case 'copy':
        navigator.clipboard.writeText(storyUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storyUrl)}&summary=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(storyUrl)}`, '_blank');
        break;
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const shouldTruncate = story.story_text.length > 150;
  const displayText = shouldTruncate && !isExpanded 
    ? story.story_text.substring(0, 150) + '...' 
    : story.story_text;

  return (
    <>
      <motion.div
        id={`story-${story.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
        whileHover={{ y: -4 }}
      >
        <Card className="h-full flex flex-col bg-white hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:border-[var(--uf-blue)]/20 hover:border-2 min-h-[320px]">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={story.photo_url} 
                    alt={`${story.user_name}'s photo`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="bg-[var(--uf-blue)] text-white font-semibold">
                    {getInitials(story.user_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-bold text-slate-900 truncate">
                    {story.user_name}
                  </CardTitle>
                  {story.user_grad_year && (
                    <p className="text-sm text-slate-600">UF {story.user_grad_year}</p>
                  )}
                  {story.user_role && (
                    <p className="text-xs text-slate-500 truncate">{story.user_role}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {story.is_featured && (
                  <Star className="w-4 h-4 text-amber-500" aria-label="Featured story" />
                )}
                <Badge 
                  className={`text-xs font-medium border ${categoryColors[story.story_type] || categoryColors.Other}`}
                  aria-label={`${story.story_type} success story category`}
                >
                  {story.story_type}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            <div className="min-h-[120px]">
              <p className="text-slate-700 leading-relaxed">
                {displayText}
              </p>
              {shouldTruncate && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-[var(--uf-blue)] hover:text-blue-700 text-sm mt-2"
                  onClick={() => setIsModalOpen(true)}
                  onKeyDown={(e) => handleKeyDown(e, () => setIsModalOpen(true))}
                  aria-label={`Read full story from ${story.user_name}`}
                >
                  Read More
                </Button>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex items-center justify-between w-full">
              <motion.button
                onClick={handleCheer}
                onKeyDown={(e) => handleKeyDown(e, handleCheer)}
                disabled={hasCheered}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--uf-orange)]/50 ${
                  hasCheered 
                    ? 'bg-[var(--uf-orange)]/10 text-[var(--uf-orange)] cursor-default' 
                    : 'bg-slate-100 text-slate-600 hover:bg-[var(--uf-orange)]/10 hover:text-[var(--uf-orange)]'
                }`}
                whileTap={{ scale: 0.95 }}
                aria-label={`Cheer for ${story.user_name}'s story. Current cheers: ${cheerCount}`}
              >
                <motion.div
                  animate={hasCheered ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-4 h-4 ${hasCheered ? 'fill-current' : ''}`} />
                </motion.div>
                <span className="text-sm font-medium">{cheerCount}</span>
              </motion.button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-[var(--uf-blue)] focus:ring-2 focus:ring-[var(--uf-blue)]/50"
                    aria-label={`Share ${story.user_name}'s story`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="sr-only">Share story</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    <div className="flex items-center gap-2">
                      {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Share to LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Share to Twitter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Full Story Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={story.photo_url} alt={`${story.user_name}'s photo`} />
                <AvatarFallback className="bg-[var(--uf-blue)] text-white font-bold text-lg">
                  {getInitials(story.user_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  {story.user_name}
                </DialogTitle>
                {story.user_grad_year && (
                  <p className="text-slate-600">UF {story.user_grad_year}</p>
                )}
                {story.user_role && (
                  <p className="text-sm text-slate-500">{story.user_role}</p>
                )}
              </div>
              <div className="ml-auto">
                <Badge className={`${categoryColors[story.story_type] || categoryColors.Other} border`}>
                  {story.story_type}
                </Badge>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-slate-700 leading-relaxed text-lg">{story.story_text}</p>
            
            {story.linkedin_url && (
              <div>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(story.linkedin_url, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect on LinkedIn
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t">
              <motion.button
                onClick={handleCheer}
                disabled={hasCheered}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  hasCheered 
                    ? 'bg-[var(--uf-orange)]/10 text-[var(--uf-orange)] cursor-default' 
                    : 'bg-slate-100 text-slate-600 hover:bg-[var(--uf-orange)]/10 hover:text-[var(--uf-orange)]'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={hasCheered ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart className={`w-5 h-5 ${hasCheered ? 'fill-current' : ''}`} />
                </motion.div>
                <span className="font-medium">{cheerCount} Cheers</span>
              </motion.button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('copy')}
                >
                  {copySuccess ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copySuccess ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}