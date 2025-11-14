import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'week';
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(2024, 0, 1); // All time
    }

    // For now, return mock data to avoid rate limiting issues
    // Later you can replace this with real data queries
    const mockLeaderboard = [
      {
        userId: 'user1',
        user: {
          id: 'user1',
          full_name: 'Sarah Johnson',
          profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          persona: 'alumni'
        },
        offers: 8,
        intros: 12,
        total: 20,
        rank: 1,
        badges: [{
          badge_type: 'super_helper',
          badge_name: 'Super Helper',
          badge_icon: '🌟'
        }]
      },
      {
        userId: 'user2',
        user: {
          id: 'user2',
          full_name: 'Michael Chen',
          profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          persona: 'parent'
        },
        offers: 5,
        intros: 9,
        total: 14,
        rank: 2,
        badges: [{
          badge_type: 'intro_maker',
          badge_name: 'Intro Maker',
          badge_icon: '🤝'
        }]
      },
      {
        userId: 'user3',
        user: {
          id: 'user3',
          full_name: 'Lisa Rodriguez',
          profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          persona: 'alumni'
        },
        offers: 7,
        intros: 6,
        total: 13,
        rank: 3,
        badges: [{
          badge_type: 'mentor_month',
          badge_name: 'Mentor of the Month',
          badge_icon: '🏆'
        }]
      },
      {
        userId: 'user4',
        user: {
          id: 'user4',
          full_name: 'David Park',
          profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          persona: 'parent'
        },
        offers: 4,
        intros: 7,
        total: 11,
        rank: 4,
        badges: []
      },
      {
        userId: 'user5',
        user: {
          id: 'user5',
          full_name: 'Jennifer Kim',
          profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
          persona: 'alumni'
        },
        offers: 3,
        intros: 5,
        total: 8,
        rank: 5,
        badges: [{
          badge_type: 'rising_star',
          badge_name: 'Rising Star',
          badge_icon: '⭐'
        }]
      }
    ];

    return new Response(JSON.stringify({
      leaderboard: mockLeaderboard,
      period,
      totalHelpers: mockLeaderboard.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error getting leaderboard:', error);
    
    // Return mock data even on error to prevent UI breaking
    return new Response(JSON.stringify({
      leaderboard: [],
      period: 'week',
      totalHelpers: 0
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});