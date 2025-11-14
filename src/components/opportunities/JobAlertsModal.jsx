import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Zap } from 'lucide-react';

export default function JobAlertsModal({ isOpen, onClose }) {
  const [keywords, setKeywords] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const { toast } = useToast();

  const handleSaveAlert = () => {
    // In a real app, this would save the alert preferences to the backend.
    toast({
      title: "✅ Job Alert Saved!",
      description: `We'll notify you ${frequency} with new opportunities matching your criteria.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mx-auto mb-4">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Set Job Alert</DialogTitle>
          <DialogDescription className="text-center">
            Get notified about new opportunities that match your interests.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="keywords" className="text-sm font-medium text-gray-700">Keywords</label>
            <Input 
              id="keywords" 
              placeholder="e.g., Marketing, Software Engineer" 
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="frequency" className="text-sm font-medium text-gray-700">Notification Frequency</label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" className="mt-1">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveAlert} className="bg-blue-600 hover:bg-blue-700">
            <Zap className="w-4 h-4 mr-2" />
            Save Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}