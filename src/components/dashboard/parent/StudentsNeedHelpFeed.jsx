import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobRequest } from '@/entities/JobRequest';
import { Heart, ArrowRight, Briefcase, Clock } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function StudentsNeedHelpFeed() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const activeRequests = await JobRequest.filter({ status: 'active' }, '-created_date', 6);
        setRequests(activeRequests || []);
      } catch (error) {
        console.error('Error loading help requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRequests();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students Need Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          Students Need Help
        </CardTitle>
        <Button variant="link" onClick={() => navigate('Connections')} className="text-sm text-blue-600 pr-0">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No active help requests right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    {request.role || request.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {request.target_industry}
                    {request.location_city && ` • ${request.location_city}, ${request.location_state}`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {request.job_type}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(request.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('Connections')}
                  className="flex-shrink-0"
                >
                  Help
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}