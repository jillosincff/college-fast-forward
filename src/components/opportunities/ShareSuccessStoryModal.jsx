import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { SuccessStory } from '@/entities/SuccessStory';
import { UploadFile } from '@/integrations/Core';
import { Heart, Upload, Star, Loader2, CheckCircle } from 'lucide-react';

export default function ShareSuccessStoryModal({ isOpen, onClose, user }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    user_name: user?.full_name || '',
    user_grad_year: user?.graduation_year ? `'${String(user.graduation_year).slice(-2)}` : '',
    user_role: user?.current_position || '',
    story_text: '',
    story_type: '',
    linkedin_url: user?.linkedin_url || '',
    photo_url: '',
    allow_contact: false,
    anonymous: false
  });

  const storyTypes = [
    { value: 'Job', label: 'Got a Job' },
    { value: 'Internship', label: 'Landed an Internship' },
    { value: 'Career Change', label: 'Made a Career Change' },
    { value: 'Mentorship', label: 'Found a Mentor' },
    { value: 'Roommate', label: 'Found Great Roommates' },
    { value: 'Other', label: 'Other Success' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setPhotoFile(file);
    setUploading(true);

    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, photo_url: file_url }));
      toast({
        title: "Photo uploaded!",
        description: "Your photo has been added to your story.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
      setPhotoFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.story_text.trim()) {
      toast({
        title: "Story required",
        description: "Please share your success story.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.story_type) {
      toast({
        title: "Story type required",
        description: "Please select what type of success you're sharing.",
        variant: "destructive"
      });
      return;
    }

    if (formData.story_text.length < 50) {
      toast({
        title: "Story too short",
        description: "Please provide more details about your success (at least 50 characters).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const storyData = {
        user_name: formData.anonymous ? 'Anonymous Gator' : formData.user_name || 'Gator Student',
        user_grad_year: formData.anonymous ? '' : formData.user_grad_year,
        user_role: formData.anonymous ? '' : formData.user_role,
        story_text: formData.story_text.trim(),
        story_type: formData.story_type,
        linkedin_url: formData.anonymous ? '' : formData.linkedin_url,
        photo_url: formData.anonymous ? '' : formData.photo_url,
        is_approved: false, // Requires admin approval
        is_featured: false,
        cheer_count: 0
      };

      console.log('Submitting success story:', storyData);

      const newStory = await SuccessStory.create(storyData);
      console.log('Success story created:', newStory);

      setSubmitted(true);
      
      toast({
        title: "🎉 Success story submitted!",
        description: "Thank you for sharing! Your story will be reviewed and published soon.",
      });

      // Track the submission
      if (window.gtag) {
        window.gtag('event', 'success_story_submitted', {
          story_type: formData.story_type,
          user_persona: user?.persona
        });
      }

    } catch (error) {
      console.error('Error submitting success story:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitted) {
      // Reset form for next time
      setFormData({
        user_name: user?.full_name || '',
        user_grad_year: user?.graduation_year ? `'${String(user.graduation_year).slice(-2)}` : '',
        user_role: user?.current_position || '',
        story_text: '',
        story_type: '',
        linkedin_url: user?.linkedin_url || '',
        photo_url: '',
        allow_contact: false,
        anonymous: false
      });
      setSubmitted(false);
      setPhotoFile(null);
    }
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Story Submitted!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Thank you for sharing your success!
            </h3>
            <p className="text-slate-600 mb-6">
              Your story will be reviewed by our team and published on the success stories page. 
              Other Gators will be inspired by your journey!
            </p>
            
            <Button onClick={handleClose} className="bg-[#FA4616] hover:bg-[#E03D00]">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Share Your Success Story
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Story Type */}
          <div>
            <Label>What success are you celebrating? *</Label>
            <Select 
              value={formData.story_type} 
              onValueChange={(value) => handleInputChange('story_type', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your success type" />
              </SelectTrigger>
              <SelectContent>
                {storyTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Success Story */}
          <div>
            <Label htmlFor="story">Tell us your story! *</Label>
            <Textarea
              id="story"
              placeholder="Share how the Gator network helped you achieve this success. What happened? Who helped? What advice would you give to other Gators?"
              value={formData.story_text}
              onChange={(e) => handleInputChange('story_text', e.target.value)}
              className="mt-1 min-h-[120px]"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Be specific! Other Gators want to learn from your experience.</span>
              <span>{formData.story_text.length}/1000</span>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Add a photo (optional)</Label>
            <div className="mt-1 border-2 border-dashed border-slate-300 rounded-lg p-4">
              {!formData.photo_url ? (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">Upload a photo to make your story more engaging</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" disabled={uploading}>
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      {uploading ? 'Uploading...' : 'Choose Photo'}
                    </Button>
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img src={formData.photo_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Photo uploaded successfully!</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Personal Details */}
          {!formData.anonymous && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={formData.user_name}
                    onChange={(e) => handleInputChange('user_name', e.target.value)}
                    placeholder="e.g., Sarah M."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="grad_year">Graduation year</Label>
                  <Input
                    id="grad_year"
                    value={formData.user_grad_year}
                    onChange={(e) => handleInputChange('user_grad_year', e.target.value)}
                    placeholder="e.g., '24"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Current role/title (optional)</Label>
                <Input
                  id="role"
                  value={formData.user_role}
                  onChange={(e) => handleInputChange('user_role', e.target.value)}
                  placeholder="e.g., Software Engineer at Google"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Privacy Options */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.anonymous}
                onCheckedChange={(checked) => handleInputChange('anonymous', checked)}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Post anonymously as "Anonymous Gator"
              </Label>
            </div>
            
            {!formData.anonymous && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow_contact"
                  checked={formData.allow_contact}
                  onCheckedChange={(checked) => handleInputChange('allow_contact', checked)}
                />
                <Label htmlFor="allow_contact" className="text-sm">
                  Allow other Gators to reach out to me for advice
                </Label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.story_text.trim() || !formData.story_type}
              className="bg-[#FA4616] hover:bg-[#E03D00]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Share My Story
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}