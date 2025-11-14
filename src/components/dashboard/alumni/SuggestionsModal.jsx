import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navigate } from '@/components/utils/navigation';
import { Users } from 'lucide-react';

const suggestedAlumni = [
  { name: 'Sarah Miller', gradYear: '12', industry: 'Consulting' },
  { name: 'Jordan Chen', gradYear: '15', industry: 'Tech' },
  { name: 'Maya Desai', gradYear: '10', industry: 'Finance' },
];

export default function SuggestionsModal({ isOpen, onClose }) {
  const handleBrowseDirectory = () => {
    navigate('GatorDirectory', { tab: 'suggestions' });
    onClose();
  };
  
  const handleViewProfile = (alumni) => {
    // In a real app, this would navigate to a specific profile page
    console.log('Viewing profile for', alumni.name);
    navigate('GatorDirectory', { q: alumni.name });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Alumni You Should Meet</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Based on your industry and graduation year, here are alumni we think you’ll want to connect with. These are early suggestions—click a profile to learn more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-3">
          {suggestedAlumni.length > 0 ? (
            suggestedAlumni.map((alumni, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">{alumni.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{alumni.name} ’{alumni.gradYear}</p>
                  <p className="text-xs text-slate-500">{alumni.industry}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleViewProfile(alumni)}>View Profile</Button>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-slate-500 py-6">
              We’re still gathering great alumni connections for you. In the meantime,{' '}
              <a onClick={handleBrowseDirectory} className="text-[#0021A5] font-medium hover:underline cursor-pointer">
                explore the Gator Directory
              </a> to start building your network.
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button type="button" onClick={handleBrowseDirectory} className="bg-[#0021A5] hover:bg-[#001a85]">
            Browse Full Directory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}