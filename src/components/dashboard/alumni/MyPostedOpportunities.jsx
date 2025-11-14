
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Opportunity } from '@/entities/Opportunity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Building2, MoreVertical, Edit, Trash2, Plus, Eye, MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { navigate } from '@/components/utils/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function MyPostedOpportunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMyOpportunities = async () => {
      if (!user?.email) return;
      setIsLoading(true);
      try {
        const myOpps = await Opportunity.filter({ created_by: user.email }, '-created_date', 10);
        setOpportunities(myOpps || []);
      } catch (error) {
        console.error('Failed to load opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyOpportunities();
  }, [user]);

  const handleDelete = async (oppId) => {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return;
    }

    try {
      await Opportunity.delete(oppId);
      setOpportunities(prev => prev.filter(opp => opp.id !== oppId));
      toast({
        title: "Opportunity Deleted",
        description: "Your opportunity has been successfully removed.",
      });
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
      toast({
        title: "Failed to delete opportunity",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getOpportunityTypeLabel = (type) => {
    switch (type) {
      case 'student_gig':
        return 'Student Gig';
      case 'internship':
        return 'Internship';
      case 'job':
      case 'full_time':
        return 'Full-time Job';
      case 'part_time':
        return 'Part-time Job';
      default:
        return 'Opportunity';
    }
  };

  // Don't show the widget if user has no posted opportunities
  if (!isLoading && opportunities.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            My Posted Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            My Posted Opportunities
          </CardTitle>
          <Button 
            onClick={() => navigate('PostOpportunity')}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Post New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{opp.title}</h3>
                    <Badge className={getStatusColor(opp.status)}>
                      {opp.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getOpportunityTypeLabel(opp.opportunity_type)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {opp.org_name}
                      </span>
                      {opp.city && opp.state && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {opp.city}, {opp.state}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(opp.created_date), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{opp.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>👁️ {opp.applications_count || 0} applications</span>
                    {opp.hourly_wage && <span>💰 ${opp.hourly_wage}/hr</span>}
                    {opp.salary_display && <span>💰 {opp.salary_display}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('Opportunities')}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Public
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('PostOpportunity', { editId: opp.id, returnTo: user?.persona === 'alumni' ? 'AlumniDashboard' : user?.persona === 'parent' ? 'ParentDashboard' : 'Dashboard' })}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(opp.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
