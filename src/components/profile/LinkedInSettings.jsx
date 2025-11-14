import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Linkedin } from 'lucide-react';

export default function LinkedInSettings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [initialUrl, setInitialUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const url = user?.linkedin_url || '';
    setLinkedinUrl(url);
    setInitialUrl(url);
  }, [user]);

  const hasChanges = linkedinUrl !== initialUrl;

  const validateUrl = (url) => {
    if (!url) return true;
    const linkedinRegex = /^https?:\/\/.*linkedin\.com\/.+/i;
    return linkedinRegex.test(url);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setLinkedinUrl(url);
    setIsValid(validateUrl(url));
  };

  const handleUpdate = async () => {
    if (!isValid) return;
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      await User.updateMyUserData({ linkedin_url: linkedinUrl });
      await refreshUser();
      
      toast({
        title: '✅ Your LinkedIn profile has been updated.',
      });
    } catch (error) {
      console.error('Error updating LinkedIn URL:', error);
      toast({
        title: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSave = async () => {
    if (!isValid) return;

    setIsSaving(true);
    try {
      await User.updateMyUserData({ linkedin_url: linkedinUrl });
      await refreshUser();
      
      toast({
        title: '✅ Your LinkedIn profile has been saved.',
      });
    } catch (error) {
      console.error('Error saving LinkedIn URL:', error);
      toast({
        title: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData({ linkedin_url: null });
      await refreshUser();

      toast({
        title: '✅ Your LinkedIn profile has been removed.',
        description: 'You can add it again anytime.',
      });
      setLinkedinUrl('');
    } catch (error) {
      console.error('Error removing LinkedIn URL:', error);
      toast({
        title: "Failed to remove link",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const isButtonDisabled = isSaving || !isValid || !hasChanges;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-blue-600" />
          Professional Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
          <Input
            id="linkedin_profile"
            value={linkedinUrl}
            onChange={handleUrlChange}
            placeholder="https://linkedin.com/in/yourname"
            className="mt-1"
          />
          {!isValid && linkedinUrl && (
            <p className="text-sm text-red-600 mt-2">
              Please enter a valid LinkedIn profile URL.
            </p>
          )}
          <p className="text-sm text-slate-500 mt-2">
            {initialUrl
              ? "We’ll attach this link when you choose “Share my LinkedIn” in messages."
              : "Add your LinkedIn profile to make it easy for students to connect with you."
            }
          </p>
        </div>
        <div className="flex justify-end items-center gap-3 mt-4 pt-4 border-t border-slate-200">
          {initialUrl ? (
            <>
              <Button variant="ghost" onClick={handleRemove} disabled={isSaving}>
                Remove
              </Button>
              <Button onClick={handleUpdate} disabled={isButtonDisabled}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </Button>
            </>
          ) : (
            <Button onClick={handleSave} disabled={isSaving || !isValid || !linkedinUrl}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}