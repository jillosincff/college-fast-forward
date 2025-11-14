import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { User } from '@/entities/User';
import { Bell, Loader2, CheckCircle, Coffee, Users, Briefcase } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const eventTypes = [
  { id: 'virtual_coffee_chats', label: 'Virtual Coffee Chats', icon: Coffee },
  { id: 'local_chapters', label: 'Local UF Alumni Chapters', icon: Users },
  { id: 'industry_meetups', label: 'Industry Meetups', icon: Briefcase },
];

export default function EventNotificationModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [preferences, setPreferences] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    if (user?.notification_preferences) {
      setPreferences(user.notification_preferences);
    } else {
      setPreferences({
        virtual_coffee_chats: false,
        local_chapters: false,
        industry_meetups: false,
      });
    }
  }, [user]);

  const handlePreferenceChange = (id) => {
    setPreferences(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOptIn = async () => {
    setIsLoading(true);
    try {
      await User.updateMyUserData({ notification_preferences: preferences });
      await refreshUser();
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed to update notification preference:", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isSuccess ? 'bg-green-100' : 'bg-blue-100'} mb-4`}>
            {isSuccess ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Bell className="h-6 w-6 text-blue-600" />}
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {isSuccess ? "You're all set!" : "Be the First to Know"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {isSuccess 
              ? "You’ll receive updates when alumni events go live. You can change your preferences anytime in Settings."
              : "UF alumni chapters, virtual coffee chats, and industry meetups are coming soon. Want us to notify you when new events launch?"
            }
          </DialogDescription>
        </DialogHeader>
        
        {!isSuccess && (
          <>
            <div className="space-y-4 py-4">
              {eventTypes.map(type => (
                <div key={type.id} className="flex items-center space-x-3 p-3 rounded-lg border bg-slate-50/50">
                  <Checkbox
                    id={type.id}
                    checked={preferences[type.id]}
                    onCheckedChange={() => handlePreferenceChange(type.id)}
                  />
                  <Label htmlFor={type.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <type.icon className="h-4 w-4 text-slate-600" />
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
            <DialogFooter className="sm:justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleOptIn} disabled={isLoading} className="bg-[#0021A5] hover:bg-[#001a85]">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Notify Me'}
              </Button>
            </DialogFooter>
          </>
        )}
        
        {isSuccess && (
          <DialogFooter className="sm:justify-center pt-4">
            <Button type="button" onClick={handleClose} className="bg-[#0021A5] hover:bg-[#001a85]">
              Got it
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}