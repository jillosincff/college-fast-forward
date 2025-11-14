import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, CheckCircle, Clock, Info } from 'lucide-react';

export default function InterviewTrackingModal({ isOpen, onClose, onSubmit, referral, userRole }) {
  const [trackingMethod, setTrackingMethod] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trackingOptions = [
    {
      id: 'confirmed',
      label: 'Interview Confirmed',
      description: 'Student has confirmed they scheduled an interview',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 'scheduled',
      label: 'Interview Scheduled',
      description: 'I believe an interview was scheduled (pending student confirmation)',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'pending',
      label: 'Follow-up Pending',
      description: 'Waiting to hear back about interview status',
      icon: Clock,
      color: 'text-yellow-600'
    }
  ];

  const handleSubmit = async () => {
    if (!trackingMethod) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        linkId: referral.id,
        eventType: 'interview',
        trackingMethod,
        details,
        reportedBy: userRole
      });
      onClose();
    } catch (error) {
      console.error('Failed to update interview status:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Track Interview Progress</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Help us track the success of your referral by updating the interview status.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Interview Status</Label>
            <RadioGroup value={trackingMethod} onValueChange={setTrackingMethod}>
              {trackingOptions.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    trackingMethod === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                  <div className="flex items-start gap-2 flex-1">
                    <option.icon className={`w-4 h-4 mt-0.5 ${option.color}`} />
                    <div>
                      <span className="font-medium text-slate-900">{option.label}</span>
                      <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details (Optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g., Interview scheduled for next Tuesday, or student mentioned they got a call..."
              className="h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!trackingMethod || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}