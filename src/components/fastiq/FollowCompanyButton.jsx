import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const MAX_FOLLOWED = 20;

export default function FollowCompanyButton({ companyName, user, iconOnly = false, className = '' }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (!user?.email || !companyName) { setLoading(false); return; }
    base44.entities.FollowedCompany.filter({ student_email: user.email, company_name: companyName })
      .then(records => {
        if (records?.length > 0) { setFollowing(true); setRecordId(records[0].id); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.email, companyName]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (loading || !user?.email) return;

    if (following) {
      // Unfollow
      if (recordId) await base44.entities.FollowedCompany.delete(recordId);
      setFollowing(false);
      setRecordId(null);
      toast.success(`Unfollowed ${companyName}`);
    } else {
      // Check limit
      const all = await base44.entities.FollowedCompany.filter({ student_email: user.email });
      if (all.length >= MAX_FOLLOWED) {
        toast.error(`You're following ${MAX_FOLLOWED} companies — unfollow one to make room.`);
        return;
      }
      const record = await base44.entities.FollowedCompany.create({
        student_email: user.email,
        company_name: companyName,
        added_at: new Date().toISOString(),
        last_signal: 'yellow',
        alerts_enabled: true,
      });
      setFollowing(true);
      setRecordId(record.id);
      toast.success(`Following ${companyName} — FASTIQ will alert you to changes`);
    }
  };

  if (loading) return null;

  if (iconOnly) {
    return (
      <button
        onClick={handleToggle}
        title={following ? `Following ${companyName}` : `Follow ${companyName}`}
        className={className}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          color: following ? '#E85D20' : 'rgba(148,163,184,0.6)',
          transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
          transform: 'scale(1)',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Bookmark className="w-4 h-4" fill={following ? '#E85D20' : 'none'} />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 12px', borderRadius: 100, cursor: 'pointer',
        background: following ? 'rgba(232,93,32,0.1)' : 'rgba(255,255,255,0.05)',
        border: following ? '0.5px solid rgba(232,93,32,0.25)' : '0.5px solid rgba(255,255,255,0.1)',
        color: following ? '#E85D20' : 'rgba(244,240,232,0.4)',
        fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, fontWeight: 400,
        transition: 'all 0.2s', minHeight: 'auto', width: 'auto',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,93,32,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = following ? 'rgba(232,93,32,0.25)' : 'rgba(255,255,255,0.1)'; }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <Bookmark className="w-3.5 h-3.5" fill={following ? '#E85D20' : 'none'} />
      {following ? 'Following' : 'Follow'}
    </button>
  );
}