import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, MessageSquare, Clock, AlertTriangle, CheckCircle, Edit, RefreshCw, ArrowRight, Loader2, ChevronUp, Eye, Award, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { formatDistanceToNow, differenceInDays, addDays } from 'date-fns';

const HELP_TYPE_LABELS = {
  'career_advice': 'Career advice',
  'internship_leads': 'Internship leads',
  'resume_review': 'Resume review',
  'interview_prep': 'Interview prep',
  'industry_insights': 'Industry insights',
  'networking_intros': 'Networking intros',
  'informational_interview': 'Informational interviews'
};

export default function StudentHelpRequestCard({ 
  helpRequest, 
  matchCount = 0, 
  responseCount = 0,
  onRefresh,
  parentMatches = []
}) {
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [renewOption, setRenewOption] = useState('keep');
  const [selectedHelper, setSelectedHelper] = useState('');
  const [thankYouNote, setThankYouNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't show confusing "No Active Question" - students already asked during onboarding
  // If they have no question AND no matches were passed, return null
  if (!helpRequest) {
    return null;
  }

  const now = new Date();
  const expiresAt = helpRequest.expires_at ? new Date(helpRequest.expires_at) : addDays(new Date(helpRequest.created_date), 30);
  const daysUntilExpiry = differenceInDays(expiresAt, now);
  const isExpired = helpRequest.status === 'expired' || daysUntilExpiry < 0;
  const isExpiringSoon = daysUntilExpiry <= 5 && daysUntilExpiry >= 0;
  const createdDate = new Date(helpRequest.created_date);
  const daysSincePosted = differenceInDays(now, createdDate);

  const handleRenew = async () => {
    setIsSubmitting(true);
    try {
      const newExpiresAt = addDays(new Date(), 30).toISOString();
      await base44.entities.HelpRequest.update(helpRequest.id, {
        status: 'active',
        expires_at: newExpiresAt,
        renewed_count: (helpRequest.renewed_count || 0) + 1
      });
      setShowRenewModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to renew request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      await base44.entities.HelpRequest.update(helpRequest.id, {
        status: 'resolved',
        resolved_helper_id: selectedHelper || null,
        resolved_thank_you: thankYouNote || null
      });
      setShowResolveModal(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to resolve request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      console.log('🗑️ Attempting to delete question:', helpRequest.id);
      
      // Try JobRequest first (newer entity), then HelpRequest
      let deleted = false;
      
      try {
        await base44.entities.JobRequest.delete(helpRequest.id);
        console.log('✅ JobRequest deleted successfully');
        deleted = true;
      } catch (jobErr) {
        console.log('JobRequest delete failed, trying HelpRequest:', jobErr.message);
      }
      
      if (!deleted) {
        try {
          await base44.entities.HelpRequest.delete(helpRequest.id);
          console.log('✅ HelpRequest deleted successfully');
          deleted = true;
        } catch (helpErr) {
          console.log('HelpRequest delete failed:', helpErr.message);
          // Check if it's a 404 - means already deleted
          if (helpErr.message?.includes('not found') || helpErr.status === 404) {
            deleted = true;
          }
        }
      }
      
      if (deleted) {
        setShowDeleteModal(false);
        // Pass true to signal deletion so Dashboard clears state immediately
        if (onRefresh) onRefresh(true);
      } else {
        alert('Failed to delete question. Please try again or contact support.');
      }
    } catch (error) {
      console.error('❌ Failed to delete request:', error);
      alert('Failed to delete question. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const helpTypesText = (helpRequest.help_types || [])
    .map(t => HELP_TYPE_LABELS[t] || t)
    .join(', ');

  return (
    <>
      <Card className={`border-2 shadow-lg ${
        isExpired 
          ? 'border-red-200 bg-red-50' 
          : isExpiringSoon 
            ? 'border-amber-200 bg-amber-50' 
            : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
      }`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isExpired ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <FileText className={`w-6 h-6 ${isExpired ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">📝 Your Question</h3>
              <p className="text-slate-700 text-base leading-relaxed">"{helpRequest.description}"</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-white">
              Looking for: {helpTypesText}
            </Badge>
            <Badge variant="outline" className="bg-white">
              Industry: {helpRequest.industry}
            </Badge>
          </div>

          <div className="border-t border-slate-200 pt-4 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-2xl font-bold">{helpRequest.answer_count || 0}</span>
                </div>
                <p className="text-xs text-slate-500">Answers</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-2xl font-bold">{helpRequest.total_upvotes || 0}</span>
                </div>
                <p className="text-xs text-slate-500">Upvotes</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-2xl font-bold">{helpRequest.view_count || 0}</span>
                </div>
                <p className="text-xs text-slate-500">Views</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {daysSincePosted === 0 ? 'Today' : `${daysSincePosted}d ago`}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {isExpired 
                    ? 'Expired' 
                    : `Expires in ${daysUntilExpiry}d`
                  }
                </p>
              </div>
            </div>
            
            {/* Best Answer Badge */}
            {helpRequest.has_best_answer && (
              <div className="mt-3 flex items-center justify-center gap-2 text-green-700 bg-green-100 rounded-lg py-2">
                <Award className="w-4 h-4" />
                <span className="text-sm font-semibold">Best answer selected!</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={() => navigate('QuestionDetail', { id: helpRequest.id })}
              className="flex-1 bg-[#FA4616] hover:bg-orange-600"
            >
              View All Answers
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('StudentOnboarding')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Question
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowResolveModal(true)}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Resolved
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Expiration warnings */}
          {isExpired && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-red-700 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Your question expired {Math.abs(daysUntilExpiry)} days ago</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('StudentOnboarding')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Ask New Question
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRenewModal(true)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  Renew Previous Question
                </Button>
              </div>
            </div>
          )}

          {isExpiringSoon && !isExpired && (
            <div className="bg-amber-100 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 text-amber-700 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Your question expires in {daysUntilExpiry} days</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setShowRenewModal(true)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Renew for 30 More Days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('StudentOnboarding')}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Question
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renew Modal */}
      <Dialog open={showRenewModal} onOpenChange={setShowRenewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renew Your Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Your current question:</p>
              <p className="font-medium">"{helpRequest.description}"</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="renewOption"
                  value="keep"
                  checked={renewOption === 'keep'}
                  onChange={(e) => setRenewOption(e.target.value)}
                />
                <span>Keep as-is (renew for 30 days)</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="renewOption"
                  value="edit"
                  checked={renewOption === 'edit'}
                  onChange={(e) => setRenewOption(e.target.value)}
                />
                <span>Edit my question first</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowRenewModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={renewOption === 'edit' ? () => navigate('StudentOnboarding') : handleRenew}
                disabled={isSubmitting}
                className="flex-1 bg-[#FA4616] hover:bg-orange-600"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Renew Question'}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              This will extend your question for 30 more days and keep you visible on Emerging Gators.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Question as Answered</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">Did you get the advice you needed?</p>

            {parentMatches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Who helped you the most? (optional)
                </label>
                <Select value={selectedHelper} onValueChange={setSelectedHelper}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select someone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {parentMatches.map(match => (
                      <SelectItem key={match.id} value={match.parent_id || match.id}>
                        {match.parent_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Want to thank them publicly? (optional)
              </label>
              <Textarea
                value={thankYouNote}
                onChange={(e) => setThankYouNote(e.target.value)}
                placeholder="Brief thank you note..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowResolveModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleResolve}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Answered'}
              </Button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              This will close your question. You can ask a new one anytime.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Are you sure you want to delete this question?</p>
              <p className="text-red-600 text-sm mt-2">This action cannot be undone. All answers and engagement will be lost.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2">Question to delete:</p>
              <p className="font-medium text-slate-800">"{helpRequest.description}"</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Question'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}