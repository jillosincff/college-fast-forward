import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, TrendingUp, Users, Mail, ArrowRight, Loader2, Briefcase, Edit, Trash2, Eye } from 'lucide-react';
import { Message } from '@/entities/Message';
import { HelpOffer } from '@/entities/HelpOffer';
import { Opportunity } from '@/entities/Opportunity';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { navigate } from '@/components/utils/navigation';
import { formatDistanceToNow } from 'date-fns';
import { errorReporter } from '@/components/utils/errorReporter';
import { useToast } from '@/components/ui/use-toast';
import ManageOpportunityModal from '@/components/opportunities/ManageOpportunityModal';

export default function ParentActivityWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [helpOffers, setHelpOffers] = useState([]);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [opportunityApplications, setOpportunityApplications] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadActivityData();
    }
  }, [user?.email]);

  // Listen for custom event to show specific tab
  useEffect(() => {
    const handleShowTab = (e) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    
    document.addEventListener('cff:show-activity-tab', handleShowTab);
    return () => document.removeEventListener('cff:show-activity-tab', handleShowTab);
  }, []);

  const loadActivityData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    
    try {
      // Load all activity data in parallel with individual error handling
      const [messagesResult, helpOffersResult, opportunitiesResult] = await Promise.allSettled([
        loadMessages(),
        loadHelpOffers(),
        loadOpportunities()
      ]);

      // Process messages
      if (messagesResult.status === 'fulfilled') {
        setMessages(messagesResult.value || []);
      } else {
        console.log('Messages temporarily unavailable (non-critical)');
        setMessages([]);
      }

      // Process help offers
      if (helpOffersResult.status === 'fulfilled') {
        setHelpOffers(helpOffersResult.value || []);
      } else {
        console.log('Help offers temporarily unavailable');
        setHelpOffers([]);
      }

      // Process opportunities
      if (opportunitiesResult.status === 'fulfilled') {
        const opps = opportunitiesResult.value || [];
        setMyOpportunities(opps);
        
        // Load applications for each opportunity
        if (opps.length > 0) {
          const applicationsMap = {};
          for (const opp of opps) {
            try {
              const apps = await OpportunityApplication.filter({ opportunity_id: opp.id });
              applicationsMap[opp.id] = apps || [];
            } catch (error) {
              console.log(`Could not load applications for opportunity ${opp.id}`);
              applicationsMap[opp.id] = [];
            }
          }
          setOpportunityApplications(applicationsMap);
        }
      } else {
        console.log('Opportunities temporarily unavailable');
        setMyOpportunities([]);
      }

    } catch (error) {
      console.log('Activity data temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const data = await Message.filter(
        { recipient_email: user.email },
        '-created_date',
        5,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      return data || [];
    } catch (error) {
      if (!errorReporter.shouldSuppress(error, { source: 'ParentActivityWidget.loadMessages' })) {
        console.error('Error loading messages:', error.message);
      }
      return [];
    }
  };

  const loadHelpOffers = async () => {
    try {
      const data = await HelpOffer.filter(
        { offerer_email: user.email },
        '-created_date',
        5
      );
      return data || [];
    } catch (error) {
      console.log('Help offers temporarily unavailable');
      return [];
    }
  };

  const loadOpportunities = async () => {
    try {
      const data = await Opportunity.filter(
        { created_by: user.email },
        '-created_date',
        10
      );
      return data || [];
    } catch (error) {
      console.log('Opportunities temporarily unavailable');
      return [];
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    try {
      await Opportunity.delete(opportunityId);
      toast({
        title: 'Success',
        description: 'Job posting deleted successfully'
      });
      setShowManageModal(false);
      setSelectedOpportunity(null);
      await loadActivityData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete job posting'
      });
    }
  };

  const handleUpdateOpportunity = async (opportunityId, updates) => {
    try {
      await Opportunity.update(opportunityId, updates);
      toast({
        title: 'Success',
        description: 'Job posting updated successfully'
      });
      await loadActivityData();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update job posting'
      });
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const renderMessages = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0021A5]/10 to-[#FA4616]/10 blur-xl rounded-full"></div>
            <Mail className="w-16 h-16 text-gradient-to-br from-[#0021A5] to-[#FA4616] mx-auto relative" />
          </div>
          <p className="text-lg font-semibold text-slate-800 mb-1">Your Gator network conversations will appear here</p>
          <p className="text-sm text-slate-600">
            Start connecting with students to see your messages 🐊
          </p>
          <Button
            variant="outline"
            className="mt-4 border-[#0021A5] text-[#0021A5] hover:bg-[#0021A5] hover:text-white"
            onClick={() => navigate('Connections')}
          >
            Start Helping Students
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
              !msg.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
            }`}
            onClick={() => navigate('Messages')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{msg.subject}</p>
                  {!msg.is_read && (
                    <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">From: {msg.sender_email}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
            </p>
          </div>
        ))}
        <Button
          variant="ghost"
          className="w-full mt-2"
          onClick={() => navigate('Messages')}
        >
          View All Messages <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  const renderHelpOffers = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      );
    }

    if (helpOffers.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0021A5]/10 to-[#FA4616]/10 blur-xl rounded-full"></div>
            <Users className="w-16 h-16 text-gradient-to-br from-[#0021A5] to-[#FA4616] mx-auto relative" />
          </div>
          <p className="text-lg font-semibold text-slate-800 mb-1">Your Gator impact starts here 🐊</p>
          <p className="text-sm text-slate-600">
            Browse student requests and offer your expertise
          </p>
          <Button
            variant="outline"
            className="mt-4 border-[#0021A5] text-[#0021A5] hover:bg-[#0021A5] hover:text-white"
            onClick={() => navigate('Connections')}
          >
            Browse Requests
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {helpOffers.map((offer) => (
          <div
            key={offer.id}
            className="p-4 rounded-lg border bg-white border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <Badge className="bg-green-100 text-green-800 text-xs mb-2">
                  {offer.help_type}
                </Badge>
                <p className="text-sm text-gray-700 line-clamp-2">{offer.message}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(offer.created_date), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderJobPosts = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      );
    }

    if (myOpportunities.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FA4616]/10 to-[#F2A900]/10 blur-xl rounded-full"></div>
            <Briefcase className="w-16 h-16 text-gradient-to-br from-[#FA4616] to-[#F2A900] mx-auto relative" />
          </div>
          <p className="text-lg font-semibold text-slate-800 mb-1">Share opportunities with Gators 🐊</p>
          <p className="text-sm text-slate-600">
            Post job leads and boost your student's visibility
          </p>
          <Button
            className="mt-4 bg-gradient-to-r from-[#FA4616] to-[#D32737] hover:from-[#D32737] hover:to-[#FA4616] text-white font-bold shadow-lg"
            onClick={() => navigate('PostOpportunity')}
          >
            Post a Job
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {myOpportunities.map((opp) => {
          const applicationsCount = opportunityApplications[opp.id]?.length || 0;
          const isPaused = opp.status === 'paused';
          
          return (
            <div
              key={opp.id}
              className={`p-4 rounded-lg border ${
                isPaused ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
              } hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{opp.title}</h4>
                    {isPaused && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Paused</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{opp.org_name}</p>
                  {opp.city && opp.state && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {opp.city}, {opp.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Eye className="w-3 h-3" />
                  <span>{applicationsCount} {applicationsCount === 1 ? 'application' : 'applications'}</span>
                </div>
                <span className="text-xs text-gray-400">
                  Posted {formatDistanceToNow(new Date(opp.created_date), { addSuffix: true })}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedOpportunity(opp);
                    setShowManageModal(true);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Manage
                </Button>
                {applicationsCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('MyApplications', { opportunityId: opp.id })}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Applications
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        <Button
          variant="ghost"
          className="w-full mt-2"
          onClick={() => navigate('PostOpportunity')}
        >
          Post Another Job <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            My Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="messages" className="relative">
                Messages
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="help">Help Offers</TabsTrigger>
              <TabsTrigger value="jobs">My Job Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="mt-4">
              {renderMessages()}
            </TabsContent>

            <TabsContent value="help" className="mt-4">
              {renderHelpOffers()}
            </TabsContent>

            <TabsContent value="jobs" className="mt-4">
              {renderJobPosts()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedOpportunity && (
        <ManageOpportunityModal
          isOpen={showManageModal}
          onClose={() => {
            setShowManageModal(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
          applicationsCount={opportunityApplications[selectedOpportunity.id]?.length || 0}
          onDelete={handleDeleteOpportunity}
          onUpdate={handleUpdateOpportunity}
        />
      )}
    </>
  );
}