
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export default function CompactJobCard({ request, onConnect, onDetails, isNew }) {
  // Removed all useRef, useMotionValue, useSpring, useTransform and related handlers for tilt effect.
  // Removed useRouter and navigate as onDetails prop handles navigation/detail display.

  // Assumes poster details are now part of the request object
  const profileImageUrl = request.poster_profile_image_url;
  const description = request.description || 'Seeking guidance and connections in this field.';

  return (
    <TooltipProvider>
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
        className="h-full"
      >
        <Card
          onClick={(e) => {
            e.stopPropagation(); // Prevents click from propagating to parent elements if a button inside is clicked
            onDetails();
          }}
          aria-label={`View details for ${request.role} at ${request.target_company || request.target_industry}`}
          className={`relative w-full h-full cursor-pointer overflow-hidden rounded-2xl flex flex-col 
            ${isNew 
              ? 'bg-white border-2 border-dashed border-[var(--uf-orange)]' 
              : 'bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-lg hover:shadow-2xl transition-shadow duration-300'
            }`}
        >
          <CardContent className="p-4 flex-grow flex flex-col justify-between">
            <div>
              {/* Header: Avatar, Name, Badge */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                  <AvatarImage src={profileImageUrl} alt={request.poster_full_name || 'User'} />
                  <AvatarFallback className="bg-[var(--uf-blue)] text-white font-semibold">
                    {request.poster_full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 leading-tight">{request.poster_full_name || 'Gator User'}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center"><GraduationCap className="w-3 h-3 mr-1" /> {toTitleCase(request.poster_persona)} '{String(request.poster_graduation_year || 'XX').slice(-2)}</span>
                      </TooltipTrigger>
                      <TooltipContent><p>{toTitleCase(request.poster_persona)} Class of {request.poster_graduation_year}</p></TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                {request.is_boosted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[var(--uf-orange)]" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Boosted Request</p></TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Core Info: Title and Description */}
              <div className="mb-3">
                <h3 className="font-bold text-slate-900 mb-1 leading-snug">{request.role || request.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
              </div>

              {/* Metadata Icons and Tags */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-3">
                  <Tooltip>
                    <TooltipTrigger asChild><span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {toTitleCase(request.job_type)}</span></TooltipTrigger>
                    <TooltipContent><p>{toTitleCase(request.job_type)} Position</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild><span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {request.location_preference}</span></TooltipTrigger>
                    <TooltipContent><p>Location: {request.location_preference}</p></TooltipContent>
                  </Tooltip>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}</span></TooltipTrigger>
                  <TooltipContent><p>Posted {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDetails();
                }}
                variant="outline"
                size="sm"
                className="flex-1 text-slate-700 bg-white/50"
                aria-label={`See more details for ${request.role}`}
              >
                See More
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect();
                }}
                size="sm"
                className="flex-1 bg-[var(--uf-orange)] hover:bg-orange-600 text-white"
                aria-label={`Connect with the student requesting a ${request.role}`}
              >
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}
