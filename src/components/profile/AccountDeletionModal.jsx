import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { deleteUserAccount } from '@/functions/deleteUserAccount';
import { useAuth } from '@/components/auth/AuthContext';

export default function AccountDeletionModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmationText !== 'DELETE') {
      toast({
        title: 'Confirmation Mismatch',
        description: 'Please type DELETE exactly as shown to confirm.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount({ confirmationText });
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted. We are sorry to see you go.',
      });
      // Log the user out and redirect after deletion
      await logout();
    } catch (error) {
      toast({
        title: 'Error Deleting Account',
        description: error.message || 'An unexpected error occurred. Please contact support.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Delete Your Account
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All of your data, including messages, posts, and connections, will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm font-medium">
            To confirm, please type <strong>DELETE</strong> in the box below.
          </p>
          <div>
            <Label htmlFor="confirmation" className="sr-only">
              Confirmation
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="border-red-300 focus:border-red-500"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText !== 'DELETE'}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
            <Trash2 className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}