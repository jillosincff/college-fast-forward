import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, X } from 'lucide-react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { useCompanyRecs } from '@/components/free-tier/useCompanyRecs';
import AICompanyCards from '@/components/free-tier/AICompanyCards';
import CareerRoadmap from '@/components/free-tier/CareerRoadmap';

const FOUNDING_DEADLINE = new Date('2026-04-15T23:59:59');

export default function FreeTierHomeTab({ user, onOpenUpgrade, onTabChange }) {
  const { companies, members: recsMembers, loading: recsLoading, searching: recsSearching, error: recsError, noIndustry: recsNoIndustry, weeklyNewCount, refetch } = useCompanyRecs(user);

  const foundingOfferActive = user?.membership_tier === 'founding' && new Date() < FOUNDING_DEADLINE;
  const daysLeft = Math.ceil((FOUNDING_DEADLINE - new Date()) / (1000 * 60 * 60 * 24));

  const [parentEmail, setParentEmail] = useState('');
  const [nudgeSent, setNudgeSent] = useState(false);
  const [sendingNudge, setSendingNudge] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [alumniCount, setAlumniCount] = useState(null);
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

  useEffect(() => {
    // Fetch dynamic alumni count
    base44.entities.User.filter({}).then(users => {
      const school = (user?.school || user?.university || '').toLowerCase();
      const relevant = users.filter(u => {
        if (u.persona !== 'parent' && u.persona !== 'alumni') return false;
        const uSchool = (u.school || u.university || '').toLowerCase();
        return school && uSchool && uSchool.includes(school.split(' ')[0]);
      });
      setAlumniCount(relevant.length > 0 ? relevant.length : null);
    }).catch(() => setAlumniCount(null));
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
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Career Roadmap */}
        <CareerRoadmap user={user} onTabChange={onTabChange} onOpenUpgrade={onOpenUpgrade} />

        {/* Company Intel Preview */}
        <section>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
            COMPANY INTEL
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
            What's happening at companies that matter.
          </h2>
          <AICompanyCards
            companies={companies}
            members={recsMembers}
            loading={recsLoading}
            searching={recsSearching}
            error={recsError}
            noIndustry={recsNoIndustry}
            onRefetch={refetch}
            onTabChange={onTabChange}
            onOpenUpgrade={onOpenUpgrade}
            user={user}
            isFastIQ={false}
            weeklyNewCount={weeklyNewCount}
            dark={true}
          />
        </section>

        {/* Alumni Network Teaser */}
        <section>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
            YOUR NETWORK
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
            Your school's alumni are already inside.
          </h2>
          <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] mb-4">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
            {alumniCount
              ? `${alumniCount}+ alumni from ${user?.school || 'your school'} are in the College Fast Forward network.`
              : 'Alumni from your school are joining every day.'}
          </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666' }}>
            The more parents who join, the more possibilities you have.
          </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 12, padding: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="relative" style={{ background: '#242424', border: '1px solid #2A2A2A', borderRadius: 8, padding: 16 }}>
                <div className="filter blur-sm">
                  <div className="w-12 h-12 bg-gray-600 rounded-full mb-3" />
                  <p className="font-bold text-gray-400 mb-1">Profile Hidden</p>
                  <p className="text-xs text-gray-500">Senior Analyst</p>
                  <p className="text-xs text-gray-500">Goldman Sachs</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={onOpenUpgrade}
                    className="bg-[#E85D20] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#d44e14] transition-colors flex items-center gap-2"
                    style={{ minHeight: 'auto' }}
                  >
                    🔒 See who to contact →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onTabChange('alumni_network')}
            className="mt-4 text-sm text-[#E85D20] font-medium hover:underline"
            style={{ minHeight: 'auto' }}
          >
            See all alumni →
          </button>
        </section>

        {/* Career Center Preview */}
        <section>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
            CAREER CENTER
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 16 }}>
            What's happening at {user?.school || 'UF'}.
          </h2>
          <div className="bg-white rounded-xl p-6 border border-[#E0E0E0] text-center">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', marginBottom: 16 }}>
              Check back soon — we update this regularly.
            </p>
            <button
              onClick={() => onTabChange('career_center')}
              className="text-sm text-[#E85D20] font-medium hover:underline"
              style={{ minHeight: 'auto' }}
            >
              See all events →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}