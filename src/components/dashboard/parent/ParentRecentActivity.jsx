import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, Briefcase, MessageSquare, ArrowRight } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';

const mockActivities = [
  {
    id: 1,
    type: 'introduction',
    icon: Handshake,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    text: (<span><strong>Sarah M.</strong> accepted your introduction to a Marketing Manager at Nike.</span>),
    time: '2 hours ago',
    user: { full_name: 'Sarah M.', profile_image_url: null }
  },
  {
    id: 2,
    type: 'opportunity',
    icon: Briefcase,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    text: (<span>You posted a new opportunity: <strong>Summer Marketing Intern</strong>.</span>),
    time: '1 day ago',
    user: null // Self-action
  },
  {
    id: 3,
    type: 'message',
    icon: MessageSquare,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    text: (<span><strong>David L.</strong> sent you a message about your internship post.</span>),
    time: '3 days ago',
    user: { full_name: 'David L.', profile_image_url: null }
  },
  {
    id: 4,
    type: 'introduction',
    icon: Handshake,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    text: (<span><strong>Emily R.</strong> followed up on your connection at Google.</span>),
    time: '5 days ago',
    user: { full_name: 'Emily R.', profile_image_url: null }
  }
];

export default function ParentRecentActivity() {
  return (
    <Card className="shadow-lg border-0 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <Button variant="link" className="text-sm text-blue-600 pr-0">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className={`flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-slate-100 ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
            >
              <div className="flex-shrink-0 mt-1">
                {activity.user ? (
                  <UserAvatar user={activity.user} className="w-10 h-10" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                    <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-800 leading-snug">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}