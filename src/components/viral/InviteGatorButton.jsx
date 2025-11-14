import { useState } from "react";
import { trackEvent } from "@/components/utils/analytics";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthContext";
import { User } from "@/entities/User";
import ShareInviteModal from "../home/ShareInviteModal"; // Import the modal
import { useToast } from "@/components/ui/use-toast";

export default function InviteGatorButton({ from = "unknown", variant = "default", size, className = "", children, onInviteSent }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteCount, setInviteCount] = useState(0); // Internal counter

  const handleClick = () => {
    trackEvent("invite_button_clicked", { from, isLoggedIn: !!user });
    if (user) {
      setIsModalOpen(true);
    } else {
      // If user is not logged in, redirect them to sign in
      User.loginWithRedirect(window.location.href);
    }
  };

  const handleInviteSent = () => {
    const newCount = inviteCount + 1;
    setInviteCount(newCount);
    if (onInviteSent) {
      onInviteSent(); // Call parent handler if it exists
    }
    toast({
      title: "🎉 Invite Sent!",
      description: "Thank you for growing our Gator Nation.",
    });
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
      >
        {children || "Invite a Gator"}
      </Button>
      
      <ShareInviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInviteSent={handleInviteSent}
        inviteCount={inviteCount}
      />
    </>
  );
}