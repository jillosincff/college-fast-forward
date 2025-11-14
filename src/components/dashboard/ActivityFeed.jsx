import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { Opportunity } from '@/entities/Opportunity';
import { OpportunityApplication } from '@/entities/OpportunityApplication';
import { Reminder } from '@/entities/Reminder';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, Search, MessageSquare, Briefcase, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import { formatDistanceToNow, parseISO, addDays } from 'date-fns';
import { navigate } from '@/components/utils/navigation';

const getInitials = (name) => {
  if (!name) return 'UF';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const statusColors = {
  applied: 'bg-slate-100 text-slate-700',
  in_review: 'bg-indigo-100 text-indigo-700',
  replied: 'bg-sky-100 text-sky-700',
  interview: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-rose-100 text-rose-700',
};

const StatusPill = ({ status }) => {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.applied}`}>
      {statusText}
    </span>
  );
};

const FollowUpButton = ({ applicationId, threadId, size = 'sm' }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowUp = async () => {
    setIsLoading(true);
    try {
      const remindAt = addDays(new Date(), 7).toISOString();
      
      await Reminder.create({
        application_id: applicationId || null,
        remind_at: remindAt,
        type: 'application_followup',
        ...(threadId && { question_thread_id: threadId })
      });

      toast({ title: "Reminder set!", description: "We'll remind you to follow up in 7 days." });
      trackEvent('activity_followup_set', { applicationId, threadId, remindAt });
    } catch (error) {
      console.error('Failed to set follow-up:', error);
      toast({ title: 'Failed to set reminder', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size={size} onClick={handleFollowUp} disabled={isLoading} className="flex items-center gap-1">
      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
      Follow-up 7d
    </Button>
  );
};

const ApplicationCard = ({ application, opportunity, mutate }) => {
  const handleViewOpportunity = () => {
    trackEvent('activity_open_opportunity', { id: opportunity.id });
    navigate('Opportunities', { opp: opportunity.id });
  };
  const handleReopenLink = () => {
    trackEvent('activity_reopen_link', { oppId: opportunity.id });
    window.open(opportunity.apply_url, '_blank', 'noopener,noreferrer');
    mutate?.();
  };
  const handleEmailAgain = () => {
    trackEvent('activity_email_again', { oppId: opportunity.id });
    const subject = `Application: ${opportunity.title}`;
    window.location.href = `mailto:${opportunity.apply_email}?subject=${encodeURIComponent(subject)}`;
    mutate?.();
  };
  const handleViewApplication = () => {
    trackEvent('activity_open_thread', { threadId: `app-${application.id}` });
    navigate('Messages', { opp: opportunity.id });
  };

  const avatarSrc = opportunity.company?.logo_url || opportunity.poster_avatar_url;
  const avatarFallback = opportunity.company?.name ? opportunity.company.name.substring(0, 2).toUpperCase() : getInitials(opportunity.poster_name);
  const locationLabel = opportunity.location_type === 'remote' ? 'Remote' : `${opportunity.city || ''}, ${opportunity.state || ''}`.trim().replace(/^,|,$/g, '');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 rounded-lg ring-1 ring-slate-100">
            <AvatarImage src={avatarSrc} alt={opportunity.company?.name || opportunity.poster_name} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <button onClick={handleViewOpportunity} className="font-semibold text-slate-900 line-clamp-1 hover:underline text-left">{opportunity.title}</button>
              <StatusPill status={application.status} />
            </div>
            <p className="text-xs text-slate-600 line-clamp-1 mb-3">{opportunity.company?.name || opportunity.poster_name} • {locationLabel}</p>
            <div className="text-xs text-slate-500 mb-3">Applied {formatDistanceToNow(parseISO(application.created_date), { addSuffix: true })}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleViewOpportunity}>View Opportunity</Button>
              {opportunity.apply_method === 'message' && <Button variant="outline" size="sm" onClick={handleViewApplication}>View Application</Button>}
              {opportunity.apply_method === 'external' && <Button variant="outline" size="sm" onClick={handleReopenLink}>Reopen Link</Button>}
              {opportunity.apply_method === 'email' && <Button variant="outline" size="sm" onClick={handleEmailAgain}>Email Again</Button>}
              <FollowUpButton applicationId={application.id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuestionCard = ({ thread, mutate }) => {
  const { toast } = useToast();
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const handleMarkRead = async () => {
    setIsMarkingRead(true);
    try {
      await Promise.all(thread.messages.filter(msg => !msg.is_read).map(msg => Message.update(msg.id, { is_read: true })));
      toast({ title: 'Marked as read' });
      trackEvent('activity_mark_read', { threadId: thread.id });
      mutate?.();
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast({ title: 'Failed to mark as read', variant: 'destructive' });
    } finally {
      setIsMarkingRead(false);
    }
  };
  const handleOpenThread = () => {
    trackEvent('activity_open_thread', { threadId: thread.id });
    navigate('Messages', { thread: thread.id });
  };
  const handleViewOpportunity = () => {
    trackEvent('activity_open_opportunity', { id: thread.oppId });
    navigate('Opportunities', { opp: thread.oppId });
  };

  const posterRole = thread.posterRole === 'alumni' ? 'UF Alumni' : 'UF Parent';
  const isOpportunityOpen = thread.oppStatus === 'open';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={thread.posterAvatarUrl} alt={thread.posterName} />
            <AvatarFallback>{getInitials(thread.posterName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <button onClick={handleViewOpportunity} className="font-semibold text-slate-900 line-clamp-1 hover:underline text-left">{thread.oppTitle}</button>
              {thread.unreadCount > 0 && <Badge className="bg-sky-100 text-sky-700 border border-sky-200 shrink-0">{thread.unreadCount} new</Badge>}
            </div>
            <p className="text-xs text-slate-600 line-clamp-1 mb-1">{thread.posterName} • {posterRole}{!isOpportunityOpen && <span> • <span className="text-rose-600 font-medium">Closed</span></span>}</p>
            <p className="text-sm text-slate-700 line-clamp-2 mb-3">{thread.lastMessageSnippet}</p>
            <div className="text-xs text-slate-500 mb-3">{formatDistanceToNow(parseISO(thread.lastMessageAt), { addSuffix: true })}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenThread}><MessageSquare className="w-3 h-3 mr-1" />Open Thread</Button>
              {thread.unreadCount > 0 && <Button variant="outline" size="sm" onClick={handleMarkRead} disabled={isMarkingRead}>{isMarkingRead ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <span className="w-3 h-3 bg-sky-500 rounded-full mr-1"></span>}Mark Read</Button>}
              <FollowUpButton threadId={thread.id} />
              <Button variant="link" size="sm" onClick={handleViewOpportunity} className="text-blue-600 hover:text-blue-800 underline px-1">View Opportunity</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ tab }) => {
  const messages = {
    all: "No activity yet. Browse Opportunities to apply or ask questions.",
    applications: "You haven't applied to any opportunities yet. Start exploring to find your next opportunity!",
    questions: "You haven't asked any questions yet. Don't hesitate to reach out to opportunity posters for insights."
  };
  const icons = { all: MessageSquare, applications: Briefcase, questions: MessageSquare };
  const Icon = icons[tab];

  return (
    <div className="p-8 text-center bg-slate-100 border-dashed rounded-lg">
        <Icon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{tab === 'applications' ? 'No applications yet' : tab === 'questions' ? 'No questions yet' : 'No activity yet'}</h3>
        <p className="text-sm text-slate-500 mb-4">{messages[tab]}</p>
        <Button onClick={() => navigate('Opportunities')}>Browse Opportunities</Button>
    </div>
  );
};

export default function ActivityFeed() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState({});
  const [threads, setThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [onlyOpenOpps, setOnlyOpenOpps] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => { if (user) loadActivityData(); }, [user]);
  useEffect(() => { trackEvent('activity_view', { tab: activeTab, q: searchQuery, status: statusFilter, onlyOpenOpps, sort: sortBy }); }, [activeTab, searchQuery, statusFilter, onlyOpenOpps, sortBy]);

  const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

  const loadActivityData = async () => {
    setIsLoading(true);
    try {
      const apps = await OpportunityApplication.filter({ applicant_id: user.id }, '-created_date');
      setApplications(apps);
      let loadedOpps = {};

      if (apps.length > 0) {
        const appOppIds = [...new Set(apps.map(a => a.opportunity_id))].filter(isValidObjectId);
        if (appOppIds.length > 0) {
          const opps = await Opportunity.filter({ id: { $in: appOppIds } });
          loadedOpps = { ...loadedOpps, ...opps.reduce((acc, opp) => ({ ...acc, [opp.id]: opp }), {}) };
        }
      }

      const userMessages = await Message.filter({ $or: [{ sender_email: user.email }, { recipient_email: user.email }] }, '-created_date', 200);
      const threadMap = {};
      for (const message of userMessages) {
        if (isValidObjectId(message.post_id)) {
          if (!threadMap[message.post_id]) threadMap[message.post_id] = { messages: [] };
          threadMap[message.post_id].messages.push(message);
        }
      }

      const threadOppIds = Object.keys(threadMap).filter(id => !loadedOpps[id]);
      if (threadOppIds.length > 0) {
        const oppsForThreads = await Opportunity.filter({ id: { $in: threadOppIds } });
        loadedOpps = { ...loadedOpps, ...oppsForThreads.reduce((acc, opp) => ({ ...acc, [opp.id]: opp }), {}) };
      }
      setOpportunities(loadedOpps);

      const enrichedThreads = Object.entries(threadMap).map(([oppId, threadData]) => {
        const opportunity = loadedOpps[oppId];
        if (!opportunity) return null;
        const sortedMessages = threadData.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        const lastMessage = sortedMessages[0];
        const unreadCount = sortedMessages.filter(msg => msg.recipient_email === user.email && !msg.is_read).length;
        return { id: oppId, oppId, messages: sortedMessages, oppTitle: opportunity.title, oppStatus: opportunity.status || 'open', posterName: opportunity.poster_name || 'Gator Helper', posterRole: opportunity.posted_by_role || 'alumni', posterAvatarUrl: opportunity.poster_avatar_url, lastMessageSnippet: lastMessage.body.substring(0, 100), lastMessageAt: lastMessage.created_date, unreadCount };
      }).filter(Boolean);
      setThreads(enrichedThreads);
    } catch (error) {
      console.error("Failed to load activity data:", error);
      setApplications([]); setOpportunities({}); setThreads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const activityItems = useMemo(() => {
    let items = [];
    if (activeTab === 'all' || activeTab === 'applications') items.push(...applications.map(app => ({ kind: 'application', date: new Date(app.created_date), application: app, opportunity: opportunities[app.opportunity_id] })).filter(item => item.opportunity));
    if (activeTab === 'all' || activeTab === 'questions') items.push(...threads.map(thread => ({ kind: 'question', date: new Date(thread.lastMessageAt), thread })));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item => {
        if (item.kind === 'application') return item.opportunity.title.toLowerCase().includes(q) || (item.opportunity.company?.name || item.opportunity.poster_name || '').toLowerCase().includes(q);
        return item.thread.oppTitle.toLowerCase().includes(q) || item.thread.lastMessageSnippet.toLowerCase().includes(q);
      });
    }
    if (activeTab === 'applications' && statusFilter !== 'all') items = items.filter(item => item.kind === 'application' && item.application.status === statusFilter);
    if (activeTab === 'questions' && onlyOpenOpps) items = items.filter(item => item.kind === 'question' && item.thread.oppStatus === 'open');
    return items.sort((a, b) => sortBy === 'title' ? (a.kind === 'application' ? a.opportunity.title : a.thread.oppTitle).localeCompare(b.kind === 'application' ? b.opportunity.title : b.thread.oppTitle) : b.date.getTime() - a.date.getTime());
  }, [applications, opportunities, threads, activeTab, searchQuery, statusFilter, onlyOpenOpps, sortBy]);

  const handleClearFilters = () => { setSearchQuery(''); setStatusFilter('all'); setOnlyOpenOpps(false); setSortBy('recent'); };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Activity</CardTitle>
        <CardDescription>Your applications and conversations in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 p-4 rounded-lg border mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search activity..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            {activeTab === 'applications' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            )}
            {activeTab === 'questions' && (
              <div className="flex items-center space-x-2">
                <Checkbox id="onlyOpenOpps" checked={onlyOpenOpps} onCheckedChange={setOnlyOpenOpps} />
                <Label htmlFor="onlyOpenOpps" className="text-sm text-slate-600 whitespace-nowrap">Open opportunities only</Label>
              </div>
            )}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-auto flex-grow sm:flex-grow-0 sm:w-32"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || (activeTab === 'applications' && statusFilter !== 'all') || (activeTab === 'questions' && onlyOpenOpps)) && <Button variant="ghost" onClick={handleClearFilters}>Clear Filters</Button>}
          </div>
        </div>
        {isLoading ? (
          <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" /></div>
        ) : activityItems.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="space-y-4">
            {activityItems.map((item) => {
              if (item.kind === 'application') return <ApplicationCard key={`app-${item.application.id}`} application={item.application} opportunity={item.opportunity} mutate={loadActivityData} />;
              return <QuestionCard key={`question-${item.thread.id}`} thread={item.thread} mutate={loadActivityData} />;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}