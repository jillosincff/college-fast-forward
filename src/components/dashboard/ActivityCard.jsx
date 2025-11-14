import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, TrendingUp, MessageSquare, Filter, Plus } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const activityData = [
  { id: 1, type: 'job_request', title: 'Software Engineer Internship', category: 'Technology', timestamp: '2 hours ago', icon: Briefcase, color: 'text-blue-600' },
  { id: 2, type: 'opportunity', title: 'Product Manager at Disney', category: 'Media', timestamp: '4 hours ago', icon: TrendingUp, color: 'text-green-600' },
  { id: 3, type: 'message', title: 'New message from Sarah M.', category: 'Messages', timestamp: '6 hours ago', icon: MessageSquare, color: 'text-purple-600' },
  { id: 4, type: 'job_request', title: 'Marketing Analyst Position', category: 'Marketing', timestamp: '1 day ago', icon: Briefcase, color: 'text-blue-600' },
  { id: 5, type: 'opportunity', title: 'UX Designer at Meta', category: 'Technology', timestamp: '2 days ago', icon: TrendingUp, color: 'text-green-600' },
  { id: 6, type: 'opportunity', title: 'Consulting Intern at Deloitte', category: 'Consulting', timestamp: '2 days ago', icon: TrendingUp, color: 'text-green-600' },
  { id: 7, type: 'job_request', title: 'Civil Engineer EIT Role', category: 'Engineering', timestamp: '3 days ago', icon: Briefcase, color: 'text-blue-600' },
];

const filterOptions = [
  { id: 'all', label: 'All' }, { id: 'jobs', label: 'Jobs' },
  { id: 'internships', label: 'Internships' }, { id: 'shadowing', label: 'Shadowing' }
];

export default function ActivityCard() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('PostRequest')} className="gap-1">
            <Plus className="w-4 h-4" />
            Post a Request
          </Button>
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex space-x-1">
            {filterOptions.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-[420px] overflow-y-auto pr-2">
          {activityData.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="p-2 bg-slate-100 rounded-full mt-0.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.title}
                    </p>
                    <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium capitalize">
                    {item.category}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}