import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, ExternalLink } from 'lucide-react';
import { updateIntroStatus } from '@/functions/updateIntroStatus';
import { useToast } from '@/components/ui/use-toast';

export default function StudentIntroCard({ intro, onUpdate }) {
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestIntro = async () => {
    setIsRequesting(true);
    try {
      await updateIntroStatus({
        introId: intro.id,
        status: 'REQUESTED'
      });
      
      toast({
        title: "✅ Intro requested!",
        description: "We'll notify the helper to confirm and share contact details.",
      });
      
      onUpdate?.();
    } catch (error) {
      console.error('Error requesting intro:', error);
      toast({
        title: "Error requesting intro",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotNow = () => {
    // Just hide the card or mark as seen
    onUpdate?.();
  };

  const getStatusBadge = () => {
    switch (intro.status) {
      case 'OFFERED':
        return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
      case 'REQUESTED':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'SHARED':
        return <Badge className="bg-green-100 text-green-800">Contact Shared</Badge>;
      case 'DECLINED':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      case 'WITHDRAWN':
        return <Badge className="bg-gray-100 text-gray-800">Withdrawn</Badge>;
      default:
        return null;
    }
  };

  const renderContactDetails = () => {
    if (intro.status !== 'SHARED') return null;

    return (
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-green-800 mb-2">Contact Details:</h4>
        <div className="space-y-1 text-sm">
          {intro.candidate_email && (
            <div>
              <strong>Email:</strong> 
              <a href={`mailto:${intro.candidate_email}`} className="ml-2 text-blue-600 hover:underline">
                {intro.candidate_email}
              </a>
            </div>
          )}
          {intro.candidate_linkedin && (
            <div>
              <strong>LinkedIn:</strong>
              <a href={intro.candidate_linkedin} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1">
                View Profile <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {intro.candidate_notes && (
            <div className="mt-2 pt-2 border-t border-green-200">
              <strong>Note:</strong>
              <p className="mt-1 text-green-700">{intro.candidate_notes}</p>
            </div>
          )}
        </div>
        <div className="mt-3 p-2 bg-white border border-green-300 rounded text-xs text-green-700">
          💡 Be sure to send a polite, concise note when reaching out.
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-blue-200 bg-blue-50/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Intro offer from {intro.helper?.full_name || 'Helper'}
            </h3>
            {getStatusBadge()}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-slate-700">
            {intro.helper?.full_name || 'They'} can introduce you to{' '}
            <strong>{intro.candidate_name}</strong>
            {intro.candidate_role && intro.candidate_company && (
              <span>, {intro.candidate_role} at {intro.candidate_company}</span>
            )}
            {intro.candidate_role && !intro.candidate_company && (
              <span>, {intro.candidate_role}</span>
            )}
            {!intro.candidate_role && intro.candidate_company && (
              <span> at {intro.candidate_company}</span>
            )}
            .
          </p>
          
          {intro.candidate_notes && intro.status === 'OFFERED' && (
            <p className="text-sm text-slate-600 mt-2 italic">"{intro.candidate_notes}"</p>
          )}
        </div>

        {renderContactDetails()}

        {intro.status === 'OFFERED' && (
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={handleRequestIntro}
              disabled={isRequesting}
              className="bg-[#FA4616] hover:bg-[#E24B14] text-white"
            >
              {isRequesting ? 'Requesting...' : 'Request Intro'}
            </Button>
            <Button variant="outline" onClick={handleNotNow}>
              Not now
            </Button>
          </div>
        )}

        {intro.status === 'REQUESTED' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⏳ Waiting for {intro.helper?.full_name || 'the helper'} to confirm and share contact details.
            </p>
          </div>
        )}

        {intro.status === 'DECLINED' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              The intro isn't available right now. No worries — they may offer another contact anytime.
            </p>
          </div>
        )}

        {intro.status === 'WITHDRAWN' && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-800">
              This intro has been withdrawn.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}