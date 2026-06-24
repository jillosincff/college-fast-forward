import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cancelMySubscription } from '@/functions/cancelMySubscription';
import { format } from 'date-fns';

export default function CancelSubscriptionButton({ onCanceled }) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const { data } = await cancelMySubscription({});
      if (data?.success) {
        const until = data.access_until ? format(new Date(data.access_until), 'MMMM d, yyyy') : null;
        toast({
          title: 'Subscription canceled',
          description: until
            ? `You'll keep full access until ${until}. No further charges.`
            : "Your subscription won't renew. No further charges.",
        });
        setOpen(false);
        onCanceled?.();
      } else {
        toast({
          title: 'Could not cancel',
          description: data?.message || data?.error || 'Please try again or contact support.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errData = error?.response?.data;
      toast({
        title: 'Could not cancel',
        description: errData?.message || errData?.error || 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
          <XCircle className="w-4 h-4 mr-2" />
          Cancel Subscription
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            You'll keep full access until the end of your current billing period, and you won't be charged again. You can resubscribe anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Keep my plan</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleCancel(); }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}