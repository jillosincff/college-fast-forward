import React, { useState, useEffect } from 'react';
import { JobRequest } from '@/entities/JobRequest';
import { HelpRequest } from '@/entities/HelpRequest';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function EditQuestionModal({ question, open, onOpenChange, onUpdated }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    role: '',
    target_industry: '',
    target_company: '',
  });

  useEffect(() => {
    if (question && open) {
      setFormData({
        description: question.description || '',
        role: question.role || '',
        target_industry: question.target_industry || question.industry || '',
        target_company: question.target_company || '',
      });
    }
  }, [question, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        description: formData.description,
        role: formData.role,
        target_industry: formData.target_industry,
        target_company: formData.target_company,
      };

      // Update the correct entity type
      if (question.entity_name === 'HelpRequest' || question.student_id) {
        await HelpRequest.update(question.id, {
          description: formData.description,
          industry: formData.target_industry,
        });
      } else {
        await JobRequest.update(question.id, updateData);
      }

      toast.success('Question updated successfully');
      onOpenChange(false);
      if (onUpdated) onUpdated();
    } catch (error) {
      console.error('Failed to update question:', error);
      toast.error('Failed to update question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHelpRequest = question?.entity_name === 'HelpRequest' || question?.student_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit Your Question</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Your Question / Request</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're looking for..."
              className="min-h-[120px]"
              required
            />
          </div>

          {!isHelpRequest && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Position</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_company">Target Company (optional)</Label>
                <Input
                  id="target_company"
                  value={formData.target_company}
                  onChange={(e) => setFormData({ ...formData, target_company: e.target.value })}
                  placeholder="e.g., Google, Amazon"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="target_industry">Industry</Label>
            <Input
              id="target_industry"
              value={formData.target_industry}
              onChange={(e) => setFormData({ ...formData, target_industry: e.target.value })}
              placeholder="e.g., Technology, Finance, Healthcare"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}