import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/entities/Opportunity';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Sparkles, TrendingUp, MapPin, DollarSign, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function SmartRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState(() => {
    try {
      const saved = localStorage.getItem('gator_saved_opportunities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch all active opportunities
        const allOpportunities = await Opportunity.filter({}, '-created_date', 100);
        
        // AI-powered matching algorithm
        const scoredOpportunities = allOpportunities.map(opp => {
          let score = 0;
          const reasons = [];

          // 1. Major/Field Match (highest weight)
          if (user.major && opp.tags) {
            const majorLower = user.major.toLowerCase();
            const matchingTags = opp.tags.filter(tag => 
              tag.toLowerCase().includes(majorLower) || 
              majorLower.includes(tag.toLowerCase())
            );
            if (matchingTags.length > 0) {
              score += 10;
              reasons.push(`Matches your ${user.major} major`);
            }
          }

          // 2. Career Goals Match
          if (user.target_roles && opp.title) {
            const targetRoles = user.target_roles.toLowerCase().split(',');
            const titleLower = opp.title.toLowerCase();
            if (targetRoles.some(role => titleLower.includes(role.trim()))) {
              score += 8;
              reasons.push('Aligns with your career goals');
            }
          }

          // 3. Industry Match
          if (user.target_industries && opp.tags) {
            const targetIndustries = user.target_industries.toLowerCase().split(',');
            const hasIndustryMatch = opp.tags.some(tag => 
              targetIndustries.some(industry => tag.toLowerCase().includes(industry.trim()))
            );
            if (hasIndustryMatch) {
              score += 7;
              reasons.push('In your target industry');
            }
          }

          // 4. Location Match
          if (user.target_locations && (opp.city || opp.state || opp.location_type === 'remote')) {
            const targetLocations = user.target_locations.toLowerCase().split(',');
            const locationMatch = targetLocations.some(loc => {
              const locTrim = loc.trim();
              return (opp.city && opp.city.toLowerCase().includes(locTrim)) ||
                     (opp.state && opp.state.toLowerCase().includes(locTrim)) ||
                     (locTrim === 'remote' && opp.location_type === 'remote');
            });
            if (locationMatch) {
              score += 6;
              reasons.push('In your preferred location');
            }
          } else if (user.location && (opp.city || opp.state)) {
            const userLocationLower = user.location.toLowerCase();
            if ((opp.city && userLocationLower.includes(opp.city.toLowerCase())) ||
                (opp.state && userLocationLower.includes(opp.state.toLowerCase()))) {
              score += 4;
              reasons.push('Near your location');
            }
          }

          // 5. Experience Level Match (for students/recent grads)
          const isEntryLevel = opp.title.toLowerCase().includes('entry') ||
                              opp.title.toLowerCase().includes('junior') ||
                              opp.title.toLowerCase().includes('new grad') ||
                              opp.description?.toLowerCase().includes('entry level');
          
          if (user.graduation_year) {
            const currentYear = new Date().getFullYear();
            const yearsFromGrad = user.graduation_year - currentYear;
            
            // Recent grad or soon-to-graduate students
            if (yearsFromGrad >= -2 && yearsFromGrad <= 1) {
              if (isEntryLevel) {
                score += 5;
                reasons.push('Entry-level position');
              }
              if (opp.opportunity_type === 'internship') {
                score += 4;
                reasons.push('Internship opportunity');
              }
            }
          }

          // 6. Skills Match (if we had skills field)
          if (user.skills_showcase && opp.description) {
            const matchingSkills = user.skills_showcase.filter(skill =>
              opp.description.toLowerCase().includes(skill.toLowerCase())
            );
            if (matchingSkills.length > 0) {
              score += 3 * matchingSkills.length;
              reasons.push(`Requires your ${matchingSkills.slice(0, 2).join(', ')} skills`);
            }
          }

          // 7. Gator Network Bonus
          if (opp.posting_type === 'manual_entry' && opp.created_by) {
            score += 5;
            reasons.push('Posted by Gator network');
          }

          // 8. Recency Bonus
          const daysOld = (Date.now() - new Date(opp.created_date)) / (1000 * 60 * 60 * 24);
          if (daysOld < 7) {
            score += 3;
            reasons.push('Recently posted');
          } else if (daysOld < 14) {
            score += 1;
          }

          // 9. Remote Work Preference (if available)
          if (opp.location_type === 'remote') {
            score += 2;
            reasons.push('Remote work available');
          }

          // 10. Compensation information available
          if (opp.salary_min || opp.salary_max || opp.hourly_wage) {
            score += 1;
          }

          return {
            ...opp,
            matchScore: score,
            matchReasons: reasons.slice(0, 3) // Top 3 reasons
          };
        });

        // Sort by match score and get top 6
        const topMatches = scoredOpportunities
          .filter(opp => opp.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 6);

        setRecommendations(topMatches);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [user]);

  const toggleSave = (oppId) => {
    setSavedOpportunityIds(prev => {
      const newSaved = prev.includes(oppId)
        ? prev.filter(id => id !== oppId)
        : [...prev, oppId];
      
      try {
        localStorage.setItem('gator_saved_opportunities', JSON.stringify(newSaved));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
      
      return newSaved;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No recommendations yet</p>
            <p className="text-sm text-slate-500">
              Complete your profile to get personalized opportunities
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('ProfileEdit')}
            >
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Recommended For You
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {recommendations.length} matches
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Based on your profile, skills, and career goals
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
              onClick={() => navigate('Opportunities', { view: opp.id })}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 truncate">
                      {opp.title}
                    </h4>
                    {opp.posting_type === 'manual_entry' && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-900 text-xs">
                        🐊 Gator
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">{opp.org_name}</p>
                  
                  {/* Match Reasons */}
                  {opp.matchReasons && opp.matchReasons.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {opp.matchReasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          ✓ {reason}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    {opp.location_type === 'remote' ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Remote
                      </span>
                    ) : (opp.city || opp.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opp.city}{opp.city && opp.state ? ', ' : ''}{opp.state}
                      </span>
                    )}
                    
                    {(opp.salary_display || opp.salary_min || opp.hourly_wage) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {opp.salary_display || 
                         (opp.salary_min && `$${(opp.salary_min / 1000).toFixed(0)}k+`) ||
                         (opp.hourly_wage && `$${opp.hourly_wage}/hr`)}
                      </span>
                    )}

                    <Badge variant="outline" className="text-xs">
                      {opp.opportunity_type === 'student_gig' ? 'Gig' :
                       opp.opportunity_type === 'full_time' ? 'Full-time' :
                       opp.opportunity_type === 'part_time' ? 'Part-time' :
                       opp.opportunity_type === 'internship' ? 'Internship' : opp.opportunity_type}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(opp.id);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {savedOpportunityIds.includes(opp.id) ? (
                      <BookmarkCheck className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Bookmark className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {/* Match Score Indicator */}
                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">
                      {Math.min(99, Math.round((opp.matchScore / 50) * 100))}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => navigate('Opportunities')}
        >
          View All Opportunities
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}