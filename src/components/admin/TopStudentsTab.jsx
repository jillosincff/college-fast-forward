import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Copy, Trophy, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const TIER_ORDER = ['fast_tracked', 'rising', 'building_momentum', 'just_getting_started'];
const TIER_DISPLAY = {
  fast_tracked: { label: 'Fast Tracked', icon: '🏆', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  rising: { label: 'Rising', icon: '⭐⭐⭐', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  building_momentum: { label: 'Building Momentum', icon: '⭐⭐', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  just_getting_started: { label: 'Just Getting Started', icon: '⭐', color: 'bg-slate-100 text-slate-700 border-slate-300' },
};

const ATTR_LABELS = {
  came_prepared: 'Came prepared', asked_great_questions: 'Great questions',
  strong_communicator: 'Strong communicator', professional_demeanor: 'Professional',
  followed_up: 'Follows up', would_refer: 'Would refer', would_hire: 'Would hire',
};

export default function TopStudentsTab() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allProfiles = await base44.entities.FastTrackProfile.filter({}, '-completed_interactions', 200);
      setProfiles(allProfiles || []);
    } catch (e) {
      console.error('Failed to load profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentFeedback = async (studentEmail) => {
    if (feedback[studentEmail]) return;
    try {
      const fb = await base44.entities.InteractionFeedback.filter({ student_email: studentEmail }, '-created_date', 50);
      setFeedback(prev => ({ ...prev, [studentEmail]: fb || [] }));
    } catch (e) { console.error('Feedback load error:', e); }
  };

  const tierCounts = TIER_ORDER.reduce((acc, t) => {
    acc[t] = profiles.filter(p => (p.current_tier || 'just_getting_started') === t).length;
    return acc;
  }, {});

  const filtered = profiles
    .filter(p => tierFilter === 'all' || (p.current_tier || 'just_getting_started') === tierFilter)
    .sort((a, b) => {
      const tierDiff = TIER_ORDER.indexOf(a.current_tier || 'just_getting_started') - TIER_ORDER.indexOf(b.current_tier || 'just_getting_started');
      if (tierDiff !== 0) return tierDiff;
      return (b.total_feedback || 0) - (a.total_feedback || 0);
    });

  const handleExpand = (profile) => {
    if (expandedId === profile.id) { setExpandedId(null); return; }
    setExpandedId(profile.id);
    loadStudentFeedback(profile.user_email);
  };

  const copyProfileLink = (profile) => {
    const url = `${window.location.origin}/#PublicProfile?slug=${profile.user_email}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Profile link copied to clipboard' });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-slate-600">Loading top students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TIER_ORDER.map(tier => {
          const info = TIER_DISPLAY[tier];
          return (
            <Card key={tier} className={`cursor-pointer hover:shadow-md transition-shadow ${tierFilter === tier ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => setTierFilter(tierFilter === tier ? 'all' : tier)}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-2xl">{info.icon}</p>
                <p className="text-2xl font-bold text-slate-900">{tierCounts[tier]}</p>
                <p className="text-xs text-slate-600">{info.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {TIER_ORDER.map(t => <SelectItem key={t} value={t}>{TIER_DISPLAY[t].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
        <span className="text-sm text-slate-500 ml-auto">{filtered.length} students</span>
      </div>

      {/* Student List */}
      <Card>
        <CardContent className="p-0">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 bg-slate-50 border-b text-xs font-semibold text-slate-600 uppercase">
            <span>Student</span><span>Tier</span><span>Reviews</span><span>Would Refer</span><span>Top Attribute</span><span>Last Reviewed</span>
          </div>

          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">No students match this filter</div>
            )}
            {filtered.map(p => {
              const tier = p.current_tier || 'just_getting_started';
              const tierInfo = TIER_DISPLAY[tier];
              const isExpanded = expandedId === p.id;
              const studentFb = feedback[p.user_email] || [];

              // Top attribute from profile data
              const topAttr = p.positive_feedback > 0 ? 'Positive feedback' : '—';

              return (
                <div key={p.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 hover:bg-slate-50 cursor-pointer items-center"
                    onClick={() => handleExpand(p)}>
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{p.user_name || p.user_email}</p>
                        <p className="text-xs text-slate-500">{p.user_email}</p>
                      </div>
                    </div>
                    <Badge className={`${tierInfo.color} border text-xs w-fit`}>{tierInfo.icon} {tierInfo.label}</Badge>
                    <span className="text-sm text-slate-700">{p.total_feedback || 0}</span>
                    <span className="text-sm text-slate-700">{p.would_refer_count || 0}</span>
                    <span className="text-sm text-slate-700">{topAttr}</span>
                    <span className="text-xs text-slate-500">{p.last_activity_date ? new Date(p.last_activity_date).toLocaleDateString() : '—'}</span>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-blue-50/50 border-t space-y-4">
                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Completed', value: p.completed_interactions || 0 },
                          { label: 'Positive FB', value: p.positive_feedback || 0 },
                          { label: 'Reliability', value: `${p.reliability_score || 0}%` },
                          { label: 'Follow-up', value: `${p.follow_up_rate || 0}%` },
                          { label: 'Would Refer', value: p.would_refer_count || 0 },
                          { label: 'Would Hire', value: p.would_hire_count || 0 },
                          { label: 'Streak', value: p.weekly_activity_streak || 0 },
                          { label: 'Avg Score', value: p.avg_impression_score || 0 },
                        ].map((m, i) => (
                          <div key={i} className="bg-white rounded-lg p-2 border text-center">
                            <p className="text-lg font-bold text-slate-900">{m.value}</p>
                            <p className="text-xs text-slate-500">{m.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Feedback comments (admin sees reviewer names) */}
                      {studentFb.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">Feedback ({studentFb.length})</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {studentFb.map((fb, i) => (
                              <div key={i} className="bg-white rounded border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">{fb.overall_impression}</Badge>
                                  {fb.recommend_coaching && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Coaching recommended</Badge>}
                                </div>
                                {fb.open_feedback && <p className="text-sm text-slate-700 italic">"{fb.open_feedback}"</p>}
                                {(fb.positive_attributes || []).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {fb.positive_attributes.map((a, j) => (
                                      <Badge key={j} variant="outline" className="text-xs">{ATTR_LABELS[a] || a}</Badge>
                                    ))}
                                  </div>
                                )}
                                <p className="text-xs text-slate-400 mt-1">
                                  By: {fb.reviewer_name || fb.reviewer_email} | {new Date(fb.created_date).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyProfileLink(p); }}>
                          <Copy className="w-3 h-3 mr-1" /> Copy Profile Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}