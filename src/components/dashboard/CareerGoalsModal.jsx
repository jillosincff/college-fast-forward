
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User } from '@/entities/User';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function CareerGoalsModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    target_roles: '',
    target_industries: '',
    target_locations: '',
    career_goals_summary: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        target_roles: user.target_roles || '',
        target_industries: user.target_industries || '',
        target_locations: user.target_locations || '',
        career_goals_summary: user.career_goals_summary || ''
      });
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(formData);
      await refreshUser();
      toast({
        title: "✅ Goals Updated",
        description: "Your career goals have been saved.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save your goals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>My Career Goals</DialogTitle>
          <DialogDescription>
            Let the network know what you're aiming for. This helps us find the best opportunities and connections for you.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800 my-4">
          <p className="font-bold mb-2">Why set your goals?</p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Get <span className="font-semibold">personalized opportunity alerts</span> tailored to your interests.</li>
            <li>Receive <span className="font-semibold">warm introductions</span> to relevant alumni and parents.</li>
            <li><span className="font-semibold">Attract mentors</span> who align with your career path.</li>
            <li>Unlock <span className="font-semibold">smarter recommendations</span> for your next steps.</li>
          </ul>
        </div>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="target_roles">Target Job Roles</Label>
            <Input
              id="target_roles"
              value={formData.target_roles}
              onChange={(e) => setFormData({ ...formData, target_roles: e.target.value })}
              placeholder="e.g., Software Engineer, PM, Data Scientist"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target_industries">Target Industries</Label>
            <Input
              id="target_industries"
              value={formData.target_industries}
              onChange={(e) => setFormData({ ...formData, target_industries: e.target.value })}
              placeholder="e.g., Big Tech, FinTech, Healthcare, Consulting"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target_locations">Target Locations</Label>
            <Input
              id="target_locations"
              value={formData.target_locations}
              onChange={(e) => setFormData({ ...formData, target_locations: e.target.value })}
              placeholder="e.g., Remote, NYC, SF, London"
            />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="career_goals_summary">Career Goals Summary</Label>
            <Textarea
              id="career_goals_summary"
              value={formData.career_goals_summary}
              onChange={(e) => setFormData({ ...formData, career_goals_summary: e.target.value })}
              placeholder="Briefly describe your dream job or what you hope to achieve in your career. (e.g., 'To lead a product team at a mission-driven startup within the next 5 years.')"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
