import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, X } from 'lucide-react';
import { useCompanyRecs } from '@/components/free-tier/useCompanyRecs';
import AICompanyCards from '@/components/free-tier/AICompanyCards';
import CareerRoadmap from '@/components/free-tier/CareerRoadmap';

export default function FreeTierHomeTab({ user, onOpenUpgrade, onTabChange }) {
  const { companies, members: recsMembers, loading: recsLoading, searching: recsSearching, error: recsError, noIndustry: recsNoIndustry, weeklyNewCount, refetch } = useCompanyRecs(user);

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



  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 2 }}>
            COLLEGE FAST FORWARD
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 400, color: '#888888', marginBottom: 20 }}>
            powered by <span style={{ color: '#E85D20' }}>FastIQ<sup style={{ fontSize: '0.7em', verticalAlign: 'super', lineHeight: 0 }}>™</sup></span>
          </p>
          {user?.career_goals?.archetype && (
            <button
              onClick={() => onTabChange?.('career_goals')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.35)', borderRadius: 100, padding: '6px 14px', marginBottom: 16, cursor: 'pointer', minHeight: 'auto' }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#E85D20' }}>{user.career_goals.archetype}</span>
            </button>
          )}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>
            Your career doesn't start with a resume.
          </h1>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontStyle: 'italic', color: '#E85D20', marginBottom: 16 }}>
            It starts with a plan.
          </p>
          {showUpgradeBanner && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
              You have access to powerful career research tools below. Unlock FastIQ to get your full personalized plan.
            </p>
          )}

          {/* Upgrade Banner — conditional on visit/engagement state */}
          {showUpgradeBanner ? (
            <div className="max-w-2xl mx-auto bg-[#1A1A1A] border border-[#E85D20] rounded-xl p-6">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                🚀 Ready for the full plan?
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.5, marginBottom: 20 }}>
                FastIQ is your 24/7 personal career agent — alumni contacts, personalized outreach, and a daily action plan built around your goals.
              </p>
              <div className="flex flex-col gap-3">
                <button
                    onClick={() => {
                      // Direct checkout instead of opening modal
                      const handleDirectCheckout = async () => {
                        try {
                          const res = await fetch('/functions/createCheckoutSession', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              plan: 'fastiq_monthly',
                              successUrl: `${window.location.origin}/#FastIQ?upgrade=success`,
                              cancelUrl: window.location.href,
                            }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          }
                        } catch (e) {
                          console.error('Checkout error:', e);
                          onOpenUpgrade(); // fallback to modal if direct checkout fails
                        }
                      };
                      handleDirectCheckout();
                    }}
                    className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors"
                    style={{ minHeight: 'auto' }}
                  >
                    Unlock FastIQ →
                  </button>
                {nudgeSent ? (
                  <div className="text-green-400 text-sm font-medium text-center py-2">
                    ✓ Nudge sent to {user?.parent_emails?.[0] || parentEmail}
                  </div>
                ) : (
                  <button
                    onClick={handleAskParentClick}
                    disabled={sendingNudge}
                    className="w-full border border-[#E85D20] text-[#E85D20] py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
                    style={{ minHeight: 'auto' }}
                  >
                    {sendingNudge ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Ask My Parent to Activate →'}
                  </button>
                )}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#666', marginTop: 12, textAlign: 'center' }}>
                Free 7-day trial included. Cancel anytime.
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 }}>
              Let's build yours. Follow the six steps below — in order.
          </p>
          )}
        </div>
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