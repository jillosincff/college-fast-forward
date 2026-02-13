import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { INDUSTRIES } from '@/components/onboarding/onboardingOptions';

const EVENT_TYPES = [
  { value: 'interview', label: '🎤 Interview' },
  { value: 'internship', label: '📋 Internship' },
  { value: 'career_fair', label: '🏢 Career Fair' },
  { value: 'networking_event', label: '🤝 Networking Event' },
  { value: 'job_offer', label: '🎉 Job Offer' },
  { value: 'class_project', label: '📚 Class Project' },
  { value: 'other', label: '✨ Other' },
];

export default function ShareStoryModal({ isOpen, onClose, user }) {
  const [eventType, setEventType] = useState('');
  const [storyText, setStoryText] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const firstName = user?.first_name || user?.full_name?.split(/[\s,]+/)[0] || 'Gator';

  const handleSubmit = async () => {
    if (!eventType || storyText.trim().length < 30) return;
    setSubmitting(true);
    try {
      await base44.entities.SuccessStory.create({
        user_name: user.full_name || user.email.split('@')[0],
        user_email: user.email,
        user_grad_year: user.graduation_year || '',
        poster_type: 'student',
        story_text: storyText.trim(),
        story_type: 'What I Learned',
        event_type: eventType,
        company: company.trim(),
        industry: industry,
        is_approved: false,
        cheer_count: 0,
      });

      // Award karma
      try {
        await base44.functions.invoke('awardStudentKarma', {
          userId: user.id,
          userEmail: user.email,
          actionType: 'share_story',
          description: `Shared a "${eventType}" story`
        });
      } catch (e) {
        console.log('Karma award failed (non-critical):', e.message);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit story:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEventType('');
    setStoryText('');
    setCompany('');
    setIndustry('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Story Shared! +10 karma 🎉</h3>
            <p className="text-sm text-slate-600 mb-6">
              Thanks for paying it forward, {firstName}! Your story will appear in the community feed once reviewed.
            </p>
            <Button onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Share What You Learned</DialogTitle>
              <DialogDescription>
                Your experience helps other Gators. Quick 2-minute share.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Event Type */}
              <div>
                <Label className="text-sm font-medium">What happened? *</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(et => (
                      <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Story Text */}
              <div>
                <Label className="text-sm font-medium">What did you learn? *</Label>
                <Textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Share your takeaway — what would you tell a fellow Gator? e.g., 'The behavioral questions at Deloitte were all about teamwork...'"
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {storyText.length < 30 ? `${30 - storyText.length} more characters needed` : `${storyText.length} chars`}
                </p>
              </div>

              {/* Company & Industry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Company (optional)</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Industry (optional)</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind.id} value={ind.id}>
                          {ind.emoji} {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!eventType || storyText.trim().length < 30 || submitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Sharing...</>
                ) : (
                  'Share Story'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}