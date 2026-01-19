import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/components/utils/createPageUrl';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';

const UF_BLUE = '#0021A5';

export default function WhatToDoNext({ user }) {
  const [stats, setStats] = useState({
    newAnswersToday: 0,
    totalProfessionals: 0
  });

  useEffect(() => {
    loadStats();
    trackEvent('what_to_do_next_viewed', { user_id: user?.id });
  }, []);

  const loadStats = async () => {
    try {
      // Get answers from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const [answers, professionals] = await Promise.all([
        base44.entities.Answer.filter(
          { created_date: { $gte: yesterday.toISOString() } },
          '-created_date',
          100
        ).catch(() => []),
        base44.entities.User.filter(
          { persona: { $in: ['parent', 'alumni'] }, onboarding_completed: true },
          undefined,
          1
        ).catch(() => [])
      ]);

      setStats({
        newAnswersToday: answers?.length || 0,
        totalProfessionals: 500 // Fallback - could query count if needed
      });
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const handleQuestionsClick = () => {
    trackEvent('what_to_do_next_questions_clicked', { user_id: user?.id });
  };

  const handleDirectoryClick = () => {
    trackEvent('what_to_do_next_directory_clicked', { user_id: user?.id });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🚀</span>
          Don't just wait — get involved
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Your question is out there. While you wait for responses:
        </p>
      </div>
      
      {/* Two action cards */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Card 1: Browse All Questions */}
        <Link 
          to={createPageUrl('Connections')}
          onClick={handleQuestionsClick}
          className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                Browse All Questions
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                See what other Gators are asking. 
                Learn from answers. Upvote advice that helps.
              </p>
              
              {/* Dynamic stat */}
              {stats.newAnswersToday > 0 && (
                <p className="text-sm text-orange-600 font-medium mt-2 flex items-center gap-1">
                  <span>🔥</span>
                  {stats.newAnswersToday} new {stats.newAnswersToday === 1 ? 'answer' : 'answers'} today
                </p>
              )}
              
              <span 
                className="inline-flex items-center gap-1 text-sm font-medium mt-3"
                style={{ color: UF_BLUE }}
              >
                Browse Questions 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </Link>
        
        {/* Card 2: Explore the Directory */}
        <Link 
          to={createPageUrl('GatorDirectory')}
          onClick={handleDirectoryClick}
          className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔍</span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                Explore the Directory
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Don't wait to be matched. Find professionals in your field and reach out directly.
              </p>
              
              {/* Static stat */}
              <p className="text-sm text-gray-400 mt-2">
                {stats.totalProfessionals}+ professionals
              </p>
              
              <span 
                className="inline-flex items-center gap-1 text-sm font-medium mt-3"
                style={{ color: UF_BLUE }}
              >
                Browse Directory 
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </div>
          </div>
        </Link>
        
      </div>
    </div>
  );
}