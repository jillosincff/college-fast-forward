import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { JobRequest } from '@/entities/JobRequest';
import { Opportunity } from '@/entities/Opportunity';
import { Answer } from '@/entities/Answer';
import AlumniHeroSection from '@/components/alumni-dashboard/AlumniHeroSection';
import AlumniLiveActivityBar from '@/components/alumni-dashboard/AlumniLiveActivityBar';
import AlumniStudentQuestionsSection from '@/components/alumni-dashboard/AlumniStudentQuestionsSection';
import AlumniRequestsSection from '@/components/alumni-dashboard/AlumniRequestsSection';
import AlumniLeaderboardSection from '@/components/alumni-dashboard/AlumniLeaderboardSection';
import AlumniQuickActionsSection from '@/components/alumni-dashboard/AlumniQuickActionsSection';
import AlumniYourRequestsCard from '@/components/alumni-dashboard/AlumniYourRequestsCard';
import AlumniPostRequestModal from '@/components/alumni-dashboard/AlumniPostRequestModal';

export default function AlumniDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [showPostRequestModal, setShowPostRequestModal] = useState(false);
  
  // Dashboard data
  const [karma, setKarma] = useState(0);
  const [studentsHelped, setStudentsHelped] = useState(0);
  const [alumniHelped, setAlumniHelped] = useState(0);
  const [myRequests, setMyRequests] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [alumniRequests, setAlumniRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        allJobRequests,
        myOpportunities,
        myAnswers,
        allRecentAnswers
      ] = await Promise.all([
        JobRequest.filter({ status: 'active' }, '-created_date', 100),
        Opportunity.filter({ created_by: user.email }, '-created_date', 10),
        Answer.filter({ answerer_email: user.email }, '-created_date', 50),
        Answer.filter({}, '-created_date', 200) // Get recent answers for leaderboard
      ]);

      // Calculate karma based on answers
      const karmaPoints = myAnswers.reduce((total, answer) => {
        let points = 10; // Base points per answer
        points += (answer.upvote_count || 0) * 5;
        if (answer.is_best_answer) points += 50;
        return total + points;
      }, 0);
      setKarma(karmaPoints + (user.karma_points || 0));

      // Count students helped (answers to student questions)
      const studentAnswers = myAnswers.filter(a => 
        a.question_type !== 'alumni_request'
      );
      setStudentsHelped(studentAnswers.length);

      // Count alumni helped
      const alumniAnswers = myAnswers.filter(a => 
        a.question_type === 'alumni_request'
      );
      setAlumniHelped(alumniAnswers.length);

      // My jobs
      setMyJobs(myOpportunities);

      // My alumni requests (career help requests I've posted)
      const myAlumniRequests = allJobRequests.filter(r => 
        r.is_alumni_career_request && r.poster_email === user.email
      );
      setMyRequests(myAlumniRequests);

      // Student questions (exclude alumni requests)
      const studentQs = allJobRequests.filter(r => 
        !r.is_alumni_career_request && r.poster_type === 'student'
      );
      
      // Smart matching based on alumni's industry
      const matchedQuestions = matchQuestionsToAlumni(studentQs, user);
      setStudentQuestions(matchedQuestions.slice(0, 5));

      // Alumni requests (from other alumni)
      const otherAlumniRequests = allJobRequests.filter(r => 
        r.is_alumni_career_request && r.poster_email !== user.email
      );
      setAlumniRequests(otherAlumniRequests.slice(0, 5));

      // Build real leaderboard from actual answer data
      const realLeaderboard = buildLeaderboard(user, karmaPoints, allRecentAnswers);
      setLeaderboard(realLeaderboard);

      // Recent activity from real answers
      const activity = buildRecentActivity(allRecentAnswers);
      setRecentActivity(activity);

    } catch (error) {
      console.error('Failed to load alumni dashboard data:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load dashboard data", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const matchQuestionsToAlumni = (questions, alumniUser) => {
    const alumniIndustry = alumniUser.industry?.toLowerCase() || '';
    const alumniSkills = (alumniUser.skills || []).map(s => s.toLowerCase());
    
    return questions.map(q => {
      let score = 0;
      let matchReason = null;

      // Industry match
      if (q.target_industry?.toLowerCase() === alumniIndustry) {
        score += 50;
        matchReason = `Matches your ${alumniUser.industry} background`;
      }

      // Recency boost
      const hoursOld = (Date.now() - new Date(q.created_date).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 6) score += 25;
      else if (hoursOld < 24) score += 20;
      else if (hoursOld < 48) score += 10;

      // Unanswered boost
      if ((q.answer_count || 0) === 0) score += 25;

      return { ...q, matchScore: score, matchReason };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  const buildLeaderboard = (currentUser, currentKarma, allAnswers) => {
    // Filter answers from the last 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklyAnswers = allAnswers.filter(a => 
      new Date(a.created_date).getTime() > oneWeekAgo
    );

    // Group answers by user email and count
    const helpCountByUser = {};
    weeklyAnswers.forEach(answer => {
      const email = answer.answerer_email;
      if (!email) return;
      
      if (!helpCountByUser[email]) {
        helpCountByUser[email] = {
          email,
          name: answer.answerer_name || 'Unknown',
          count: 0,
          totalKarma: 0
        };
      }
      helpCountByUser[email].count += 1;
      helpCountByUser[email].totalKarma += 10 + (answer.upvote_count || 0) * 5 + (answer.is_best_answer ? 50 : 0);
    });

    // Convert to array and sort by count
    const sortedHelpers = Object.values(helpCountByUser)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Build leaderboard entries
    const leaderboardEntries = sortedHelpers.map((helper, index) => {
      const karmaLevel = helper.totalKarma >= 300 ? 'Platinum' : 
                         helper.totalKarma >= 150 ? 'Gold' : 
                         helper.totalKarma >= 50 ? 'Silver' : 'Bronze';
      return {
        id: helper.email,
        displayName: getDisplayName(helper.name),
        weeklyHelpCount: helper.count,
        karmaLevel,
        rank: index + 1,
        isCurrentUser: helper.email === currentUser.email
      };
    });

    // If current user isn't in top 10, add them
    const currentUserInList = leaderboardEntries.find(e => e.isCurrentUser);
    if (!currentUserInList) {
      const myKarmaLevel = currentKarma >= 300 ? 'Platinum' : 
                          currentKarma >= 150 ? 'Gold' : 
                          currentKarma >= 50 ? 'Silver' : 'Bronze';
      const myCount = helpCountByUser[currentUser.email]?.count || 0;
      
      // Find their actual rank
      const allHelpers = Object.values(helpCountByUser).sort((a, b) => b.count - a.count);
      const myRank = allHelpers.findIndex(h => h.email === currentUser.email) + 1 || allHelpers.length + 1;
      
      leaderboardEntries.push({
        id: currentUser.id,
        displayName: getDisplayName(currentUser.full_name),
        weeklyHelpCount: myCount,
        karmaLevel: myKarmaLevel,
        rank: myRank,
        isCurrentUser: true
      });
    }

    return leaderboardEntries.slice(0, 5);
  };

  const buildRecentActivity = (allAnswers) => {
    // Get recent unique answers for activity feed
    const recentAnswers = allAnswers.slice(0, 10);
    
    return recentAnswers.map(a => ({
      id: a.id,
      type: a.question_type === 'alumni_request' ? 'answered_alumni' : 'answered_student',
      alumniDisplayName: getDisplayName(a.answerer_name) || 'An alumni',
      detail: a.question_type === 'alumni_request' ? 'a fellow alumni' : 'a student',
      timestamp: new Date(a.created_date)
    }));
  };

  const getDisplayName = (fullName) => {
    if (!fullName) return 'Alumni';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]?.charAt(0)}.`;
  };

  const getKarmaLevel = (points) => {
    if (points >= 300) return 'platinum';
    if (points >= 150) return 'gold';
    if (points >= 50) return 'silver';
    return 'bronze';
  };

  const profilePercent = [
    user?.company, 
    user?.linkedin_url, 
    user?.title, 
    user?.profile_image,
    user?.industry
  ].filter(Boolean).length * 20;

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user.full_name?.split(/\s+/)[0] || 'Alumni';
  const karmaLevel = getKarmaLevel(karma);

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        
        {/* Hero Section */}
        <AlumniHeroSection
          user={user}
          karma={karma}
          karmaLevel={karmaLevel}
          studentsHelped={studentsHelped}
          alumniHelped={alumniHelped}
          myRequests={myRequests}
          onPostRequest={() => setShowPostRequestModal(true)}
        />

        {/* Live Activity Bar */}
        <AlumniLiveActivityBar
          events={recentActivity}
          weeklyStudentsHelped={studentsHelped}
          weeklyAlumniHelped={alumniHelped}
        />

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          
          {/* Your Active Requests (if any) */}
          {myRequests.length > 0 && (
            <AlumniYourRequestsCard requests={myRequests} />
          )}

          {/* Help Students */}
          <AlumniStudentQuestionsSection
            questions={studentQuestions}
            totalCount={studentQuestions.length}
            newToday={studentQuestions.filter(q => {
              const hoursOld = (Date.now() - new Date(q.created_date).getTime()) / (1000 * 60 * 60);
              return hoursOld < 24;
            }).length}
            alumni={user}
          />

          {/* Help Fellow Alumni */}
          {alumniRequests.length > 0 && (
            <AlumniRequestsSection
              requests={alumniRequests}
              total={alumniRequests.length}
              newToday={alumniRequests.filter(r => {
                const hoursOld = (Date.now() - new Date(r.created_date).getTime()) / (1000 * 60 * 60);
                return hoursOld < 24;
              }).length}
            />
          )}

          {/* Leaderboard */}
          <AlumniLeaderboardSection
            entries={leaderboard}
            currentUserId={user.id}
          />

          {/* Quick Actions */}
          <AlumniQuickActionsSection
            user={user}
            profilePercent={profilePercent}
            activeJobCount={myJobs.length}
            onPostRequest={() => setShowPostRequestModal(true)}
          />

          {/* Pioneer Badge */}
          {user.is_founding_member && (
            <section 
              className="rounded-3xl p-5 text-white flex items-center justify-between shadow-lg"
              style={{ background: 'linear-gradient(90deg, #0021A5 0%, #003DCE 50%, #0021A5 100%)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <p className="font-bold text-lg">You're a Founding Member</p>
                  <p className="text-sm text-white/80">One of the first alumni to join the network</p>
                </div>
              </div>
              <div className="bg-white/20 text-white font-semibold px-4 py-2 rounded-full border border-white/30">
                🏅 Pioneer
              </div>
            </section>
          )}

        </div>
        
        {/* Footer */}
        <footer className="text-gray-300 text-center py-8 mt-12" style={{ backgroundColor: '#0021A5' }}>
          <p className="text-sm">© 2026 College Fast Forward. All Rights Reserved.</p>
          <p className="text-xs mt-2 opacity-70">Terms of Service • Privacy Policy • Cookie Policy</p>
        </footer>
        
      </div>

      {/* Post Request Modal */}
      {showPostRequestModal && (
        <AlumniPostRequestModal
          onClose={() => setShowPostRequestModal(false)}
          onSuccess={() => {
            setShowPostRequestModal(false);
            loadDashboardData();
          }}
        />
      )}
    </>
  );
}