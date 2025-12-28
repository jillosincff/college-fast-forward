import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PartyPopper, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import ChallengeCompleteModal from './ChallengeCompleteModal';

export default function LogIntroModal({ isOpen, onClose, user, matches, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedDays, setCompletedDays] = useState(0);
  
  const [formData, setFormData] = useState({
    helper_id: '',
    helper_name: '',
    company: '',
    note: ''
  });

  // Build helper options from matches
  const helperOptions = (matches || [])
    .filter(m => m.parent_name || m.helper_name)
    .map(m => ({
      id: m.parent_id || m.helper_id || m.id,
      name: m.parent_name || m.helper_name,
      company: m.parent_company || m.helper_company || ''
    }));

  const handleHelperSelect = (value) => {
    if (value === 'other') {
      setFormData({ ...formData, helper_id: 'other', helper_name: '' });
    } else {
      const helper = helperOptions.find(h => h.id === value);
      setFormData({
        ...formData,
        helper_id: value,
        helper_name: helper?.name || '',
        company: helper?.company || formData.company
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.helper_name && formData.helper_id !== 'other') {
      toast({
        title: "Please select who helped you",
        variant: "destructive"
      });
      return;
    }

    if (formData.helper_id === 'other' && !formData.helper_name) {
      toast({
        title: "Please enter the helper's name",
        variant: "destructive"
      });
      return;
    }

    if (!formData.company) {
      toast({
        title: "Please enter where you were introduced",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const currentIntros = user?.challenge_intros || [];
      const currentCount = user?.challenge_intros_count || 0;
      const newCount = currentCount + 1;
      
      const newIntro = {
        helper_id: formData.helper_id,
        helper_name: formData.helper_name,
        company: formData.company,
        note: formData.note,
        logged_at: new Date().toISOString()
      };

      const updateData = {
        challenge_intros: [...currentIntros, newIntro],
        challenge_intros_count: newCount
      };

      // Check if challenge is completed
      if (newCount >= 3 && !user?.challenge_completed) {
        const startDate = user?.challenge_start_date ? new Date(user.challenge_start_date) : new Date();
        const daysToComplete = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        
        updateData.challenge_completed = true;
        updateData.challenge_completed_at = new Date().toISOString();
        updateData.challenge_days_to_complete = daysToComplete;
        
        setCompletedDays(daysToComplete);
      }

      await base44.auth.updateMe(updateData);

      onClose();
      
      if (newCount >= 3 && !user?.challenge_completed) {
        // Show celebration modal
        setShowCompleteModal(true);
      } else {
        const remaining = 3 - newCount;
        toast({
          title: "🎉 Intro logged!",
          description: remaining > 0 
            ? `${remaining} more to go. Keep it up!` 
            : "You're on fire! 🔥",
        });
      }

      onSuccess?.();

      // Reset form
      setFormData({ helper_id: '', helper_name: '', company: '', note: '' });

    } catch (error) {
      console.error('Failed to log intro:', error);
      toast({
        title: "Failed to log intro",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <PartyPopper className="w-6 h-6 text-orange-500" />
              Log Your Intro
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <p className="text-slate-600">
              Nice work! Who helped you?
            </p>

            <div className="space-y-2">
              <Label>Select parent or alumni</Label>
              <Select
                value={formData.helper_id}
                onValueChange={handleHelperSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select who helped you..." />
                </SelectTrigger>
                <SelectContent>
                  {helperOptions.map((helper) => (
                    <SelectItem key={helper.id} value={helper.id}>
                      {helper.name}{helper.company ? ` (${helper.company})` : ''}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">
                    Someone else...
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.helper_id === 'other' && (
              <div className="space-y-2">
                <Label>Helper's name</Label>
                <Input
                  placeholder="e.g., Sarah Martinez"
                  value={formData.helper_name}
                  onChange={(e) => setFormData({ ...formData, helper_name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Where were you introduced?</Label>
              <Input
                placeholder='e.g., "Google", "Jane Smith at Deloitte"'
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Any notes? <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                placeholder='e.g., "Interview scheduled for next week!"'
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#FA4616] to-orange-500 hover:from-orange-600 hover:to-orange-600"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Log This Intro →
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ChallengeCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        daysToComplete={completedDays}
      />
    </>
  );
}