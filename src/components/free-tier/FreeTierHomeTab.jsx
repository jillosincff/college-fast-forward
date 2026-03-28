import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, X } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';

import CareerRoadmap from '@/components/free-tier/CareerRoadmap';

const FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59');

export default function FreeTierHomeTab({ user, onOpenUpgrade, onTabChange }) {
  const foundingOfferActive = user?.membership_tier === 'founding' && new Date() < FOUNDING_DEADLINE;
  const daysLeft = Math.ceil((FOUNDING_DEADLINE - new Date()) / (1000 * 60 * 60 * 24));

  const [parentEmail, setParentEmail] = useState('');
  const [nudgeSent, setNudgeSent] = useState(false);
  const [sendingNudge, setSendingNudge] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Don't show banner for users less than 24h old
    const accountAgeDays = user.created_date ? (Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24) : 0;
    if (accountAgeDays < 1) {
      setShowUpgradeBanner(false);
      return;
    }
    
    // Show if career goals completed OR user has visited 2+ pages/features
    const hasGoals = !!(user?.career_goals?.saved_at);
    const visitCount = (user?.platform_visit_count || 0);
    const hasExploredFeatures = visitCount >= 2;
    
    if (hasGoals || hasExploredFeatures) {
      setShowUpgradeBanner(true);
    } else {
      setShowUpgradeBanner(false);
      base44.auth.updateMe({ platform_visit_count: (user?.platform_visit_count || 0) + 1 }).catch(() => {});
    }
  }, [user]);


  const handleAskParent = async (emailOverride) => {
    const toEmail = emailOverride || parentEmail.trim();
    if (!toEmail) return;
    setSendingNudge(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: toEmail,
        subject: `${user.full_name?.split(' ')[0] || 'Your student'} is ready to activate FastIQ`,
        body: `Hi,

${user.full_name || 'Your student'} has joined College Fast Forward and is ready to activate FastIQ.

FastIQ is their 24/7 personal career agent — it finds alumni contacts, drafts personalized outreach, and builds a daily action plan around their goals.

Activate FastIQ for your family: ${window.location.origin}/#ParentHome

— The College Fast Forward Team`,
      });
      setNudgeSent(true);
      setShowParentModal(false);
    } catch (err) {
      console.error('Failed to send parent nudge:', err);
    }
    setSendingNudge(false);
  };

  const handleAskParentClick = () => {
    if (user?.parent_emails?.length > 0) {
      handleAskParent(user.parent_emails[0]);
    } else {
      setShowParentModal(true);
    }
  };



  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div>
      {/* Hero Section */}
      <div style={{ background: '#0A0A0A', padding: '48px 40px', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, fontWeight: 600,
          color: '#E85D20', letterSpacing: '0.12em',
          textTransform: 'uppercase', margin: '0 0 16px'
        }}>
          College Fast Forward · powered by FastIQ™
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.15, margin: '0 0 16px'
        }}>
          Hey {firstName}. Let's get you hired.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, color: 'rgba(255,255,255,0.6)',
          margin: '0 auto', lineHeight: 1.6,
          maxWidth: 520
        }}>
          No more applying into the void. We'll help you figure out what you want,
          get your story straight, and connect with the right people — step by step.
        </p>
      </div>

      {/* Parent Email Modal */}
      {showParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowParentModal(false)}>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#fff' }}>Ask Your Parent</h3>
              <button onClick={() => setShowParentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', color: '#888' }}><X className="w-4 h-4" /></button>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 16, lineHeight: 1.5 }}>Enter your parent's email and we'll send them a note about activating FastIQ for you.</p>
            <input
              type="email"
              placeholder="Parent's email address"
              value={parentEmail}
              onChange={e => setParentEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-white text-sm mb-4"
            />
            <button
              onClick={() => handleAskParent()}
              disabled={!parentEmail.trim() || sendingNudge}
              className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors disabled:opacity-50"
              style={{ minHeight: 'auto' }}
            >
              {sendingNudge ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Invite →'}
            </button>
          </div>
        </div>
      )}

      {/* Body Sections */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <CareerRoadmap user={user} onTabChange={onTabChange} onOpenUpgrade={onOpenUpgrade} />
      </div>
    </div>
  );
}