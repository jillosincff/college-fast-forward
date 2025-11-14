import { Suspense, lazy, useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { HelpOffer } from '@/entities/HelpOffer';
import { Message } from '@/entities/Message';

// Lazy load dashboard components
const QuickStats = lazy(() => import('./QuickStats'));
const RecentActivity = lazy(() => import('./RecentActivity'));
const MyListings = lazy(() => import('./MyListings'));
const MyConnectionsWidget = lazy(() => import('./MyConnectionsWidget'));
const MyMessagesWidget = lazy(() => import('./MyMessagesWidget'));
const ImpactTestimonialsCarousel = lazy(() => import('./ImpactTestimonialsCarousel'));
const AlumniImpactCard = lazy(() => import('./AlumniImpactCard'));

// Loading wrapper component
const LoadingWrapper = ({ children, className = "" }) => (
  <Suspense fallback={
    <div className={`bg-slate-200 rounded-xl animate-pulse ${className}`} />
  }>
    {children}
  </Suspense>
);

// Lazy components with proper data loading
export function LazyQuickStats({ jobRequests, roommatePosts }) {
  return (
    <LoadingWrapper className="h-32">
      <QuickStats jobRequests={jobRequests} roommatePosts={roommatePosts} />
    </LoadingWrapper>
  );
}

export function LazyRecentActivity({ jobRequests, roommatePosts }) {
  return (
    <LoadingWrapper className="h-96">
      <RecentActivity jobRequests={jobRequests} roommatePosts={roommatePosts} />
    </LoadingWrapper>
  );
}

export function LazyMyListings({ onEdit, onDelete }) {
  return (
    <LoadingWrapper className="h-64">
      <MyListings onEdit={onEdit} onDelete={onDelete} />
    </LoadingWrapper>
  );
}

export function LazyMyConnectionsWidget() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      // Only load help offers for this specific user, not all users
      const offers = await HelpOffer.filter({ offerer_user_id: user.id }, '-created_date', 5);
      setConnections(offers || []);
    } catch (error) {
      console.error("Error loading connections:", error);
      setConnections([]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
  }

  return (
    <LoadingWrapper className="h-64">
      <MyConnectionsWidget connections={connections} />
    </LoadingWrapper>
  );
}

export function LazyMyMessagesWidget() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  const loadMessages = async () => {
    try {
      // Only load messages for this specific user, not all users
      const userMessages = await Message.filter({
        $or: [
          { sender_email: user.email },
          { recipient_email: user.email }
        ]
      }, '-created_date', 5);
      setMessages(userMessages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
  }

  return (
    <LoadingWrapper className="h-64">
      <MyMessagesWidget messages={messages} />
    </LoadingWrapper>
  );
}

export function LazyImpactTestimonialsCarousel() {
  return (
    <LoadingWrapper className="h-48">
      <ImpactTestimonialsCarousel />
    </LoadingWrapper>
  );
}

export function LazyAlumniImpactCard() {
  return (
    <LoadingWrapper className="h-32">
      <AlumniImpactCard />
    </LoadingWrapper>
  );
}