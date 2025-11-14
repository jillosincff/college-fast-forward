import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MessageSquare, 
  RefreshCw,
  Star,
  Mail,
  HelpCircle,
  Building2,
  FileText,
  Paperclip
} from 'lucide-react';
import { JobRequest } from '@/entities/JobRequest';
import { Message } from '@/entities/Message';
import { Opportunity } from '@/entities/Opportunity';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { formatDistanceToNow } from 'date-fns';
import { navigate } from '@/components/utils/navigation';
import ApplicationDetailModal from '@/components/applications/ApplicationDetailModal';

export default function MyActivityWidget() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [myRequests, setMyRequests] = useState([]);
  const [myMessages, setMyMessages] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    const handleShowActivityTab = (event) => {
      if (event.detail?.tab) {
        setActiveTab(event.detail.tab);
      }
    };

    document.addEventListener('cff:show-activity-tab', handleShowActivityTab);
    return () => document.removeEventListener('cff:show-activity-tab', handleShowActivityTab);
  }, []);

  const loadActivityData = async () => {
    if (!user?.email || !user?.id) return;
    
    setIsRefreshing(true);
    try {
      const requests = await JobRequest.filter({ created_by: user.email }, '-created_date', 10);
      setMyRequests(requests || []);

      const messages = await Message.filter({ recipient_email: user.email }, '-created_date', 10);
      setMyMessages(messages || []);

      try {
        const saved = JSON.parse(localStorage.getItem('gator_saved_opportunities') || '[]');
        if (saved.length > 0) {
          const savedOpps = await Opportunity.filter({}, '-created_date', 100);
          const filteredSaved = savedOpps.filter(opp => saved.includes(opp.id)).slice(0, 10);
          setSavedOpportunities(filteredSaved);
        } else {
          setSavedOpportunities([]);
        }
      } catch (error) {
        console.error('Failed to load saved opportunities:', error);
        setSavedOpportunities([]);
      }

      // Load applications - DON'T fetch opportunity details, use snapshot data
      try {
        const [byId, byEmail] = await Promise.all([
          OpportunityApplication.filter({ applicant_id: user.id }, '-created_date', 20).catch(() => []),
          OpportunityApplication.filter({ created_by: user.email }, '-created_date', 20).catch(() => [])
        ]);
        
        const allApps = [...byId];
        const existingIds = new Set(byId.map(app => app.id));
        
        byEmail.forEach(app => {
          if (!existingIds.has(app.id)) {
            allApps.push(app);
          }
        });

        // Use snapshot data - no need to fetch opportunities
        setMyApplications(allApps.slice(0, 10));
      } catch (error) {
        console.error('Failed to load applications:', error);
        setMyApplications([]);
      }

    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, [user]);

  const handleRefresh = () => {
    loadActivityData();
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const unreadMessages = myMessages.filter(m => !m.is_read).length;
  const totalActivity = myRequests.length + savedOpportunities.length + myMessages.length + myApplications.length;

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            My Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              My Activity
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6 h-auto">
              <TabsTrigger value="all" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-blue-50">
                <span className="text-lg font-bold text-gray-900">{totalActivity}</span>
                <span className="text-xs text-gray-600">All</span>
              </TabsTrigger>
              
              <TabsTrigger value="requests" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-purple-50 relative">
                <span className="text-lg font-bold text-gray-900">{myRequests.length}</span>
                <span className="text-xs text-gray-600">Requests</span>
              </TabsTrigger>
              
              <TabsTrigger value="applications" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-green-50">
                <span className="text-lg font-bold text-gray-900">{myApplications.length}</span>
                <span className="text-xs text-gray-600">Applied</span>
              </TabsTrigger>
              
              <TabsTrigger value="saved" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-amber-50">
                <span className="text-lg font-bold text-gray-900">{savedOpportunities.length}</span>
                <span className="text-xs text-gray-600">Saved</span>
              </TabsTrigger>
              
              <TabsTrigger value="messages" className="flex flex-col items-center py-3 gap-1 data-[state=active]:bg-blue-50 relative">
                <span className="text-lg font-bold text-gray-900">{myMessages.length}</span>
                <span className="text-xs text-gray-600">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {[...myRequests.slice(0, 2), ...myApplications.slice(0, 2), ...savedOpportunities.slice(0, 2), ...myMessages.slice(0, 2)]
                .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                .slice(0, 6)
                .map((item, index) => {
                  const isRequest = item.role || item.target_industry;
                  const isMessage = item.sender_email;
                  const isApplication = item.applicant_id;
                  const isOpportunity = item.org_name && !isApplication;

                  if (isApplication) {
                    // Use snapshot data from the application record
                    const oppTitle = item.opportunity_title || '(Opportunity no longer available)';
                    const oppCompany = item.opportunity_company || 'Unknown Company';
                    const isDeleted = !item.opportunity_title; // If no snapshot data, it's deleted
                    
                    return (
                      <div 
                        key={`app-${index}`} 
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                          isDeleted 
                            ? 'bg-gray-50 border-gray-300 cursor-default' 
                            : 'bg-white border-gray-200 cursor-pointer hover:border-green-400 hover:shadow-md'
                        }`}
                        onClick={() => !isDeleted && handleViewApplication(item)}
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium text-sm truncate ${isDeleted ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                              {oppTitle}
                            </p>
                            {item.resume_url && (
                              <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {oppCompany} • {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
                          </p>
                        </div>
                        {!isDeleted && (
                          <Badge className={`${getApplicationStatusColor(item.status)} text-xs`}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    );
                  }

                  if (isRequest) {
                    return (
                      <div 
                        key={`request-${index}`} 
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
                        onClick={() => navigate('Connections')}
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.role || item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (isMessage) {
                    return (
                      <div 
                        key={`message-${index}`} 
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                          item.is_read 
                            ? 'bg-white border-gray-200 hover:border-gray-400' 
                            : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                        }`}
                        onClick={() => setActiveTab('messages')}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.is_read ? 'bg-gray-100' : 'bg-blue-100'
                        }`}>
                          <Mail className={`w-5 h-5 ${item.is_read ? 'text-gray-600' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 truncate">{item.subject}</p>
                            {!item.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            From: {item.sender_email.split('@')[0]}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (isOpportunity) {
                    return (
                      <div 
                        key={`opp-${index}`} 
                        className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
                        onClick={() => navigate('Opportunities')}
                      >
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Star className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {item.org_name}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

              {totalActivity === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No activity yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start exploring opportunities!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-3">
              {myRequests.length > 0 ? (
                myRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
                    onClick={() => navigate('Connections')}
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{request.role || request.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {request.target_industry} • {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No requests posted yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('Connections')}
                    className="mt-2 text-purple-600"
                  >
                    Post Your First Request →
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-3">
              {myApplications.length > 0 ? (
                myApplications.map((app) => {
                  const oppTitle = app.opportunity_title || '(Opportunity no longer available)';
                  const oppCompany = app.opportunity_company || 'Unknown Company';
                  const isDeleted = !app.opportunity_title;
                  
                  return (
                    <div 
                      key={app.id} 
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                        isDeleted 
                          ? 'bg-gray-50 border-gray-300 cursor-default' 
                          : 'bg-white border-gray-200 cursor-pointer hover:border-green-400 hover:shadow-md'
                      }`}
                      onClick={() => !isDeleted && handleViewApplication(app)}
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm truncate ${isDeleted ? 'text-gray-500 italic' : 'text-gray-900'}`}>
                            {oppTitle}
                          </p>
                          {app.resume_url && (
                            <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {oppCompany} • {formatDistanceToNow(new Date(app.created_date), { addSuffix: true })}
                        </p>
                      </div>
                      {!isDeleted && (
                        <Badge className={`${getApplicationStatusColor(app.status)} text-xs flex-shrink-0`}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No applications yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('Opportunities')}
                    className="mt-2 text-green-600"
                  >
                    Browse Opportunities →
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-3">
              {savedOpportunities.length > 0 ? (
                savedOpportunities.map((opp) => (
                  <div 
                    key={opp.id} 
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
                    onClick={() => navigate('Opportunities')}
                  >
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{opp.title}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {opp.org_name} {opp.salary_display && `• ${opp.salary_display}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No saved opportunities yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('Opportunities')}
                    className="mt-2 text-amber-600"
                  >
                    Browse Opportunities →
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-3">
              {myMessages.length > 0 ? (
                myMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      message.is_read 
                        ? 'bg-white border-gray-200 hover:border-gray-400' 
                        : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.is_read ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      <Mail className={`w-5 h-5 ${message.is_read ? 'text-gray-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">{message.subject}</p>
                        {!message.is_read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">From: {message.sender_email}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{message.body}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                  <p className="text-gray-400 text-xs mt-1">Messages from your connections will appear here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedApplication && (
        <ApplicationDetailModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
        />
      )}
    </>
  );
}