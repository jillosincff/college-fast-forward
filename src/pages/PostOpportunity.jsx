
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Opportunity } from '@/entities/Opportunity';
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Briefcase } from 'lucide-react';
import RoleAwareOpportunityForm from '@/components/opportunities/RoleAwareOpportunityForm';

export default function PostOpportunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData, e) => {
    if (e) {
      e.preventDefault(); // Prevent default form submission if an event object is provided
    }
    
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to post opportunities.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure all required fields are set with proper defaults
      const opportunityData = {
        ...formData,
        status: 'active',
        visibility: 'public',
        created_by_role: user.persona || 'student',
        org_name: formData.org_name || 'Organization',
        city: formData.city || '',
        state: formData.state || '',
        contact_name: formData.contact_name || user.full_name || '',
        contact_email: formData.contact_email || user.email || '',
      };

      const result = await Opportunity.create(opportunityData);
      
      toast({
        title: "✅ Opportunity posted!", // Updated title as per outline
        description: "This listing will be live for 30 days. Your opportunity has been posted and is now live.",
      });

      trackEvent('opportunity_posted', {
        type: formData.opportunity_type,
        user_role: user.persona,
        has_wage: !!formData.hourly_wage,
      });

      // Save the new opportunity to sessionStorage for immediate visibility on dashboard
      const newOpportunityPayload = {
        ...result,
        timestamp: Date.now()
      };

      sessionStorage.setItem('cff_new_opportunity_activity', JSON.stringify(newOpportunityPayload));

      setShowSuccess(true);
      
      // Navigate back to the appropriate dashboard based on user persona
      setTimeout(() => {
        let dashboardPage = 'Dashboard';
        if (user.persona === 'parent') dashboardPage = 'ParentDashboard';
        else if (user.persona === 'alumni') dashboardPage = 'AlumniDashboard';
        else if (user.persona === 'admin') dashboardPage = 'AdminDashboard';
        
        navigate(dashboardPage);
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Failed to post opportunity",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Posted Successfully!</h2>
            <p className="text-slate-600 mb-2">
              Your opportunity is now live and visible to students.
            </p>
            <p className="text-sm text-slate-500 font-medium mb-4">
              This listing will be live for 30 days.
            </p>
            <p className="text-sm text-slate-500">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Post an Opportunity
          </h1>
          <p className="text-slate-600">
            Share internships, jobs, and student gigs with the Gator community.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleAwareOpportunityForm 
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              userRole={user?.persona}
            />
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Great Opportunities</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about requirements and expectations</li>
            <li>• Include clear application instructions</li>
            <li>• Mention if it's paid and what the compensation is</li>
            <li>• Add your contact information for quick responses</li>
            <li>• <strong>Listings are live for 30 days</strong> — you can renew anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
