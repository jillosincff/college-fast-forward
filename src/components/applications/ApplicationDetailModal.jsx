import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Calendar, Paperclip, ExternalLink, Eye, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const getStatusColor = (status) => {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-800';
    case 'in_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'replied':
      return 'bg-green-100 text-green-800';
    case 'interview':
      return 'bg-purple-100 text-purple-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ApplicationDetailModal({ isOpen, onClose, application }) {
  if (!application || !application.opportunity) return null;

  const { opportunity, note, resume_url, status, created_date, updated_date, method } = application;
  
  // Determine if application has been reviewed (status changed from 'applied')
  const hasBeenReviewed = status !== 'applied';
  const reviewDate = hasBeenReviewed && updated_date ? new Date(updated_date) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{opportunity.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{opportunity.org_name}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={`${getStatusColor(status)} flex-shrink-0`}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
              {hasBeenReviewed && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Eye className="w-3 h-3" />
                  <span>Reviewed</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Application Timeline */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Applied</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(created_date), { addSuffix: true })}
              </p>
            </div>
          </div>

          {hasBeenReviewed && reviewDate && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Reviewed & Status Updated</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(reviewDate, { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Application Details */}
        <div className="space-y-6">
          {/* Your Note */}
          {note && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Application Note</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {note}
              </div>
            </div>
          )}

          {/* Resume */}
          {resume_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Resume</h3>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(resume_url, '_blank')}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                View Resume
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          )}

          {/* Opportunity Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">About This Opportunity</h3>
            <div className="space-y-3">
              {opportunity.location && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{opportunity.location}</span>
                </div>
              )}
              
              {opportunity.salary_display && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400">💰</span>
                  <span className="text-gray-700">{opportunity.salary_display}</span>
                </div>
              )}

              {opportunity.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {opportunity.contact_url && (
            <div>
              <Button
                variant="default"
                className="w-full"
                onClick={() => window.open(opportunity.contact_url, '_blank')}
              >
                View Original Posting
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <Separator className="my-4" />
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}