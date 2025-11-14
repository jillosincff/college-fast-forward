import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Trophy, Quote } from 'lucide-react';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'G';

const storyTypeConfig = {
  'Job': { color: 'bg-green-100 text-green-700', emoji: '💼' },
  'Internship': { color: 'bg-blue-100 text-blue-700', emoji: '🎯' },
  'Roommate': { color: 'bg-purple-100 text-purple-700', emoji: '🏠' },
  'Career Change': { color: 'bg-orange-100 text-orange-700', emoji: '🚀' },
  'Mentorship': { color: 'bg-indigo-100 text-indigo-700', emoji: '🤝' },
  'Other': { color: 'bg-gray-100 text-gray-700', emoji: '✨' }
};

export default function SuccessStoryCard({ story, onCheer }) {
  if (!story) return null;

  const storyConfig = storyTypeConfig[story.story_type] || storyTypeConfig.Other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 20px 35px rgba(0, 0, 0, 0.1)",
      }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-lg border-2 border-yellow-200 p-6 relative overflow-hidden col-span-full md:col-span-2 lg:col-span-3"
    >
      {/* Success Story Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <Badge className="bg-yellow-200 text-yellow-800 font-bold px-3 py-1 rounded-full">
          🎉 SUCCESS STORY
        </Badge>
      </div>

      <div className="flex items-start gap-4">
        <Avatar className="w-14 h-14 border-3 border-yellow-300 shadow-lg">
          <AvatarImage src={story.photo_url} alt={`${story.user_name}'s avatar`} />
          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white font-bold text-lg">
            {getInitials(story.user_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-slate-900 text-lg">
              {story.user_name}
            </h3>
            {story.user_grad_year && (
              <Badge variant="outline" className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200">
                UF {story.user_grad_year}
              </Badge>
            )}
            <Badge className={`${storyConfig.color} text-xs px-2 py-1 rounded-full`}>
              <span className="mr-1">{storyConfig.emoji}</span>
              {story.story_type}
            </Badge>
          </div>
          
          {story.user_role && (
            <p className="text-sm text-slate-600 font-medium mb-3">{story.user_role}</p>
          )}
          
          <div className="relative">
            <Quote className="absolute -top-2 -left-2 w-6 h-6 text-yellow-400 opacity-50" />
            <p className="text-slate-700 leading-relaxed pl-4 italic">
              "{story.story_text}"
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <Button
              onClick={() => onCheer && onCheer(story)}
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="font-semibold">{story.cheer_count || 0} Cheers</span>
            </Button>
            
            {story.linkedin_url && (
              <Button
                as="a"
                href={story.linkedin_url}
                target="_blank"
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Connect on LinkedIn
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}