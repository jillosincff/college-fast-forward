import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  FileText, 
  Users, 
  Briefcase, 
  Award, 
  Network, 
  GraduationCap,
  Lightbulb,
  CheckCircle,
  Info 
} from 'lucide-react';

export default function OutcomeTrackingModal({ isOpen, onClose, onSubmit, referral }) {
  const [outcomeType, setOutcomeType] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const outcomeOptions = [
    {
      id: 'career_advice',
      label: 'Career Advice',
      description: 'Student received valuable career guidance',
      icon: MessageCircle,
      color: 'text-blue-600'
    },
    {
      id: 'resume_review',
      label: 'Resume Review',
      description: 'Resume was reviewed and feedback provided',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      id: 'informational_interview',
      label: 'Informational Interview',
      description: 'Student had a career conversation with a professional',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: 'job_interview',
      label: 'Job Interview Scheduled',
      description: 'Student got an actual job interview',
      icon: Briefcase,
      color: 'text-orange-600'
    },
    {
      id: 'job_offer',
      label: 'Job Offer Received',
      description: 'Student received a job offer',
      icon: Award,
      color: 'text-yellow-600'
    },
    {
      id: 'networking',
      label: 'Valuable Connection',
      description: 'Student made an important professional connection',
      icon: Network,
      color: 'text-indigo-600'
    },
    {
      id: 'mentorship',
      label: 'Mentorship Established',
      description: 'Ongoing mentoring relationship was established',
      icon: GraduationCap,
      color: 'text-teal-600'
    },
    {
      id: 'industry_insights',
      label: 'Industry Insights',
      description: 'Student gained valuable industry knowledge',
      icon: Lightbulb,
      color: 'text-pink-600'
    }
  ];

  const handleSubmit = async () => {
    if (!outcomeType) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        linkId: referral.id,
        eventType: 'outcome_achieved',
        outcomeType,
        details
      });
      onClose();
    } catch (error) {
      console.error('Failed to update outcome:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Track Successful Outcome</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              What kind of help did the student receive through your referral?
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Type of Success</Label>
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {outcomeOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setOutcomeType(option.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    outcomeType === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <option.icon className={`w-5 h-5 mt-0.5 ${option.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{option.label}</p>
                    <p className="text-sm text-slate-600">{option.description}</p>
                  </div>
                  {outcomeType === option.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              placeholder="Any additional context about this success..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!outcomeType || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Recording...' : 'Record Success'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}