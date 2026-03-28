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
  const fastiq = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

  const hasGoals = !!(user?.career_goals?.target_roles?.length > 0);
  const hasResume = !!user?.resume_url;
  const hasSearched = !!user?.alumni_search_used;
  const hasViewedLeads = !!user?.leads_viewed;

  const completedSteps = {
    1: hasGoals,
    2: hasResume,
    3: !!user?.company_intel_viewed,
    4: hasSearched,
    5: hasViewedLeads,
    6: fastiq,
  };
  const allStepsComplete = Object.values(completedSteps).every(Boolean);

  const industries = user?.career_goals?.target_industries || [];
  const location = user?.career_goals?.location_preference || '';

  // Hero copy based on state
  const heroTitle = allStepsComplete
    ? `Hey ${firstName}. You're ready. Now let's get you hired.`
    : hasGoals
    ? `Hey ${firstName}. You're on your way.`
    : `Hey ${firstName}. Let's get you hired.`;

  const heroSub = allStepsComplete
    ? 'All steps complete. Time to activate your network.'
    : hasGoals
    ? `You're working through the plan. Keep going — every step unlocks something.`
    : `No more applying into the void. We'll help you figure out what you want, get your story straight, and connect with the right people — step by step.`;

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: '#0A0A0A',
        padding: hasGoals ? '32px 40px' : '48px 40px',
        textAlign: 'center'
      }}>
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
          fontSize: hasGoals ? 'clamp(22px, 4vw, 34px)' : 'clamp(28px, 5vw, 48px)',
          fontWeight: 700, color: '#fff',
          lineHeight: 1.15, margin: '0 0 12px'
        }}>
          {heroTitle}
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 15, color: 'rgba(255,255,255,0.6)',
          margin: '0 auto', lineHeight: 1.6,
          maxWidth: 500
        }}>
          {heroSub}
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

      {/* Roadmap — always shown */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <CareerRoadmap user={user} onTabChange={onTabChange} onOpenUpgrade={onOpenUpgrade} />

        {/* STATE 2: Snapshot card */}
        {hasGoals && !allStepsComplete && (
          <div style={{
            background: '#fff',
            border: '1px solid #E5E5E5',
            borderRadius: 16,
            padding: '24px 28px',
            marginTop: 32,
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#E85D20', margin: '0 0 12px'
            }}>
              YOUR SNAPSHOT
            </p>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, fontWeight: 700,
              color: '#1A1A1A', margin: '0 0 8px'
            }}>
              {industries.length > 0
                ? `You're targeting ${industries[0]}${location ? ` in ${location}` : ''}.`
                : `You're building your career plan.`}
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: '#555',
              margin: '0 0 20px', lineHeight: 1.6
            }}>
              Keep going — the more you complete, the better your matches get.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>750+</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>UF Gators in the network</p>
              </div>
              <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>1</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>free alumni search waiting</p>
              </div>
              <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{user?.career_goals?.target_roles?.length || 0}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>target roles identified</p>
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: All steps complete — activity snapshot + CTA */}
        {allStepsComplete && (
          <div style={{
            background: '#fff',
            border: '1px solid #E5E5E5',
            borderRadius: 16,
            padding: '24px 28px',
            marginTop: 32,
          }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#E85D20', margin: '0 0 12px'
            }}>
              YOUR ACTIVITY
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>750+</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>UF Gators in the network</p>
              </div>
              <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{user?.career_goals?.target_roles?.length || 0}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>target roles identified</p>
              </div>
              <div style={{ background: '#F5F5F5', borderRadius: 10, padding: '12px 16px', flex: 1, minWidth: 140 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{industries.length}</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>industries targeted</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => onTabChange('career_goals')}
                style={{
                  background: '#E85D20', border: 'none',
                  borderRadius: 10, padding: '13px 28px',
                  fontSize: 15, fontWeight: 600, color: '#fff',
                  cursor: 'pointer', minHeight: 'auto',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Find My Leads →
              </button>
              <button
                onClick={() => onTabChange('company_intel')}
                style={{
                  background: 'transparent', border: '1.5px solid #E85D20',
                  borderRadius: 10, padding: '11px 24px',
                  fontSize: 14, fontWeight: 600, color: '#E85D20',
                  cursor: 'pointer', minHeight: 'auto',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Company Intel →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}