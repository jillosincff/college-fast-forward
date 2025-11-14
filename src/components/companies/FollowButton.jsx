import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { CompanyFollow } from '@/entities/CompanyFollow';
import { useToast } from '@/components/ui/use-toast';

export default function FollowButton({ companyId, companyName, onFollowChange }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && companyId) {
      checkFollowStatus();
    }
  }, [user, companyId]);

  const checkFollowStatus = async () => {
    try {
      const followData = await CompanyFollow.filter({
        user_id: user.id,
        company_id: companyId
      });
      setIsFollowing(followData && followData.length > 0);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow companies",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFollowing) {
        const followRecord = await CompanyFollow.filter({
          user_id: user.id,
          company_id: companyId
        });
        if (followRecord[0]) {
          await CompanyFollow.delete(followRecord[0].id);
        }
        setIsFollowing(false);
        
        toast({
          title: "Unfollowed",
          description: `You've unfollowed ${companyName}`,
        });
      } else {
        await CompanyFollow.create({
          user_id: user.id,
          company_id: companyId,
          company_name: companyName
        });
        setIsFollowing(true);
        
        toast({
          title: "Following!",
          description: `You'll receive notifications about new opportunities from ${companyName}`,
        });
      }

      if (onFollowChange) {
        onFollowChange(isFollowing);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      className={isFollowing 
        ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
        : "bg-blue-600 hover:bg-blue-700 text-white"
      }
    >
      {isLoading ? (
        'Loading...'
      ) : isFollowing ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Following
        </>
      ) : (
        <>
          <Heart className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}