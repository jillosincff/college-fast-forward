import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  ExternalLink,
  Calendar,
  User as UserIcon,
  Heart,
  LinkedinIcon
} from "lucide-react";

export default function HelperProfileModal({ isOpen, onClose, helper }) {
  if (!helper) return null;

  const getRoleBadges = () => {
    const badges = [];
    
    if (helper.roles?.includes('UF_ALUMNI')) {
      badges.push({ text: 'UF Alumni', color: 'bg-blue-100 text-blue-800', icon: GraduationCap });
    }
    if (helper.roles?.includes('UF_PARENT')) {
      badges.push({ text: 'UF Parent', color: 'bg-purple-100 text-purple-800', icon: Heart });
    }
    if (helper.isExternalHelper) {
      badges.push({ text: 'Community Helper', color: 'bg-green-100 text-green-800', icon: UserIcon });
    }
    
    return badges;
  };

  const roleBadges = getRoleBadges();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              {helper.profile_image_url ? (
                <img 
                  src={helper.profile_image_url} 
                  alt={helper.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                {helper.full_name}
              </DialogTitle>
              <div className="flex flex-wrap gap-2 mb-3">
                {roleBadges.map((badge, index) => (
                  <Badge key={index} className={`${badge.color} flex items-center gap-1`}>
                    <badge.icon className="w-3 h-3" />
                    {badge.text}
                  </Badge>
                ))}
              </div>
              {helper.headline && (
                <p className="text-lg text-slate-600 mb-2">{helper.headline}</p>
              )}
              {helper.current_company && helper.current_position && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{helper.current_position} at {helper.current_company}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helper.location && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{helper.location}</span>
              </div>
            )}
            {helper.graduation_year && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Class of {helper.graduation_year}</span>
              </div>
            )}
            {helper.major && (
              <div className="flex items-center gap-2 text-slate-600">
                <GraduationCap className="w-4 h-4" />
                <span>{helper.major}</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {helper.bio && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">About</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {helper.bio}
                </p>
              </div>
            </>
          )}

          {/* Expertise Tags */}
          {helper.expertiseTags && helper.expertiseTags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {helper.expertiseTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-slate-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Industries of Interest (fallback for expertise) */}
          {(!helper.expertiseTags || helper.expertiseTags.length === 0) && 
           helper.industries_of_interest && helper.industries_of_interest.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Industries</h3>
                <div className="flex flex-wrap gap-2">
                  {helper.industries_of_interest.map((industry, index) => (
                    <Badge key={index} variant="outline" className="text-slate-700">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Social Links */}
          {(helper.linkedin_url || helper.socialLinks?.linkedin || helper.socialLinks?.twitter) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Connect</h3>
                <div className="flex gap-3">
                  {(helper.linkedin_url || helper.socialLinks?.linkedin) && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex items-center gap-2"
                    >
                      <a 
                        href={helper.linkedin_url || helper.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  {helper.socialLinks?.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex items-center gap-2"
                    >
                      <a 
                        href={helper.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Twitter
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Parent-specific info */}
          {helper.roles?.includes('UF_PARENT') && helper.student_name && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Family Connection</h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800">
                    Parent of <strong>{helper.student_name}</strong>
                    {helper.student_graduation_year && ` (Class of ${helper.student_graduation_year})`}
                    {helper.student_major && ` - ${helper.student_major}`}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}