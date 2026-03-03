import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Plus, Check, Sparkles, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import titleCase from '@/components/utils/titleCase';

const SIZE_LABELS = { large: 'Large', mid_size: 'Mid-size', startup: 'Startup', enterprise: 'Enterprise' };

export default function CompanySuggestionsCard({ data, onResearchCompany, profile, onProfileUpdated }) {
  const [addedSet, setAddedSet] = useState(new Set());
  const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];

  if (!suggestions.length) return null;

  const handleAddToTargets = async (companyName) => {
    if (!profile?.id) return;
    const name = titleCase(companyName);
    const current = (profile.target_companies || []).map(c => c.toLowerCase());
    if (current.includes(name.toLowerCase()) || current.length >= 5) {
      toast.info(current.length >= 5 ? 'You already have 5 target companies' : `${name} is already in your targets`);
      return;
    }
    const updated = [...(profile.target_companies || []), name];
    await base44.entities.FastTrackProProfile.update(profile.id, { target_companies: updated });
    setAddedSet(prev => new Set([...prev, name.toLowerCase()]));
    if (onProfileUpdated) onProfileUpdated({ ...profile, target_companies: updated });
    toast.success(`${name} added to your targets!`);
  };

  return (
    <Card className="p-4 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 mt-2 mb-1">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700 uppercase">Company Suggestions</span>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const name = titleCase(s.company_name || s.name || '');
          const isAdded = addedSet.has(name.toLowerCase()) ||
            (profile?.target_companies || []).map(c => c.toLowerCase()).includes(name.toLowerCase());

          return (
            <div key={i} className="bg-white rounded-xl border border-emerald-100 p-3">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    {s.size && (
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {SIZE_LABELS[s.size] || s.size}
                      </Badge>
                    )}
                  </div>
                </div>
                {s.hiring_status && (
                  <Badge className={`text-[10px] border-0 flex-shrink-0 ${
                    s.hiring_status === 'actively_hiring' ? 'bg-green-100 text-green-700' :
                    s.hiring_status === 'some_openings' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {s.hiring_status === 'actively_hiring' ? '🟢 Hiring' :
                     s.hiring_status === 'some_openings' ? '🟡 Some openings' : s.hiring_status}
                  </Badge>
                )}
              </div>

              {s.location && (
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="text-[11px] text-slate-500">{s.location}</span>
                </div>
              )}

              {s.reason && (
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{s.reason}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => onResearchCompany?.(name)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0021A5] text-white hover:bg-[#001580] transition-colors"
                  style={{ minHeight: 'auto' }}
                >
                  <Search className="w-3 h-3" /> Research
                </button>
                <button
                  onClick={() => handleAddToTargets(name)}
                  disabled={isAdded}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-600 cursor-default'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  style={{ minHeight: 'auto' }}
                >
                  {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add to Targets</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}