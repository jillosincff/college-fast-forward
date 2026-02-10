import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { X } from 'lucide-react';

export default function ActivationWelcomeBannerStudent({ user }) {
  const [visible, setVisible] = useState(false);
  const [promptRecord, setPromptRecord] = useState(null);
  const [parentCount, setParentCount] = useState(0);
  const [linkedParentInfo, setLinkedParentInfo] = useState(null); // { name, karma }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadBannerData();
  }, [user?.id]);

  const loadBannerData = async () => {
    try {
      // Check if account is less than 48 hours old
      const createdDate = new Date(user.created_date);
      const hoursSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 48) {
        setLoading(false);
        return;
      }

      // Fetch activation prompt, parent users count, and family karma in parallel
      const [prompts, karmaRecords] = await Promise.all([
        base44.entities.ActivationPrompt.filter({ user_id: user.id }, '-created_date', 1),
        base44.entities.FamilyKarma.filter({}, undefined, 100),
      ]);

      // Check activation prompt
      const prompt = prompts?.[0];
      if (!prompt || prompt.action_taken || prompt.status === 'dismissed') {
        setLoading(false);
        return;
      }

      // Count parent users — use GlobalCounter or estimate
      let parentUserCount = 0;
      try {
        const counters = await base44.entities.GlobalCounter.filter({ counter_name: 'parent_count' });
        if (counters?.[0]) {
          parentUserCount = counters[0].counter_value || 0;
        }
      } catch (e) {
        // Fallback: count karma records as a proxy for parent families
        parentUserCount = (karmaRecords || []).length || 50;
      }
      if (parentUserCount === 0) parentUserCount = 50; // sensible default

      // Check if student has a linked parent via FamilyKarma
      // Look for karma records where the student might be linked
      let linkedParent = null;
      try {
        const linkedParentsResult = await base44.functions.invoke('getLinkedParents', {});
        const parents = linkedParentsResult?.data?.parents || [];
        if (parents.length > 0) {
          const parent = parents[0];
          // Find family karma for this parent
          const parentKarma = (karmaRecords || []).find(k => k.family_group_id);
          linkedParent = {
            name: parent.full_name || parent.email?.split('@')[0] || 'Your parent',
            karma: parentKarma?.total_karma || 0,
          };
        }
      } catch (e) {
        console.log('Could not check linked parents:', e.message);
      }

      setPromptRecord(prompt);
      setParentCount(parentUserCount);
      setLinkedParentInfo(linkedParent);
      setVisible(true);

      // Mark as shown if not already
      if (prompt.status === 'pending') {
        base44.entities.ActivationPrompt.update(prompt.id, {
          status: 'shown',
          shown_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.log('ActivationWelcomeBannerStudent load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setVisible(false);
    if (promptRecord?.id) {
      try {
        await base44.entities.ActivationPrompt.update(promptRecord.id, { status: 'dismissed' });
      } catch (err) {
        console.log('Failed to dismiss activation prompt:', err.message);
      }
    }
  };

  const handleCheckAnswers = () => {
    navigate('Connections');
  };

  const handleBrowseOpportunities = () => {
    navigate('Opportunities');
  };

  const handleShareInvite = () => {
    navigate('GatorParentInvite');
  };

  if (loading || !visible) return null;

  return (
    <div
      className="relative bg-white rounded-2xl"
      style={{
        borderLeft: '4px solid #FA6533',
        padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition"
        aria-label="Dismiss welcome banner"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      <div className="pr-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          🎯 Your question is live — parents are on it!
        </h3>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          <span className="font-semibold text-gray-800">{parentCount}</span> UF parents are on the platform ready to help.
          Check back for answers, or browse what other parents are offering.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCheckAnswers}
            className="font-semibold px-5 py-2.5 rounded-xl text-white text-sm transition hover:scale-105 shadow-md"
            style={{
              backgroundColor: '#0021A5',
              boxShadow: '0 4px 12px rgba(0, 33, 165, 0.3)',
            }}
          >
            Check My Answers →
          </button>

          <button
            onClick={handleBrowseOpportunities}
            className="font-semibold px-5 py-2.5 rounded-xl text-sm transition border-2 hover:bg-gray-50"
            style={{
              borderColor: '#0021A5',
              color: '#0021A5',
            }}
          >
            Browse Parent Opportunities →
          </button>
        </div>

        {/* Linked parent info OR invite CTA */}
        {linkedParentInfo ? (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Your parent <span className="font-semibold text-gray-800">{linkedParentInfo.name}</span> already has{' '}
              <span className="font-semibold" style={{ color: '#FA4616' }}>{linkedParentInfo.karma} Karma</span> boosting your visibility! 🔥
            </p>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              💡 Invite your parent to boost your questions in the feed →{' '}
              <button
                onClick={handleShareInvite}
                className="font-semibold underline transition"
                style={{ color: '#0021A5' }}
              >
                Share Invite Link
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}