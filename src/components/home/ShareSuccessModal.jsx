
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { SuccessStory } from '@/entities/SuccessStory';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, Sparkles } from 'lucide-react'; // Changed Send to Loader2

export default function ShareSuccessModal({ isOpen, onClose, onStorySubmitted }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    user_name: user?.full_name || '',
    user_grad_year: user?.graduation_year || '',
    story_text: '',
    story_type: 'Job'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.story_text || !formData.story_type) {
      toast({
        title: 'Please complete the form',
        description: 'A short story and a category are required.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await SuccessStory.create({
        ...formData,
        is_approved: false // Stories should require approval
      });
      toast({
        title: '🎉 Story Submitted!',
        description: "Thank you for inspiring other Gators! We'll review your story shortly.",
      });
      onStorySubmitted();
      onClose();
    } catch (error) {
      console.error('Failed to submit story:', error);
      toast({
        title: 'Submission Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="w-8 h-8 text-[#FA4616]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Share Your Success!
          </DialogTitle>
          <p className="text-slate-600 text-sm">
            Inspire other Gators by sharing how the network helped you.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5"> {/* Added px-6 pb-6 for internal padding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_name">Your Name</Label>
              <Input id="user_name" value={formData.user_name} onChange={e => handleInputChange('user_name', e.target.value)} placeholder="e.g., Jessica M." />
            </div>
            <div>
              <Label htmlFor="user_grad_year">Graduation Year</Label>
              <Input id="user_grad_year" value={formData.user_grad_year} onChange={e => handleInputChange('user_grad_year', e.target.value)} placeholder="e.g., '23" />
            </div>
          </div>
          <div>
            <Label htmlFor="story_type">Category</Label>
            <Select value={formData.story_type} onValueChange={value => handleInputChange('story_type', value)}>
              <SelectTrigger id="story_type">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Job">Job</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Roommate">Roommate</SelectItem>
                <SelectItem value="Mentorship">Mentorship</SelectItem>
                <SelectItem value="Career Change">Career Change</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="story_text">Your Story</Label>
            <Textarea
              id="story_text"
              value={formData.story_text}
              onChange={e => handleInputChange('story_text', e.target.value)}
              placeholder="How did the Gator network help you? e.g., 'A Gator parent connected me with someone at Google...'"
              className="min-h-[120px]"
            />
          </div>
          <div className="pt-5 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.story_text.trim() || !formData.story_type}
              className="w-full bg-[var(--uf-orange)] hover:bg-orange-600 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share My Story'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
