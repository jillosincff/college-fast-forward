import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Building2, ExternalLink, Sparkles } from 'lucide-react';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';

export default function DiscoveryJobCard({ lead, onAddToPipeline, onSelect }) {
  const [isScouting, setIsScouting] = useState(false);
  const [hasScouted, setHasScouted] = useState(false);
  const [scoutResult, setScoutResult] = useState(null);

  const handleScout = async () => {
    setIsScouting(true);
    try {
      const result = await scoutCompanyBackdoor({
        jobId: lead.id || lead.company + '-' + lead.role,
        companyName: lead.company,
      });
      setScoutResult(result.data);
      setHasScouted(true);
      
      // If backdoor found, refresh the feed to promote this to Priority Insider
      window.dispatchEvent(new CustomEvent('cff:refresh-feed'));
    } catch (error) {
      console.error('Scout failed:', error);
    } finally {
      setIsScouting(false);
    }
  };

  return (
    <Card className="card-interactive hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <h3 className="font-bold text-gray-900 text-base">{lead.company}</h3>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">{lead.role}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Description Snippet */}
        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
          {lead.jobDescription || lead.description}
        </p>

        {/* Source Badge */}
        {lead.nichePlatform && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
              📊 {lead.nichePlatform}
            </Badge>
          </div>
        )}

        {/* Zero-Waste Action Zone */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {/* Always show: Add to Pipeline */}
          <Button
            onClick={() => onAddToPipeline(lead)}
            variant="outline"
            className="w-full text-xs font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            size="sm"
          >
            📋 Add to Pipeline
          </Button>

          {/* On-demand Scout Button — only for Target Discoveries (no insider yet) */}
          {!hasScouted && !lead.alumniCount && !lead.parentCount && (
            <Button
              onClick={handleScout}
              disabled={isScouting}
              className="w-full text-xs font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0 shadow-md"
              size="sm"
            >
              {isScouting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Scouting Backdoor Channels...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Scout Backdoor Channels
                </span>
              )}
            </Button>
          )}

          {/* Scout Success State */}
          {hasScouted && scoutResult?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-xs font-bold text-green-800">
                ✅ Backdoor Unlocked!
              </p>
              <p className="text-[10px] text-green-600 mt-0.5">
                {scoutResult.contactsFound || '0'} insider contacts found
              </p>
            </div>
          )}

          {/* View Details */}
          <Button
            onClick={() => onSelect(lead)}
            variant="ghost"
            className="w-full text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            size="sm"
          >
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}