import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Users,
  ExternalLink,
  Edit,
  BookmarkPlus,
  Bookmark,
  Lock
} from 'lucide-react';

export default function OpportunityCard({
  opportunity,
  onApply,
  onViewDetails,
  onToggleSave,
  isSaved = false,
  hasApplied = false,
  isEditable = false,
  onEdit,
  isFeatured = false,
  isLimitedMode = false
}) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'internship': return 'bg-blue-100 text-blue-800';
      case 'job': return 'bg-green-100 text-green-800';
      case 'full_time': return 'bg-green-100 text-green-800';
      case 'student_gig': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'student_gig': return 'Campus Gig';
      case 'job': return 'Full-Time Job';
      case 'full_time': return 'Full-Time Job';
      case 'part_time': return 'Part-time';
      case 'internship': return 'Internship';
      default: return type?.replace('_', ' ');
    }
  };

  const formatSalary = () => {
    if (opportunity.salary_display) return opportunity.salary_display;
    if (opportunity.hourly_wage) return `$${opportunity.hourly_wage}/hr`;
    if (opportunity.salary_min && opportunity.salary_max) {
      return `$${opportunity.salary_min.toLocaleString()} - $${opportunity.salary_max.toLocaleString()}`;
    }
    if (opportunity.salary_min) return `$${opportunity.salary_min.toLocaleString()}+`;
    return null;
  };

  const getTimeAgo = () => {
    if (!opportunity.created_date) return '';
    const now = new Date();
    const created = new Date(opportunity.created_date);
    const diffMs = now - created;
    
    // Handle negative time differences or very recent posts (within 1 minute)
    if (diffMs < 60000) return 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getJobSource = () => {
    if (opportunity.posting_type !== 'shared_link') return null;
    
    const url = (opportunity.contact_url || opportunity.external_apply_url || '').toLowerCase();
    
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('indeed.com')) return 'Indeed';
    if (url.includes('glassdoor.com')) return 'Glassdoor';
    if (url.includes('monster.com')) return 'Monster';
    if (url.includes('ziprecruiter.com')) return 'ZipRecruiter';
    if (url.includes('handshake.app') || url.includes('joinhandshake.com')) return 'Handshake';
    if (url.includes('simplify.jobs')) return 'Simplify';
    if (url.includes('greenhouse.io')) return 'Greenhouse';
    if (url.includes('lever.co')) return 'Lever';
    if (url.includes('workday.com')) return 'Workday';
    
    return 'External Site';
  };

  const salary = formatSalary();
  const location = opportunity.city && opportunity.state 
    ? `${opportunity.city}, ${opportunity.state}`
    : opportunity.location_type === 'remote' 
    ? 'Remote' 
    : 'Location not specified';

  const isGatorNetwork = opportunity.posting_type === 'manual_entry' && opportunity.created_by;
  const isExternal = opportunity.posting_type === 'shared_link';
  const jobSource = getJobSource();
  const externalUrl = opportunity.external_apply_url || opportunity.contact_url;
  
  const hasCustomApplicationEmail = opportunity.application_email && opportunity.application_email !== opportunity.created_by;
  const isPlatformApply = isGatorNetwork && !hasCustomApplicationEmail;

  const handleExternalLinkClick = (e) => {
    e.stopPropagation();
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    
    if (hasCustomApplicationEmail) {
      window.location.href = `mailto:${opportunity.application_email}?subject=Application for ${encodeURIComponent(opportunity.title)}`;
    } else {
      onApply(opportunity);
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl p-7 transition-all duration-300 relative will-change-transform",
      "shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:-translate-y-1",
      isFeatured 
        ? "border-[3px] border-orange-500 bg-gradient-to-r from-orange-50 via-orange-100/40 to-white" 
        : "border-2 border-slate-200 hover:border-blue-500",
      hasApplied && "border-green-500 bg-gradient-to-r from-green-50/30 to-white"
    )}>
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className={cn(
            "w-[60px] h-[60px] rounded-[14px] flex items-center justify-center flex-shrink-0 text-[22px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
            isGatorNetwork ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white" : "bg-gradient-to-br from-slate-500 to-slate-600 text-white"
          )}>
            {isGatorNetwork ? '🐊' : '🔗'}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className="text-[22px] font-extrabold text-slate-900 mb-2 leading-tight tracking-tight hover:text-blue-600 cursor-pointer line-clamp-1"
              onClick={() => onViewDetails(opportunity)}
            >
              {opportunity.title}
            </h3>
            <p className="text-base font-semibold text-slate-600 mb-1.5 truncate">{opportunity.org_name}</p>
            {isGatorNetwork && opportunity.created_by && (
              <span className="text-sm font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded inline-block w-fit">
                Posted by Gator Helper
              </span>
            )}
            {isExternal && jobSource && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-slate-500 italic">
                  via {jobSource}
                </span>
                {externalUrl && (
                  <button
                    onClick={handleExternalLinkClick}
                    className="text-blue-600 hover:text-blue-700 underline text-sm font-medium flex items-center gap-1 transition-colors"
                    aria-label="View original job posting"
                  >
                    View Post <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-start gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(opportunity.id);
            }}
            className={cn(
              "rounded-full hover:bg-slate-100 transition-colors",
              isSaved ? "text-red-500" : "text-slate-400"
            )}
            aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
          >
            {isSaved ? <Bookmark className="w-5 h-5 fill-current" /> : <BookmarkPlus className="w-5 h-5" />}
          </Button>
          
          {opportunity.created_date && (
            <span className="text-xs text-slate-500 mt-1.5">{getTimeAgo()}</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Badge className={getTypeColor(opportunity.opportunity_type)}>
          <Briefcase className="w-3 h-3 mr-1" />
          {getTypeLabel(opportunity.opportunity_type)}
        </Badge>
        {location && (
          <Badge variant="outline" className="text-slate-700">
            <MapPin className="w-3 h-3 mr-1" />
            {location}
          </Badge>
        )}
        {salary && (
          <Badge variant="outline" className="text-slate-700">
            <DollarSign className="w-3 h-3 mr-1" />
            {salary}
          </Badge>
        )}
      </div>

      {opportunity.tags && opportunity.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.tags.slice(0, 5).map((tag, index) => (
            <span key={index} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {opportunity.description && (
        <p className="text-sm text-slate-600 mb-5 line-clamp-3 leading-relaxed">
          {opportunity.description}
        </p>
      )}

      {isExternal && externalUrl && (
        <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <ExternalLink className="w-4 h-4" />
            <span>Apply on external site</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t-2 border-slate-100">
        <div className="flex gap-5 flex-wrap">
          {opportunity.applications_count > 0 && (
            <span className="text-[13px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md whitespace-nowrap">
              {opportunity.applications_count} Gator{opportunity.applications_count !== 1 ? 's' : ''} applied
            </span>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {isEditable ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="border-2 shadow-sm hover:shadow-md flex-1 sm:flex-initial"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(opportunity)}
                className="border-2 shadow-sm hover:shadow-md flex-1 sm:flex-initial"
              >
                View Details
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(opportunity)}
                className="border-2 shadow-sm hover:shadow-md hidden sm:inline-flex"
              >
                View Details
              </Button>
              <Button
                size="sm"
                onClick={handleApplyClick}
                disabled={hasApplied}
                className={cn(
                  "font-bold text-[15px] uppercase tracking-wide px-7 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 touch-manipulation flex-1 sm:flex-initial",
                  hasApplied 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)]"
                )}
              >
                {hasApplied ? 'Applied ✓' : (hasCustomApplicationEmail ? 'Apply via Email' : (isPlatformApply ? 'Apply via Platform' : 'Apply Now'))}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}