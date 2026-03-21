import React, { useState, useEffect } from 'react';
import { Search, Loader2, Linkedin } from 'lucide-react';
import { getDirectoryUsers } from '@/functions/getDirectoryUsers';
import { base44 } from '@/api/base44Client';
import ParentMessageComposer from './ParentMessageComposer';

const FILTERS = ['All', 'Your Industry', 'Actively Helping', 'Recently Active'];

const WAYS_TO_HELP_LABELS = {
  'networking_intros': 'Introductions',
  'intros': 'Introductions',
  'introductions': 'Introductions',
  'job_referrals': 'Job Referrals',
  'referrals': 'Job Referrals',
  'can_provide_referrals': 'Job Referrals',
  'resume_review': 'Resume Review',
  'career_advice': 'Career Advice',
  'industry_insights': 'Industry Insights',
  'mock_interviews': 'Mock Interviews',
  'mentorship': 'Mentorship',
  'networking': 'Networking Help',
};

function formatWaysToHelp(tags) {
  if (!tags || tags.length === 0) return [];
  const mapped = tags.map(tag => WAYS_TO_HELP_LABELS[tag.toLowerCase()] || tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  return [...new Set(mapped)].slice(0, 3);
}

function getInitials(name) {
  if (!name) return 'P';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function maskName(fullName) {
  if (!fullName) return 'Parent';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

const AVAILABILITY_CONFIG = {
  yes: { dot: '#22C55E', label: 'Happy to help' },
  happy_to_help: { dot: '#22C55E', label: 'Happy to help' },
  occasionally: { dot: '#EAB308', label: 'Occasionally available' },
  not_now: { dot: '#9CA3AF', label: 'Not right now' },
  not_right_now: { dot: '#9CA3AF', label: 'Not right now' },
  unknown: { dot: '#D1D5DB', label: 'Availability unknown' },
};

function ParentCard({ parent, user, onMessage }) {
  const availability = parent.intro_willingness || 'unknown';
  const canMessage = availability !== 'not_now' && availability !== 'not_right_now';
  const avail = AVAILABILITY_CONFIG[availability] || AVAILABILITY_CONFIG.unknown;
  const masked = maskName(parent.full_name);
  const initials = getInitials(parent.full_name);

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E85D20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{masked}</p>
          {parent.company ? (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {parent.company}{parent.job_title ? ` · ${parent.job_title}` : ''}
            </p>
          ) : (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa', margin: '2px 0 0', fontStyle: 'italic' }}>Profile incomplete</p>
          )}
        </div>
      </div>

      {/* Industry pill */}
      {parent.industry && (
        <span style={{ display: 'inline-block', background: '#FFF5F0', color: '#E85D20', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, border: '1px solid #FDDBC8', alignSelf: 'flex-start' }}>
          {parent.industry}
        </span>
      )}

      {/* Availability */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: avail.dot, flexShrink: 0 }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666' }}>{avail.label}</span>
      </div>

      {/* LinkedIn */}
      {parent.linkedin_url && (
        <a href={parent.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#E85D20', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <Linkedin style={{ width: 13, height: 13 }} /> View LinkedIn →
        </a>
      )}

      {/* CTA */}
      {canMessage ? (
        <button
          onClick={() => onMessage(parent)}
          className="w-full bg-[#E85D20] text-white py-2.5 rounded-full font-semibold hover:bg-[#d44e14] transition-colors"
          style={{ minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
        >
          Send a Message →
        </button>
      ) : (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#999', textAlign: 'center', margin: 0 }}>
          Not accepting messages right now
        </p>
      )}
    </div>
  );
}

export default function FreeTierDirectoryTab({ user, onOpenUpgrade }) {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedParent, setSelectedParent] = useState(null);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const isFree = !(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const FREE_LIMIT = 5;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDirectoryUsers({});
        const all = res?.data?.data || [];
        // Accept any parent with a name — backend already filtered
        setParents(all.filter(p => p.full_name));
      } catch (e) {
        console.error('Directory load error:', e);
        setParents([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    base44.entities.Message.filter({ sender_email: user.email, message_type: 'directory_initial' })
      .then(msgs => {
        const thisMonth = (msgs || []).filter(m => m.created_date >= monthStart);
        const uniqueRecipients = new Set(thisMonth.map(m => m.recipient_email));
        setMonthlyCount(uniqueRecipients.size);
      }).catch(() => {});
  }, [user?.email]);

  const filtered = parents.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch = !q || (p.full_name || '').toLowerCase().includes(q) || (p.company || '').toLowerCase().includes(q) || (p.industry || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === 'Your Industry') return (user?.target_industries || []).some(i => p.industry === i);
    if (filter === 'Actively Helping') return p.intro_willingness === 'yes' || p.intro_willingness === 'happy_to_help';
    if (filter === 'Recently Active') return !!p.updated_date && (Date.now() - new Date(p.updated_date).getTime()) < 7 * 24 * 60 * 60 * 1000;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        PARENT DIRECTORY
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
        Find someone who can open a door.
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 24 }}>
        Browse parents and professionals in the College Fast Forward network — searchable by industry and company.
      </p>

      {/* Monthly limit banner */}
      {isFree && monthlyCount >= FREE_LIMIT && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#E85D20', marginBottom: 4 }}>
            You've reached your free messaging limit for this month.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', marginBottom: 12 }}>
            Upgrade to FastIQ for unlimited access to the parent network.
          </p>
          <button onClick={onOpenUpgrade} className="bg-[#E85D20] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#d44e14] transition-colors" style={{ minHeight: 'auto' }}>
            Unlock FastIQ →
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
        <input
          type="text"
          placeholder="Search by industry, company, or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-[#E0E0E0] bg-white text-[#1A1A1A]"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-[#E85D20] text-white' : 'bg-white text-[#666] border border-[#E0E0E0] hover:border-[#E85D20]'}`}
            style={{ minHeight: 'auto' }}
          >{f}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#E85D20] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-[#E0E0E0] text-center">
          {search || filter !== 'All' ? (
            <>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 8 }}>No professionals found matching your search.</p>
              <button onClick={() => { setSearch(''); setFilter('All'); }} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#E85D20', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>Clear Search →</button>
            </>
          ) : (
            <>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 8 }}>The network is growing every day.</p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#999' }}>Be the first to connect with professionals in your field.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <ParentCard
              key={p.id}
              parent={p}
              user={user}
              onMessage={(parent) => {
                if (isFree && monthlyCount >= FREE_LIMIT) { onOpenUpgrade(); return; }
                setSelectedParent(parent);
              }}
            />
          ))}
        </div>
      )}

      {selectedParent && (
        <ParentMessageComposer
          user={user}
          parent={selectedParent}
          onClose={() => setSelectedParent(null)}
          onSent={() => { setSelectedParent(null); setMonthlyCount(c => c + 1); }}
        />
      )}
    </div>
  );
}