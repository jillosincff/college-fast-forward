
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { HelpOffer } from "@/entities/HelpOffer";
import { Opportunity } from "@/entities/Opportunity"; // New import
import { trackEvent } from '@/components/utils/analytics';

import ParentWelcomeHero from "./ParentWelcomeHero";
import ParentQuickActions from "./ParentQuickActions";
import ParentQuickStats from "./ParentQuickStats";
import StudentsNeedHelpFeed from "./StudentsNeedHelpFeed";
import ParentGettingStarted from "./ParentGettingStarted";
import MyConnectionsWidget from "./MyConnectionsWidget";
import MyMessagesWidget from "./MyMessagesWidget";
import MyPostedOpportunities from "./MyPostedOpportunities"; // New import

export default function ParentDashboard() {
  const { user, isLoading } = useAuth();
  const [helpOffers, setHelpOffers] = useState([]);
  const [postedOpportunities, setPostedOpportunities] = useState([]); // New state variable
  const [stats, setStats] = useState({
    requestsViewed: 0,
    reachoutsMade: 0,
    activeConnections: 0,
    impactScore: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadParentData();
      trackEvent('parent_dashboard_loaded', { parentId: user.id });
    }
  }, [user]);

  const loadParentData = async () => {
    setDataLoading(true);
    try {
      // Load help offers made by this parent - with error handling
      let offers = [];
      try {
        offers = await HelpOffer.filter(
          { offerer_user_id: user.id }, 
          '-created_date', 
          10
        );
      } catch (helpOfferError) {
        console.warn('Could not load help offers:', helpOfferError);
        offers = [];
      }
      
      setHelpOffers(offers || []);

      // Load posted opportunities // New logic
      let opportunities = [];
      try {
        opportunities = await Opportunity.filter(
          { created_by: user.email }, 
          '-created_date', 
          10
        );
      } catch (opportunityError) {
        console.warn('Could not load opportunities:', opportunityError);
        opportunities = [];
      }
      
      setPostedOpportunities(opportunities || []); // Set new state variable

      // Calculate stats based on actual data
      const requestsViewed = parseInt(localStorage.getItem('cff:parent:requestsViewed') || '0');
      const reachoutsMade = offers?.length || 0;
      const activeConnections = offers?.filter(offer => 
        offer.status === 'accepted' || offer.status === 'pending'
      ).length || 0;
      
      // Simple impact score calculation, updated to include opportunities
      const impactScore = (requestsViewed * 2) + (reachoutsMade * 10) + (activeConnections * 5) + (opportunities?.length * 15 || 0);

      setStats({
        requestsViewed,
        reachoutsMade,
        activeConnections,
        impactScore
      });

    } catch (error) {
      console.error("Error loading parent dashboard data:", error);
      // Set fallback data instead of failing
      setHelpOffers([]);
      setPostedOpportunities([]); // Reset new state on error
      setStats({
        requestsViewed: 0,
        reachoutsMade: 0,
        activeConnections: 0,
        impactScore: 0
      });
    } finally {
      setDataLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Hero */}
          <ParentWelcomeHero />

          {/* Quick Actions */}
          <ParentQuickActions />

          {/* Stats Overview */}
          <ParentQuickStats stats={stats} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Feed */}
            <div className="lg:col-span-2 space-y-8">
              {/* Students Who Need Help Feed */}
              <StudentsNeedHelpFeed />

              {/* My Posted Opportunities - New component */}
              <MyPostedOpportunities 
                opportunities={postedOpportunities}
                loading={dataLoading}
                onOpportunityUpdated={loadParentData} // Callback to refresh data
              />

              {/* Getting Started Checklist */}
              <ParentGettingStarted />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Your Recent Connections */}
              <MyConnectionsWidget 
                title="Offers You've Sent"
                helpOffers={helpOffers}
                loading={dataLoading}
              />

              {/* Recent Messages */}
              <MyMessagesWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
