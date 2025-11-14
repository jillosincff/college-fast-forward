import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Building2, 
  Users,
  Heart,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const InfoItem = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-slate-600">{label}:</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
};

const RoleChip = ({ role }) => {
  const styles = {
    student: 'bg-blue-100 text-blue-800',
    parent: 'bg-purple-100 text-purple-800',
    alumni: 'bg-green-100 text-green-800',
  };
  return <Badge className={`border-0 capitalize ${styles[role] || styles.student}`}>{role}</Badge>;
};

export default function RequestDetailModal({ isOpen, onClose, request, onOfferHelp }) {
  if (!request) return null;

  const poster = request.poster || {};
  const timeAgo = formatDistanceToNow(new Date(request.created_date));

  const getJobTypeLabel = (type) => {
    const types = {
      'full_time': 'Full-time',
      'internship': 'Internship',
      'part_time': 'Part-time',
      'contract': 'Contract'
    };
    return types[type] || type;
  };

  const getWorkModeLabel = (mode) => {
    const modes = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'on_site': 'On-site'
    };
    return modes[mode] || mode;
  };

  const getUrgencyBadge = () => {
    if (request.urgency === 'Urgent') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">🔥 Urgent</Badge>;
    }
    if (request.urgency === 'Interviewing Now') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚡ Interviewing Now</Badge>;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          {/* Poster Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={poster.profile_image_url} alt={poster.full_name} />
              <AvatarFallback>{poster.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{poster.full_name}</h3>
                <RoleChip role={poster.persona} />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {poster.graduation_year && (
                  <span>UF '{String(poster.graduation_year).slice(-2)}</span>
                )}
                <span>•</span>
                <span>Posted {timeAgo} ago</span>
              </div>
              {poster.current_position && poster.current_company && (
                <p className="text-sm text-slate-600 mt-1">
                  {poster.current_position} at {poster.current_company}
                </p>
              )}
            </div>
          </div>

          {/* Request Title & Urgency */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <DialogTitle className="text-xl font-bold">{request.role}</DialogTitle>
              {getUrgencyBadge()}
            </div>
          </div>
        </DialogHeader>

        {/* Request Details */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">What they're looking for</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <InfoItem 
              icon={Briefcase} 
              label="Type" 
              value={getJobTypeLabel(request.job_type || request.role_type)} 
            />
            <InfoItem 
              icon={Building2} 
              label="Industry" 
              value={request.target_industry} 
            />
            <InfoItem 
              icon={MapPin} 
              label="Location" 
              value={request.location_city && request.location_state 
                ? `${request.location_city}, ${request.location_state}`
                : request.location_preference
              } 
            />
            <InfoItem 
              icon={Users} 
              label="Work mode" 
              value={getWorkModeLabel(request.work_mode)} 
            />
            {request.target_company && (
              <InfoItem 
                icon={Building2} 
                label="Target company" 
                value={request.target_company} 
              />
            )}
            {request.start_timing && (
              <InfoItem 
                icon={Clock} 
                label="Start timing" 
                value={request.start_timing.replace('_', ' ')} 
              />
            )}
          </div>

          {/* Additional Info */}
          {(request.relocation_ok || request.visa_needed) && (
            <div className="flex flex-wrap gap-2">
              {request.relocation_ok && (
                <Badge variant="outline" className="text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Open to relocation
                </Badge>
              )}
              {request.visa_needed && (
                <Badge variant="outline" className="text-blue-700 border-blue-200">
                  Visa sponsorship needed
                </Badge>
              )}
            </div>
          )}

          {/* Resume & LinkedIn */}
          {(request.resume_url || request.linkedin_url) && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Resources</h4>
              <div className="flex gap-3">
                {request.resume_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={request.resume_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Resume
                    </a>
                  </Button>
                )}
                {request.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={request.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {request.offers_count || 0} offers to help
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {request.intros_count || 0} introductions
            </span>
            {request.views_count && (
              <span>{request.views_count} views</span>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t">
            <Button 
              onClick={onOfferHelp}
              className="w-full bg-gradient-to-r from-orange-500 to-blue-600 hover:opacity-90 text-white font-semibold"
            >
              <Heart className="w-4 h-4 mr-2" />
              Offer Help
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}