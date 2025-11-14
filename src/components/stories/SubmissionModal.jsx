
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SuccessStory } from '@/entities/SuccessStory';
import { UploadFile } from '@/integrations/Core';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react'; // PartyPopper replaced with CheckCircle

export default function SubmissionModal({ isOpen, onClose, onSubmitted }) {
  const { user } = useAuth();
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      user_name: user?.full_name?.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ') || '',
      user_grad_year: user?.graduation_year || '',
      story_type: '',
      story_text: '',
      user_role: '',
      linkedin_url: '',
      consent: false,
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // isSuccess state removed, using successMessage for conditional rendering
  const [successMessage, setSuccessMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const handleClose = () => {
    reset(); // Reset form fields
    setSuccessMessage(''); // Clear success message
    onSubmitted(); // Notify parent component (e.g., refresh data)
    onClose(); // Close the modal
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let photo_url = '';
      if (photoFile) {
        const uploadResult = await UploadFile({ file: photoFile });
        if (uploadResult?.file_url) {
          photo_url = uploadResult.file_url;
        }
      }

      await SuccessStory.create({
        user_name: data.user_name,
        user_grad_year: data.user_grad_year,
        user_role: data.user_role,
        story_text: data.story_text,
        story_type: data.story_type,
        linkedin_url: data.linkedin_url,
        photo_url,
        is_approved: false, // For moderation
        cheer_count: 0
      });

      setSuccessMessage("Thank you! Your story has been submitted for review. It will appear on the site once it's approved.");
      setIsSubmitting(false); // Ensure submitting state is reset after success

      // Removed the setTimeout here; modal will display success message until explicitly closed
    } catch (error) {
      console.error("Failed to submit story:", error);
      alert("There was an error submitting your story. Please try again.");
    } finally {
      setIsSubmitting(false); // Ensure submitting state is reset even on error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}> {/* Use handleClose for closing */}
      <DialogContent className="sm:max-w-2xl bg-slate-50">
        {successMessage ? ( // Conditional rendering based on successMessage
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-800">Story Submitted!</h3>
            <p className="text-slate-600 mt-2 max-w-md mx-auto">{successMessage}</p>
            <Button onClick={handleClose} className="mt-6">Close</Button>
          </div>
        ) : (
          <> {/* Fragment to group DialogHeader and form */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">Share Your Success Story</DialogTitle>
              <DialogDescription>
                Your story can inspire and guide fellow Gators. Let's celebrate your wins!
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Updated spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_name">Your Name</Label>
                  <Input id="user_name" {...register("user_name", { required: "Name is required" })} />
                  {errors.user_name && <p className="text-red-500 text-xs mt-1">{errors.user_name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="user_grad_year">Graduation Year (e.g., '23)</Label>
                  <Input id="user_grad_year" {...register("user_grad_year")} />
                </div>
              </div>
              <div>
                <Label htmlFor="user_role">Your Role (e.g., Software Engineer at Google)</Label>
                <Input id="user_role" {...register("user_role")} />
              </div>
              <div>
                <Label htmlFor="story_text">Your Success Story</Label>
                <Textarea id="story_text" {...register("story_text", { required: "Story is required" })} rows={5} />
                {errors.story_text && <p className="text-red-500 text-xs mt-1">{errors.story_text.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <Label htmlFor="story_type">Category</Label>
                  <Controller
                    name="story_type"
                    control={control}
                    rules={{ required: "Please select a category" }}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="story_type">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Job", "Internship", "Roommate", "Career Change", "Mentorship", "Other"].map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.story_type && <p className="text-red-500 text-xs mt-1">{errors.story_type.message}</p>}
                 </div>
                 <div>
                   <Label htmlFor="photo">Photo (Optional)</Label>
                   <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
                 </div>
              </div>
               <div>
                <Label htmlFor="linkedin_url">LinkedIn Profile URL (Optional)</Label>
                <Input id="linkedin_url" {...register("linkedin_url")} placeholder="https://linkedin.com/in/your-profile" />
              </div>
              <div className="flex items-start space-x-3">
                <Controller
                  name="consent"
                  control={control}
                  rules={{ required: "You must consent to share your story" }}
                  render={({ field }) => (
                    <Checkbox
                      id="consent"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="consent" className="text-sm font-medium text-slate-700">
                    I consent to share my story
                  </Label>
                  <p className="text-xs text-slate-600">
                    By checking this box, you agree to share this story publicly on the site and in marketing materials.
                  </p>
                  {errors.consent && <p className="text-red-500 text-xs mt-1">{errors.consent.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button> {/* Use handleClose for cancel */}
                <Button type="submit" disabled={isSubmitting} className="bg-[var(--uf-orange)] hover:bg-orange-600">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit for Review
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
