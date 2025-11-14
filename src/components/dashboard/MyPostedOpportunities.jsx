import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  DollarSign,
  Users,
  ExternalLink
} from 'lucide-react';
import { Opportunity } from '@/entities/Opportunity';
import { useToast } from '@/components/ui/use-toast';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const OpportunityTypeColors = {
  internship: 'bg-blue-100 text-blue-800',
  fulltime: 'bg-green-100 text-green-800',
  parttime: 'bg-purple-100 text-purple-800',
  contract: 'bg-orange-100 text-orange-800',
  shadowing: 'bg-pink-100 text-pink-800',
  project: 'bg-indigo-100 text-indigo-800'
};

const OpportunityCard = ({ opportunity, onDelete, onEdit }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Opportunity.delete(opportunity.id);
      toast({
        title: "Opportunity Deleted",
        description: "Your opportunity has been removed successfully."
      });
      trackEvent('parent_opportunity_deleted', { opportunityId: opportunity.id });
      onDelete();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to delete opportunity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatSalary = (min, max, period) => {
    if (!min && !max) return null;
    const formatAmount = (amount) => {
      if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
      return `$${amount}`;
    };
    
    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)}${period === 'hour' ? '/hr' : period === 'year' ? '/yr' : ''}`;
    }
    return `${formatAmount(min || max)}${period === 'hour' ? '/hr' : period === 'year' ? '/yr' : ''}`;
  };

  const isExpired = opportunity.expires_at && new Date(opportunity.expires_at) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow ${isExpired ? 'opacity-75 border-red-200' : 'border-slate-200'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 text-lg">{opportunity.title}</h3>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-2">
            <Badge className={OpportunityTypeColors[opportunity.opportunity_type] || 'bg-gray-100 text-gray-800'}>
              {opportunity.opportunity_type}
            </Badge>
            {opportunity.location_type === 'onsite' && opportunity.city && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{opportunity.city}{opportunity.state && `, ${opportunity.state}`}</span>
              </div>
            )}
            {opportunity.location_type === 'remote' && (
              <Badge variant="outline">Remote</Badge>
            )}
            {opportunity.location_type === 'hybrid' && (
              <Badge variant="outline">Hybrid</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('Opportunities')}
            className="text-slate-500 hover:text-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(opportunity)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{opportunity.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
        {opportunity.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          {opportunity.view_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{opportunity.view_count} views</span>
            </div>
          )}
          {opportunity.apply_click_count > 0 && (
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{opportunity.apply_click_count} applications</span>
            </div>
          )}
          {formatSalary(opportunity.compensation_min, opportunity.compensation_max, opportunity.compensation_period) && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>{formatSalary(opportunity.compensation_min, opportunity.compensation_max, opportunity.compensation_period)}</span>
            </div>
          )}
        </div>
        <div className="text-slate-400">
          Posted {new Date(opportunity.created_date).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default function MyPostedOpportunities({ opportunities = [], loading, onOpportunityUpdated }) {
  const handleEdit = (opportunity) => {
    // For now, navigate to the post opportunity page
    // In the future, we could implement an edit modal
    navigate('PostOpportunity', { edit: opportunity.id });
    trackEvent('parent_opportunity_edit_clicked', { opportunityId: opportunity.id });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            My Posted Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
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
            <Briefcase className="w-5 h-5" />
            My Posted Opportunities
          </CardTitle>
          <Button
            onClick={() => navigate('PostOpportunity')}
            size="sm"
            className="bg-[var(--uf-orange)] hover:bg-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Opportunities Posted Yet</h3>
            <p className="text-slate-600 mb-4">
              Share job openings, internships, or other opportunities with the Gator community.
            </p>
            <Button
              onClick={() => navigate('PostOpportunity')}
              className="bg-[var(--uf-orange)] hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Your First Opportunity
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onDelete={onOpportunityUpdated}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}