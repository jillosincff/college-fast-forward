import React, { useState, useEffect } from 'react';
import { Building2, Pencil, Check, X, Plus, ChevronDown, ChevronUp, ExternalLink, MapPin, FileText, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';

const TIMELINE_LABELS = {
  asap: 'ASAP',
  '3_months': 'Within 3 months',
  '6_months': 'Within 6 months',
  next_year: 'Next year',
  immediately: 'ASAP',
  '1_3_months': '1–3 months',
  '3_6_months': '3–6 months',
  '6_plus_months': '6+ months',
  exploring: 'Exploring',
};

const STAGE_LABELS = {
  just_starting: 'Just starting',
  applying: 'Applying',
  interviewing: 'Interviewing',
  have_offers: 'Have offers',
};

const CHALLENGE_LABELS = {
  dont_know_where_to_start: "Don't know where to start",
  cant_get_responses: "Can't get responses",
  interview_prep: 'Interview prep',
  negotiating: 'Negotiating offers',
  finding_roles: 'Finding roles',
  getting_responses: 'Getting responses',
  networking: 'Building network',
  unsure_what_i_want: 'Exploring options',
};

export default function TargetsPanel({ profile, onResearchCompany, onRerunAssessment, onProfileUpdated, onOpenChat }) {
  const [editing, setEditing] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [researchedSet, setResearchedSet] = useState(new Set());

  useEffect(() => {
    setCompanies((profile?.target_companies || []).map(titleCase));
  }, [profile?.target_companies]);

  // Check which companies have been researched (have intel cache)
  useEffect(() => {
    if (!companies.length) return;
    base44.entities.CompanyIntelCache.filter({}, '-created_date', 50)
      .then(items => {
        const set = new Set();
        items.forEach(item => {
          if (item.company_name) set.add(item.company_name.toLowerCase());
        });
        setResearchedSet(set);
      })
      .catch(() => {});
  }, [companies]);

  const addCompany = () => {
    const name = titleCase(newCompany.trim());
    if (!name || companies.length >= 5 || companies.map(c => c.toLowerCase()).includes(name.toLowerCase())) return;
    setCompanies(prev => [...prev, name]);
    setNewCompany('');
  };

  const removeCompany = (idx) => {
    setCompanies(prev => prev.filter((_, i) => i !== idx));
  };

  const moveCompany = (idx, direction) => {
    const newList = [...companies];
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= newList.length) return;
    [newList[idx], newList[swapIdx]] = [newList[swapIdx], newList[idx]];
    setCompanies(newList);
  };

  const saveTargets = async () => {
    setSaving(true);
    await base44.entities.FastTrackProProfile.update(profile.id, {
      target_companies: companies.map(titleCase),
    });
    setSaving(false);
    setEditing(false);
    if (onProfileUpdated) onProfileUpdated({ ...profile, target_companies: companies.map(titleCase) });
  };

  const cancelEdit = () => {
    setCompanies((profile?.target_companies || []).map(titleCase));
    setNewCompany('');
    setEditing(false);
  };

  const addCompanyDirect = async () => {
    const name = titleCase(newCompany.trim());
    if (!name || !profile?.id) return;
    const updated = [...companies, name];
    await base44.entities.FastTrackProProfile.update(profile.id, { target_companies: updated });
    setCompanies(updated);
    setNewCompany('');
    if (onProfileUpdated) onProfileUpdated({ ...profile, target_companies: updated });
  };

  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  const industry = profile?.target_industry || '—';
  const timeline = TIMELINE_LABELS[profile?.career_timeline] || profile?.career_timeline || '—';
  const stage = STAGE_LABELS[profile?.current_stage] || profile?.current_stage || '—';
  const location = profile?.location_preference || '';

  const saveLocation = async () => {
    if (!profile?.id) return;
    setSavingLocation(true);
    const val = locationInput.trim();
    await base44.entities.FastTrackProProfile.update(profile.id, { location_preference: val });
    setSavingLocation(false);
    setEditingLocation(false);
    if (onProfileUpdated) onProfileUpdated({ ...profile, location_preference: val });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header — tappable on mobile */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0021A5] to-[#0033CC] text-white md:cursor-default"
        style={{ minHeight: 'auto' }}
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span className="text-sm font-bold tracking-wide">YOUR TARGETS</span>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); setCollapsed(false); }}
              className="w-7 h-7 rounded-md bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              <Pencil className="w-3.5 h-3.5 text-white" />
            </button>
          )}
          {/* Only show collapse icon on mobile */}
          <span className="md:hidden">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Body — always visible on desktop, collapsible on mobile */}
      <div className={`${collapsed ? 'hidden md:block' : 'block'}`}>
        {/* Target Companies List */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Companies</p>
          <div className="space-y-1.5">
            {companies.map((c, i) => {
              const isResearched = researchedSet.has(c.toLowerCase());
              return (
                <div key={i} className="flex items-center gap-2 group">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isResearched ? 'bg-green-400' : 'bg-slate-300'}`}
                    style={isResearched ? { boxShadow: '0 0 6px rgba(34,197,94,0.5)' } : {}}
                  />
                  {editing ? (
                    <div className="flex-1 flex items-center gap-1">
                      <span className="flex-1 text-sm text-slate-800 font-medium">{c}</span>
                      {i > 0 && (
                        <button onClick={() => moveCompany(i, -1)} className="w-6 h-6 text-slate-400 hover:text-slate-600 flex items-center justify-center" style={{ minHeight: 'auto', minWidth: 'auto' }}>↑</button>
                      )}
                      {i < companies.length - 1 && (
                        <button onClick={() => moveCompany(i, 1)} className="w-6 h-6 text-slate-400 hover:text-slate-600 flex items-center justify-center" style={{ minHeight: 'auto', minWidth: 'auto' }}>↓</button>
                      )}
                      <button onClick={() => removeCompany(i)} className="w-6 h-6 text-red-400 hover:text-red-600 flex items-center justify-center" style={{ minHeight: 'auto', minWidth: 'auto' }}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onResearchCompany(c)}
                      className="flex-1 text-left text-sm text-slate-800 font-medium hover:text-[#0021A5] transition-colors flex items-center gap-1.5"
                      style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                      {c}
                      <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add new company (edit mode) */}
          {editing && companies.length < 5 && (
            <div className="flex gap-1.5 mt-2">
              <Input
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }}
                placeholder="Add company..."
                className="h-8 text-xs"
              />
              <button
                onClick={addCompany}
                disabled={!newCompany.trim()}
                className="w-8 h-8 rounded-md bg-[#0021A5] text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Edit action buttons */}
          {editing && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveTargets}
                disabled={saving || companies.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0021A5] text-white disabled:opacity-50"
                style={{ minHeight: 'auto' }}
              >
                <Check className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
                style={{ minHeight: 'auto' }}
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}

          {!editing && companies.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">No targets yet</p>
              <p className="text-[11px] text-slate-400">Ask FASTIQ to help you find companies, or add them below.</p>
              <div className="flex gap-1.5">
                <Input
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCompanyDirect();
                    }
                  }}
                  placeholder="Add a company..."
                  className="h-8 text-xs"
                />
                <button
                  onClick={addCompanyDirect}
                  disabled={!newCompany.trim()}
                  className="w-8 h-8 rounded-md bg-[#0021A5] text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Profile Snapshot */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Your Profile</p>
            <button
              onClick={onRerunAssessment}
              className="text-[11px] text-[#0021A5] font-semibold hover:underline"
              style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
              Edit
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 w-16 flex-shrink-0">Industry</span>
              <span className="text-[12px] text-slate-700 font-medium truncate">{industry}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 w-16 flex-shrink-0">Timeline</span>
              <span className="text-[12px] text-slate-700 font-medium">{timeline}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 w-16 flex-shrink-0">Stage</span>
              <span className="text-[12px] text-slate-700 font-medium">{stage}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 w-16 flex-shrink-0">Location</span>
              {editingLocation ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Input
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); saveLocation(); } if (e.key === 'Escape') setEditingLocation(false); }}
                    placeholder="e.g. New York, NY"
                    className="h-6 text-[11px] px-1.5 py-0"
                    autoFocus
                  />
                  <button onClick={saveLocation} disabled={savingLocation} className="w-5 h-5 text-green-600 flex items-center justify-center flex-shrink-0" style={{ minHeight: 'auto', minWidth: 'auto' }}>
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditingLocation(false)} className="w-5 h-5 text-slate-400 flex items-center justify-center flex-shrink-0" style={{ minHeight: 'auto', minWidth: 'auto' }}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : location ? (
                <button
                  onClick={() => { setLocationInput(location); setEditingLocation(true); }}
                  className="text-[12px] text-slate-700 font-medium truncate hover:text-[#0021A5] transition-colors flex items-center gap-1"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  {location}
                </button>
              ) : (
                <button
                  onClick={() => { setLocationInput(''); setEditingLocation(true); }}
                  className="text-[11px] text-[#0021A5] font-semibold hover:underline"
                  style={{ minHeight: 'auto', minWidth: 'auto' }}
                >
                  + Add
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Master Resume Section */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">📄 Master Resume</p>
          {profile?.resume_text ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
                <span className="text-[12px] text-slate-700 font-medium">
                  Last updated {profile.updated_date ? new Date(profile.updated_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'recently'}
                </span>
              </div>
              <button
                onClick={() => onOpenChat?.('Review my resume')}
                className="text-[11px] text-[#0021A5] font-semibold hover:underline"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                Update
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-500">Not uploaded yet</span>
              <button
                onClick={() => onOpenChat?.('Help me build a resume')}
                className="text-[11px] text-[#FA4616] font-bold hover:underline flex items-center gap-1"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                <Upload className="w-3 h-3" />
                Upload Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}