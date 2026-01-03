import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Check if user is admin
    if (!user || !user.roles?.includes('admin')) {
      console.log('Unauthorized access attempt:', user?.email);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized. Admin access required.' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Admin analytics requested by:', user.email);

    // Use service role for admin analytics
    const serviceRole = base44.asServiceRole;

    // Fetch entities with better error handling and reduced limits for speed
    const fetchEntity = async (entityName, limit = 50) => { // Reduced default limit from 100 to 50
      try {
        console.log(`Fetching ${entityName}...`);
        
        // Shorter timeout per entity
        const fetchWithTimeout = (timeoutMs = 5000) => { // Reduced timeout from 8000ms to 5000ms
          return Promise.race([
            serviceRole.entities[entityName].list('-created_date', limit),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout fetching ${entityName}`)), timeoutMs)
            )
          ]);
        };
        
        const data = await fetchWithTimeout();
        console.log(`✓ Fetched ${data?.length || 0} ${entityName} records`);
        return data || [];
      } catch (error) {
        console.error(`✗ Error fetching ${entityName}:`, error.message);
        return [];
      }
    };

    // Fetch ALL users for accurate count, limited data for other entities
    const [
      users,
      jobRequests,
      messages,
      opportunities,
      roommatePosts
    ] = await Promise.all([
      fetchEntity('User', 9999), // Fetch all users for accurate analytics
      fetchEntity('JobRequest', 75),
      fetchEntity('Message', 50),
      fetchEntity('Opportunity', 75),
      fetchEntity('RoommatePost', 30)
    ]);

    console.log('Data fetched successfully:', {
      users: users.length,
      jobRequests: jobRequests.length,
      messages: messages.length,
      opportunities: opportunities.length,
      roommatePosts: roommatePosts.length
    });

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // USER GROWTH ANALYTICS
    const userGrowth = calculateUserGrowth(users, oneWeekAgo, oneMonthAgo);

    // FEATURE USAGE ANALYTICS
    const featureUsage = calculateFeatureUsage(
      jobRequests, 
      messages, 
      opportunities, 
      roommatePosts,
      users,
      oneWeekAgo
    );

    // PERFORMANCE ANALYTICS (mock data for now)
    const performance = generatePerformanceMetrics();

    // DATABASE ANALYTICS
    const database = calculateDatabaseMetrics(
      users,
      jobRequests,
      messages,
      opportunities,
      roommatePosts,
      oneWeekAgo
    );

    const analytics = {
      userGrowth,
      featureUsage,
      performance,
      database,
      generatedAt: new Date().toISOString()
    };

    console.log('Analytics generated successfully');

    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate analytics',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateUserGrowth(users, oneWeekAgo, oneMonthAgo) {
  const total = users.length;
  
  // Filter users created this week
  const thisWeek = users.filter(u => {
    if (!u.created_date) return false;
    const created = new Date(u.created_date);
    return created >= oneWeekAgo;
  }).length;
  
  // Filter users created last week (for comparison)
  const lastWeek = users.filter(u => {
    if (!u.created_date) return false;
    const created = new Date(u.created_date);
    const twoWeeksAgo = new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    return created >= twoWeeksAgo && created < oneWeekAgo;
  }).length;

  // User type breakdown - check for empty string, null, and undefined
  const byType = users.reduce((acc, user) => {
    const hasValidPersona = user.persona && user.persona.trim() !== '';
    const type = hasValidPersona ? user.persona : 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Daily signups for the last 30 days
  const dailySignups = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(new Date().getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const count = users.filter(u => 
      u.created_date && u.created_date.startsWith(dateStr)
    ).length;
    
    dailySignups.push({
      date: dateStr,
      count: count
    });
  }

  const growth = thisWeek - lastWeek;
  const weeklyGrowthPercent = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0);

  return {
    total,
    thisWeek,
    growth,
    weeklyGrowth: weeklyGrowthPercent,
    byType,
    dailySignups
  };
}

function calculateFeatureUsage(jobRequests, messages, opportunities, roommatePosts, users, oneWeekAgo) {
  // Active users (those who created content in the last week)
  const activeUserEmails = new Set();
  
  jobRequests.filter(j => j.created_date && new Date(j.created_date) >= oneWeekAgo)
    .forEach(j => j.created_by && activeUserEmails.add(j.created_by));
  messages.filter(m => m.created_date && new Date(m.created_date) >= oneWeekAgo)
    .forEach(m => m.sender_email && activeUserEmails.add(m.sender_email));
  opportunities.filter(o => o.created_date && new Date(o.created_date) >= oneWeekAgo)
    .forEach(o => o.created_by && activeUserEmails.add(o.created_by));

  const topFeatures = [
    { name: 'Job Requests', usage: jobRequests.length },
    { name: 'Messages', usage: messages.length },
    { name: 'Opportunities', usage: opportunities.length },
    { name: 'Roommate Posts', usage: roommatePosts.length },
    { name: 'Active Users This Week', usage: activeUserEmails.size },
  ].sort((a, b) => b.usage - a.usage);

  return {
    jobRequests: {
      total: jobRequests.length,
      thisWeek: jobRequests.filter(j => j.created_date && new Date(j.created_date) >= oneWeekAgo).length
    },
    messages: {
      total: messages.length,
      thisWeek: messages.filter(m => m.created_date && new Date(m.created_date) >= oneWeekAgo).length
    },
    profileViews: {
      total: Math.floor(users.length * 2.3), // Mock data
      thisWeek: Math.floor(activeUserEmails.size * 1.5) // Mock data
    },
    activeToday: Math.floor(activeUserEmails.size * 0.3), // Mock estimate
    topFeatures
  };
}

function generatePerformanceMetrics() {
  const timeline = [];
  for (let i = 23; i >= 0; i--) {
    timeline.push({
      hour: (new Date().getHours() - i + 24) % 24,
      responseTime: Math.floor(Math.random() * 200) + 150,
      errorCount: Math.floor(Math.random() * 3)
    });
  }

  return {
    avgLoadTime: Math.floor(Math.random() * 500) + 1200,
    errorRate: (Math.random() * 0.5).toFixed(2),
    avgApiTime: Math.floor(Math.random() * 100) + 200,
    uptime: (99.5 + Math.random() * 0.49).toFixed(2),
    timeline
  };
}

function calculateDatabaseMetrics(users, jobRequests, messages, opportunities, roommatePosts, oneWeekAgo) {
  const entities = [
    { name: 'Users', count: users.length, avgQueryTime: Math.floor(Math.random() * 50) + 20 },
    { name: 'JobRequests', count: jobRequests.length, avgQueryTime: Math.floor(Math.random() * 30) + 15 },
    { name: 'Messages', count: messages.length, avgQueryTime: Math.floor(Math.random() * 25) + 10 },
    { name: 'Opportunities', count: opportunities.length, avgQueryTime: Math.floor(Math.random() * 35) + 20 },
    { name: 'RoommatePosts', count: roommatePosts.length, avgQueryTime: Math.floor(Math.random() * 30) + 15 }
  ].sort((a, b) => b.count - a.count);

  const totalRecords = entities.reduce((sum, e) => sum + e.count, 0);
  const recordsThisWeek = [
    users.filter(u => u.created_date && new Date(u.created_date) >= oneWeekAgo).length,
    jobRequests.filter(j => j.created_date && new Date(j.created_date) >= oneWeekAgo).length,
    messages.filter(m => m.created_date && new Date(m.created_date) >= oneWeekAgo).length,
    opportunities.filter(o => o.created_date && new Date(o.created_date) >= oneWeekAgo).length,
    roommatePosts.filter(r => r.created_date && new Date(r.created_date) >= oneWeekAgo).length
  ].reduce((sum, count) => sum + count, 0);

  return {
    totalRecords,
    recordsThisWeek,
    avgQueryTime: Math.floor(entities.reduce((sum, e) => sum + e.avgQueryTime, 0) / entities.length),
    storageUsed: Math.floor(totalRecords * 0.5),
    storageLimit: 10000,
    slowQueries: Math.floor(Math.random() * 3),
    entityBreakdown: entities
  };
}