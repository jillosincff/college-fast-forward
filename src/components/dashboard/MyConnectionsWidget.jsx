import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Handshake, ArrowRight, UserCheck, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation'; // Fixed import
import { HelpOffer } from '@/entities/HelpOffer';
import { User } from '@/entities/User';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'U';

const ConnectionPreview = ({ offer, otherUser, isStudentView }) => {
  const offerPreview = offer.message.length > 80
    ? offer.message.substring(0, 80) + '...'
    : offer.message;

  const isUnread = isStudentView && !offer.is_read;

  // Get appropriate icon for the request type
  const getRequestIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('software') || lowerTitle.includes('engineer') || lowerTitle.includes('developer')) {
      return '💻';
    } else if (lowerTitle.includes('marketing') || lowerTitle.includes('social')) {
      return '📱';
    } else if (lowerTitle.includes('finance') || lowerTitle.includes('analyst')) {
      return '💼';
    } else if (lowerTitle.includes('design') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) {
      return '🎨';
    } else if (lowerTitle.includes('roommate') || lowerTitle.includes('housing')) {
      return '🏠';
    }
    return '💼'; // Default briefcase
  };

  return (
    <div
      onClick={() => navigate('Connections', { id: offer.request_id })}
      className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={otherUser?.profile_image_url} alt={`${otherUser?.full_name || 'User'}'s avatar`} />
        <AvatarFallback className="bg-slate-200 text-slate-600 font-semibold text-xs">
          {getInitials(otherUser?.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm text-slate-900 truncate ${isUnread ? 'font-bold' : ''}`}>
          {isStudentView ? `Offer from ${otherUser?.full_name || 'a Gator'}` : `You offered to help ${otherUser?.full_name || 'a student'}`}
        </p>
        <p className={`text-xs text-slate-500 italic line-clamp-2 my-1 ${isUnread ? 'font-semibold text-slate-700' : ''}`}>
          "{offerPreview}"
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs truncate flex items-center gap-1">
            <span className="text-base">{getRequestIcon(offer.request_title)}</span>
            For: {offer.request_title}
          </Badge>
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(offer.created_date))} ago
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`text-xs capitalize ${offer.status === 'pending' ? 'text-amber-600 border-amber-300' : 'text-green-600 border-green-300'}`}>
          {offer.status}
        </Badge>
        {isUnread && (
          <div className="w-2 h-2 bg-[var(--uf-orange)] rounded-full" aria-label="Unread" />
        )}
      </div>
    </div>
  );
};

export default function MyConnectionsWidget() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const isStudent = user?.persona === 'student';
  const title = isStudent ? "Offers Received" : "Offers to Help";
  const emptyStateText = isStudent
    ? "Help offers from alumni and parents will appear here."
    : "Your offers to help students will appear here.";

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    setIsLoading(true);
    try {
      let fetchedItems = [];
      if (isStudent) {
        fetchedItems = await HelpOffer.filter({ recipient_email: user.email }, '-created_date', 3);
      } else {
        fetchedItems = await HelpOffer.filter({ offerer_user_id: user.id }, '-created_date', 3);
      }
      setItems(fetchedItems || []);

      if (fetchedItems?.length > 0) {
        const allUsers = await User.list();
        const usersById = allUsers.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
        const usersByEmail = allUsers.reduce((acc, u) => { acc[u.email] = u; return acc; }, {});
        setUsersMap({ ...usersById, ...usersByEmail });
      }
    } catch (error) {
      console.log('Could not load connections data');
      setItems([]);
    }
    setIsLoading(false);
  };

  const handleViewAll = () => {
    if (isStudent) {
      navigate('Connections');
    } else {
      navigate('Connections', { view: 'sent-offers' });
    }
  };

  const unreadCount = isStudent ? items.filter(offer => !offer.is_read).length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-green-600" />
              <span>{title}</span>
              {unreadCount > 0 && isStudent && (
                <Badge className="bg-[var(--uf-orange)] text-white text-xs h-5 px-2">{unreadCount}</Badge>
              )}
              {!isStudent && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Track the help you've offered to Gators here</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleViewAll} className="text-[var(--uf-blue)] hover:text-[var(--uf-blue-light)] p-0 h-auto">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array(2).fill(0).map((_, i) => (<div key={i} className="h-16 bg-slate-200 rounded animate-pulse" />))}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-600">{emptyStateText}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((offer) => {
                const otherUser = isStudent
                  ? usersMap[offer.offerer_user_id]
                  : usersMap[offer.recipient_email];
                return (
                  <ConnectionPreview
                    key={offer.id}
                    offer={offer}
                    otherUser={otherUser}
                    isStudentView={isStudent}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}