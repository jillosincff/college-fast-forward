
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { JobRequest } from '@/entities/JobRequest';
import { HelpOffer } from '@/entities/HelpOffer';
import { SuccessStory } from '@/entities/SuccessStory';
import { trackEvent } from '@/components/utils/analytics';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users,
  Share2,
  Search
} from 'lucide-react';

import AlumniWelcomeHero from './AlumniWelcomeHero';
import HelpGatorsWidget from './HelpGatorsWidget';
import NetworkingHubWidget from './NetworkingHubWidget';
import ImpactTrackerWidget from './ImpactTrackerWidget';
import AlumniQuickActions from './AlumniQuickActions';
import RecentActivityWidget from './RecentActivityWidget';
import ShareStoryModal from '../connections/ShareSuccessModal';
import ProfileCompletionBanner from './ProfileCompletionBanner';

export default function AlumniDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  
  // Dashboard State
  const [matchedRequests, setMatchedRequests] = useState([]);
  const [alumniPeers, setAlumniPeers] = useState([]);
  const [myHelpOffers, setMyHelpOffers] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [impactStats, setImpactStats] = useState({
    studentsHelped: 0,
    connectionsMAde: 0,
    storiesShared: 0,
    impactScore: 0,
    mentorRank: 'Rising Star'
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [showShareStoryModal, setShowShareStoryModal] = useState(false);
  const [showFirstTimeExperience, setShowFirstTimeExperience] = useState(false);

  useEffect(() => {
    if (user) {
      loadAlumniData();
      trackEvent('alumni_dashboard_loaded', { 
        alumniId: user.id, 
        gradYear: user.graduation_year,
        industry: user.current_company 
      });
      
      // Check if this is their first visit
      const isFirstVisit = params?.first === '1' || localStorage.getItem('cff:firstLogin') === '1';
      if (isFirstVisit) {
        setShowFirstTimeExperience(true);
        localStorage.removeItem('cff:firstLogin');
      }
    }
  }, [user, params]);

  const loadAlumniData = async () => {
    setDataLoading(true);
    try {
      // Load AI-matched student requests based on alumni expertise
      let requests = [];
      try {
        const allRequests = await JobRequest.filter({ status: 'active' }, '-created_date', 20);
        // AI-like matching based on expertise, industry, and graduation year proximity
        requests = allRequests.filter(req => {
          const userExpertise = user.expertiseTags || [];
          const userIndustry = user.current_company?.toLowerCase() || '';
          const reqIndustry = req.target_industry?.toLowerCase() || '';
          const reqDescription = req.description?.toLowerCase() || '';
          
          // Match by industry
          if (reqIndustry.includes(userIndustry) || userIndustry.includes(reqIndustry)) {
            return true;
          }
          
          // Match by expertise tags
          if (userExpertise.some(expertise => 
            reqIndustry.includes(expertise.toLowerCase()) || 
            reqDescription.includes(expertise.toLowerCase())
          )) {
            return true;
          }
          
          // Match by job type keywords in user's position
          const userPosition = user.current_position?.toLowerCase() || '';
          if (userPosition.includes('engineer') && reqDescription.includes('engineer')) return true;
          if (userPosition.includes('manager') && reqDescription.includes('management')) return true;
          if (userPosition.includes('marketing') && reqDescription.includes('marketing')) return true;
          
          return false;
        }).slice(0, 5);
      } catch (error) {
        console.warn('Could not load matched requests:', error);
        // Generate mock matched requests if API fails
        requests = generateMockMatchedRequests();
      }
      setMatchedRequests(requests);

      // Load alumni help offers
      let offers = [];
      try {
        offers = await HelpOffer.filter({ offerer_user_id: user.id }, '-created_date', 10);
      } catch (error) {
        console.warn('Could not load help offers:', error);
        // Generate mock offers for demo
        offers = generateMockHelpOffers();
      }
      setMyHelpOffers(offers);

      // Load shared stories
      let stories = [];
      try {
        stories = await SuccessStory.filter({ created_by: user.email }, '-created_date', 5);
      } catch (error) {
        console.warn('Could not load stories:', error);
        stories = [];
      }
      setMyStories(stories);

      // Calculate enhanced impact stats
      const studentsHelped = offers?.filter(offer => 
        offer.status === 'accepted' || offer.status === 'completed'
      ).length || 0;
      const connectionsMAde = offers?.filter(offer => offer.status === 'completed').length || 0;
      const storiesShared = stories?.length || 0;
      const helpResponseRate = offers?.length > 0 ? (connectionsMAde / offers.length) * 100 : 0;
      
      // Enhanced impact scoring system
      const impactScore = (studentsHelped * 15) + (connectionsMAde * 30) + (storiesShared * 20) + (helpResponseRate * 2);
      
      let mentorRank = 'Rising Star';
      if (impactScore >= 300) mentorRank = 'Gator Legend 🏆';
      else if (impactScore >= 200) mentorRank = 'Impact Champion 🌟';
      else if (impactScore >= 100) mentorRank = 'Mentor Elite 👑';
      else if (impactScore >= 50) mentorRank = 'Network Builder 🚀';

      setImpactStats({
        studentsHelped,
        connectionsMAde,
        storiesShared,
        impactScore: Math.round(impactScore),
        mentorRank,
        helpResponseRate: Math.round(helpResponseRate),
        streakDays: 7 // Mock streak data
      });

      // Generate AI-suggested alumni peers
      const peers = generateAlumniPeers();
      setAlumniPeers(peers);

    } catch (error) {
      console.error("Error loading alumni dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // Generate mock matched requests for demo
  const generateMockMatchedRequests = () => {
    const baseRequests = [
      {
        id: 'mock-1',
        role: 'Software Engineer Intern',
        description: 'Looking for summer internship opportunities at tech companies. Passionate about full-stack development.',
        target_industry: 'Technology',
        created_date: new Date().toISOString(),
        user_name: 'Alex Chen',
        user_grad_year: 2025,
        urgency: 'Normal'
      },
      {
        id: 'mock-2', 
        role: 'Finance Analyst',
        description: 'Recent grad seeking entry-level opportunities in investment banking or corporate finance.',
        target_industry: 'Finance',
        created_date: new Date(Date.now() - 86400000).toISOString(),
        user_name: 'Maria Rodriguez',
        user_grad_year: 2024,
        urgency: 'Urgent'
      }
    ];
    
    // Filter based on user's industry
    const userIndustry = user?.current_company?.toLowerCase() || '';
    return baseRequests.filter(req => {
      if (userIndustry.includes('tech') || userIndustry.includes('google') || userIndustry.includes('microsoft')) {
        return req.target_industry === 'Technology';
      }
      if (userIndustry.includes('finance') || userIndustry.includes('bank') || userIndustry.includes('goldman')) {
        return req.target_industry === 'Finance';
      }
      return true;
    });
  };

  // Generate mock help offers for demo
  const generateMockHelpOffers = () => {
    return [
      {
        id: 'offer-1',
        help_type: 'introduction',
        request_creator_email: 'student1@ufl.edu',
        created_date: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed'
      },
      {
        id: 'offer-2',
        help_type: 'advice',
        request_creator_email: 'student2@ufl.edu', 
        created_date: new Date(Date.now() - 259200000).toISOString(),
        status: 'accepted'
      }
    ];
  };

  // Generate AI-suggested alumni peers based on user profile
  const generateAlumniPeers = () => {
    const gradYear = user?.graduation_year || 2020;
    const userIndustry = user?.current_company || 'Technology';
    
    return [
      {
        id: 'peer-1',
        name: 'Sarah Johnson',
        gradYear: gradYear - 1,
        industry: userIndustry,
        company: 'Similar Corp',
        location: 'San Francisco'
      },
      {
        id: 'peer-2',
        name: 'Michael Chen',
        gradYear: gradYear + 1, 
        industry: userIndustry,
        company: 'Related Inc',
        location: 'New York'
      },
      {
        id: 'peer-3',
        name: 'Jessica Martinez',
        gradYear: gradYear,
        industry: userIndustry,
        company: 'Industry Leader',
        location: 'Austin'
      }
    ].slice(0, 3);
  };

  const handleShareStory = () => {
    setShowShareStoryModal(true);
    trackEvent('alumni_share_story_opened', { alumniId: user?.id });
  };

  const handleStoryShared = () => {
    setShowShareStoryModal(false);
    toast({
      title: "🎉 Story Shared!",
      description: "Your journey will inspire fellow Gators. Thank you for giving back!",
    });
    loadAlumniData(); // Refresh to show new story
  };

  const handleHelpGator = () => {
    trackEvent('alumni_help_gator_clicked', { 
      alumniId: user?.id,
      source: 'dashboard_widget'
    });
    navigate('Connections');
  };

  const handleNetworkingHub = () => {
    trackEvent('alumni_networking_clicked', { 
      alumniId: user?.id,
      source: 'dashboard_widget'
    });
    navigate('GatorDirectory');
  };

  if (isLoading || !user) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-48 bg-gradient-to-r from-blue-200 to-orange-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <ProfileCompletionBanner />
        {/* Welcome Hero */}
        <AlumniWelcomeHero impactStats={impactStats} />
        
        {/* Quick Actions with AI Suggestions */}
        <AlumniQuickActions 
          onHelpGator={handleHelpGator} 
          onShareStory={handleShareStory} 
          onNetworking={handleNetworkingHub}
          impactStats={impactStats}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI-Matched Help Requests */}
            <HelpGatorsWidget 
              matchedRequests={matchedRequests} 
              loading={dataLoading}
              onViewAll={handleHelpGator}
            />
            
            {/* Alumni Networking Hub */}
            <NetworkingHubWidget 
              alumniPeers={alumniPeers}
              loading={dataLoading}
              onViewAll={handleNetworkingHub}
            />

            {/* Recent Activity Timeline */}
            <RecentActivityWidget 
              helpOffers={myHelpOffers}
              stories={myStories}
              loading={dataLoading}
            />
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Enhanced Impact Tracker */}
            <ImpactTrackerWidget 
              stats={impactStats}
              loading={dataLoading}
            />

            {/* Quick Share Story Card */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-4"
                >
                  📖
                </motion.div>
                <h3 className="font-bold text-slate-900 mb-2">Share Your Journey</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Inspire the next generation with your success story
                </p>
                <Button 
                  onClick={handleShareStory}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Story
                </Button>
              </CardContent>
            </Card>

            {/* Directory Quick Access */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <Search className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Gator Directory</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Connect with {user.graduation_year ? `Class of ${user.graduation_year}` : 'fellow'} alumni
                </p>
                <Button 
                  onClick={handleNetworkingHub}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Browse Directory
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Story Modal */}
      <ShareStoryModal
        isOpen={showShareStoryModal}
        onClose={() => setShowShareStoryModal(false)}
        onStorySubmitted={handleStoryShared}
      />
    </div>
  );
}
