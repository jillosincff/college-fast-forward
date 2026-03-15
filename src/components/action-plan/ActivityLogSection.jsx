import React, { useState } from 'react';
import { Plus, Send, MessageCircle, Users, Calendar, CheckCircle2, Star, FileText, Building2, Search, UserPlus, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AddActivityModal from './AddActivityModal';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

const ACTIVITY_CONFIG = {
  outreach_sent: { icon: Send, bg: 'rgba(33,150,243,0.1)', color: '#2196F3', label: 'Sent outreach to' },
  reply_received: { icon: MessageCircle, bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', label: 'Received reply from' },
  conversation_had: { icon: Users, bg: 'rgba(232,93,32,0.1)', color: orange, label: 'Had a conversation with' },
  interview_scheduled: { icon: Calendar, bg: 'rgba(156,39,176,0.1)', color: '#9C27B0', label: 'Scheduled interview at' },
  interview_completed: { icon: CheckCircle2, bg: 'rgba(76,175,80,0.1)', color: '#4CAF50', label: 'Completed interview at' },
  offer_received: { icon: Star, bg: 'rgba(232,93,32,0.15)', color: orange, label: 'Received offer from' },
  resume_tailored: { icon: FileText, bg: 'rgba(0,0,0,0.04)', color: '#666', label: 'Tailored resume for' },
  company_researched: { icon: Building2, bg: 'rgba(0,0,0,0.04)', color: '#666', label: 'Researched' },
  question_posted: { icon: Search, bg: 'rgba(0,0,0,0.04)', color: '#666', label: 'Posted a question about' },
  alumni_found: { icon: UserPlus, bg: 'rgba(33,150,243,0.1)', color: '#2196F3', label: 'Found alumni at' },
  follow_up_sent: { icon: ArrowUpRight, bg: 'rgba(33,150,243,0.1)', color: '#2196F3', label: 'Sent follow-up to' },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'outreach', label: 'Outreach', types: ['outreach_sent', 'follow_up_sent', 'reply_received'] },
  { key: 'conversations', label: 'Conversations', types: ['conversation_had'] },
  { key: 'research', label: 'Research', types: ['company_researched', 'alumni_found'] },
  { key: 'interviews', label: 'Interviews', types: ['interview_scheduled', 'interview_completed', 'offer_received'] },
];

function ActivityRow({ activity }) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.company_researched;
  const Icon = config.icon;
  const target = activity.contact_name
    ? `${activity.contact_name}${activity.company_name ? ` at ${activity.company_name}` : ''}`
    : activity.company_name || '';
  const timeAgo = getTimeAgo(new Date(activity.created_date));

  // Follow-up badge
  const followUpBadge = (() => {
    if (!activity.follow_up_due_at || activity.follow_up_complete) return null;
    const due = new Date(activity.follow_up_due_at);
    const now = new Date();
    const daysUntil = Math.ceil((due - now) / (24 * 60 * 60 * 1000));
    if (daysUntil < 0) return { text: 'Follow up overdue', color: '#e53935', bg: 'rgba(229,57,53,0.08)' };
    if (daysUntil === 0) return { text: 'Follow up today', color: orange, bg: 'rgba(232,93,32,0.08)' };
    return { text: `Follow up in ${daysUntil}d`, color: '#aaa', bg: 'rgba(0,0,0,0.04)' };
  })();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: config.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 16, height: 16, color: config.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {config.label} {target}
        </p>
        {activity.notes && (
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#888', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activity.notes}
            {activity.fastiq_generated && <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: orange, marginLeft: 6 }}>via FASTIQ</span>}
          </p>
        )}
        {!activity.notes && activity.fastiq_generated && (
          <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 400, color: orange, margin: '2px 0 0' }}>via FASTIQ</p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 300, color: '#bbb' }}>{timeAgo}</span>
        {followUpBadge && (
          <span style={{
            fontFamily: dmSans, fontSize: 10, fontWeight: 500,
            color: followUpBadge.color, background: followUpBadge.bg,
            padding: '2px 8px', borderRadius: 100, whiteSpace: 'nowrap',
          }}>
            {followUpBadge.text}
          </span>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityLogSection({ activities, userEmail, onActivityAdded }) {
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === 'all'
    ? activities
    : activities.filter(a => {
        const tab = FILTER_TABS.find(t => t.key === filter);
        return tab?.types?.includes(a.type);
      });

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          Recent Activity
        </h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: orange,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            minHeight: 'auto', width: 'auto',
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Add manually →
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }} className="scrollbar-hide">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              fontFamily: dmSans, fontSize: 12, fontWeight: filter === tab.key ? 500 : 400,
              color: filter === tab.key ? '#fff' : '#666',
              background: filter === tab.key ? '#1a1a1a' : 'rgba(0,0,0,0.04)',
              border: 'none', borderRadius: 100, padding: '6px 14px',
              cursor: 'pointer', whiteSpace: 'nowrap',
              minHeight: 'auto', width: 'auto',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#aaa' }}>
              No activity yet. Start by researching a company or sending outreach via FASTIQ.
            </p>
          </div>
        ) : (
          filtered.slice(0, 20).map(a => <ActivityRow key={a.id} activity={a} />)
        )}
      </div>

      {showModal && (
        <AddActivityModal
          userEmail={userEmail}
          onClose={() => setShowModal(false)}
          onAdded={(a) => { onActivityAdded(a); setShowModal(false); }}
        />
      )}
    </div>
  );
}