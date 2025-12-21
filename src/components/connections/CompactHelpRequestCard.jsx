import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Briefcase, 
  Heart, 
  Building, 
  Code, 
  Stethoscope, 
  DollarSign, 
  Users, 
  Megaphone, 
  BookOpen, 
  Cog, 
  GraduationCap, 
  User,
  MessageSquare,
  UserPlus,
  Bookmark,
  Wifi
} from 'lucide-react';
import StatsRow from './StatsRow';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'G';

const industryConfig = {
  'Technology': { icon: Code, color: 'bg-blue-100 text-blue-700', emoji: '💻' },
  'Healthcare': { icon: Stethoscope, color: 'bg-green-100 text-green-700', emoji: '🏥' },
  'Finance': { icon: DollarSign, color: 'bg-emerald-100 text-emerald-700', emoji: '📊' },
  'Consulting': { icon: Users, color: 'bg-purple-100 text-purple-700', emoji: '💼' },
  'Marketing': { icon: Megaphone, color: 'bg-pink-100 text-pink-700', emoji: '📢' },
  'Media': { icon: BookOpen, color: 'bg-orange-100 text-orange-700', emoji: '🎨' },
  'Engineering': { icon: Cog, color: 'bg-gray-100 text-gray-700', emoji: '⚙️' },
  'Education': { icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700', emoji: '🎓' },
  'default': { icon: Briefcase, color: 'bg-slate-100 text-slate-700', emoji: '💼' }
};

const getIndustryConfig = (industry) => {
  return industryConfig[industry] || industryConfig.default;
};

const truncateText = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const getExcitementPrefix = (jobType) => {
  const prefixes = {
    'internship': ['Looking for', 'Excited to find', 'Seeking', 'Hoping to land'],
    'full_time': ['Ready for', 'Excited about', 'Looking for', 'Seeking'],
    'default': ['Looking for', 'Excited to find']
  };
  
  const options = prefixes[jobType] || prefixes.default;
  return options[Math.floor(Math.random() * options.length)];
};

export default function CompactHelpRequestCard({ 
  request, 
  onCardClick,
  onOfferHelp,
  onMakeIntro,
  onSave,
  isFeatured = false 
}) {
  if (!request) return null;

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = (e) => {
    e.stopPropagation(); // Prevent card click from firing
    setIsSaved(!isSaved);
    onSave(request);
  };

  const handleOfferHelpClick = (e) => {
    e.stopPropagation();
    onOfferHelp(request);
  };

  const handleMakeIntroClick = (e) => {
    e.stopPropagation();
    onMakeIntro(request);
  };

  const posterName = request.poster_name || 'Gator Student';
  const posterYear = request.graduation_year ? `'${String(request.graduation_year).slice(-2)}` : '';
  const posterMajor = request.major || '';
  const posterImage = request.poster_profile_image;
  const posterLocation = request.location_preference || '';
  
  const industryConf = getIndustryConfig(request.target_industry);
  const excitementPrefix = getExcitementPrefix(request.job_type);
  const isRemote = request.location_preference?.toLowerCase().includes('remote');

  const cardSize = isFeatured ? 'md:col-span-2 lg:col-span-2' : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 35px rgba(0, 0, 0, 0.12)",
      }}
      onClick={() => onCardClick(request)}
      className={`bg-white rounded-3xl shadow-lg border border-slate-100 p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden h-full flex flex-col cursor-pointer ${cardSize} ${request.is_boosted ? 'ring-2 ring-amber-200 ring-opacity-50' : ''}`}
    >
      {/* Gator Paw Watermark */}
      <div className="absolute top-4 right-4 text-6xl opacity-5 pointer-events-none">
        🐾
      </div>

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-orange-50/20 opacity-60" />
      
      {/* Content */}
      <div className="relative z-10 flex-grow flex flex-col">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-14 h-14 border-3 border-white shadow-lg">
            <AvatarImage src={posterImage} alt={`${posterName}'s avatar`} />
            <AvatarFallback className="bg-gradient-to-br from-[var(--uf-blue)] to-[var(--uf-orange)] text-white font-bold text-lg">
              {getInitials(posterName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            {/* Name, Year, Major - Largest Text */}
            <div className="mb-2">
              <h3 className="font-bold text-slate-900 text-xl leading-tight">
                {posterName}
                {posterYear && (
                  <span className="text-[var(--uf-blue)] ml-2">UF {posterYear}</span>
                )}
              </h3>
              {posterMajor && (
                <p className="text-base text-slate-600 font-medium">{posterMajor}</p>
              )}
            </div>
            
            {/* Role/Ask - Second Level */}
            <div className="mb-3">
              <p className="text-lg font-semibold text-slate-800">
                {excitementPrefix} {request.role || request.title}
              </p>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {request.target_industry && (
            <Badge className={`${industryConf.color} text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1`}>
              <span>{industryConf.emoji}</span>
              {request.target_industry}
            </Badge>
          )}
          
          {posterLocation && (
            <Badge className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {posterLocation}
            </Badge>
          )}
          
          {isRemote && (
            <Badge className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Remote
            </Badge>
          )}

          {request.target_company && (
            <Badge className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
              {request.target_company}
            </Badge>
          )}

          {request.job_type && (
            <Badge className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {request.job_type === 'full_time' ? 'Full-Time' : 'Internship'}
            </Badge>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="mb-4">
            <StatsRow
                messagesCount={request.messages_count}
                introsCount={request.intros_count}
                isBoosted={request.is_boosted}
                variant="card"
            />
        </div>

        {/* Microcopy Description */}
        <div className="mb-4 flex-grow">
          <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
            {truncateText(request.description, 140)}
          </p>
        </div>

        {/* Multi-Option CTA Buttons */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          <Button
            onClick={handleOfferHelpClick}
            data-testid={`offer-help-btn-${request.id}`}
            className="flex-grow bg-gradient-to-r from-[var(--uf-orange)] to-red-500 hover:from-[#E24B14] hover:to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Share Your Advice
          </Button>
          
          <Button
            onClick={handleMakeIntroClick}
            data-testid={`make-intro-btn-${request.id}`}
            variant="outline"
            size="sm"
            className="border-[var(--uf-blue)] text-[var(--uf-blue)] hover:bg-blue-50 rounded-xl font-medium text-xs px-3"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Make Intro
          </Button>
          
          <Button
            onClick={handleSaveClick}
            data-testid={`save-btn-${request.id}`}
            variant="ghost"
            size="sm"
            className={`rounded-xl text-xs px-2 ${isSaved ? 'text-[var(--uf-blue)]' : 'text-slate-500 hover:text-slate-700'}`}
            aria-label="Save for later"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}