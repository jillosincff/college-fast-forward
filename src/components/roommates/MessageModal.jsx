import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { User } from '@/entities/User';
import { useToast } from '@/components/ui/use-toast';

export default function MessageModal({ isOpen, onClose, post, posterUser, onMessageSent }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState(`Interested in: ${post.title}`);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(user?.full_name || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({ title: "Please enter a message", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the message record
      await Message.create({
        recipient_email: post.created_by,
        sender_email: user.email,
        post_id: post.id,
        post_title: post.title,
        subject: subject,
        body: `From: ${senderName} (${senderEmail})\n\n${message}`
      });

      // Update user info if needed
      if (senderName !== user.full_name) {
        await User.updateMyUserData({ full_name: senderName });
      }

      toast({ title: "Message sent successfully!" });
      onMessageSent();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({ 
        title: "Failed to send message", 
        description: "Please try again later.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = () => {
    if (post.post_type === 'seeking_roommate') {
      return { text: 'Has a place', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { text: 'Looking to team up', color: 'bg-green-100 text-green-800' };
    }
  };

  const badge = getTypeBadge();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Send Message
          </DialogTitle>
          <DialogDescription>
            Reach out to connect about this roommate opportunity
          </DialogDescription>
        </DialogHeader>

        {/* Post Summary */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={posterUser?.profile_image_url} />
              <AvatarFallback>
                {(posterUser?.full_name || post.created_by)?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">{post.title}</h3>
                <Badge className={`${badge.color} text-xs`}>{badge.text}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {post.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ${post.rent_amount}/mo
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sender Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Your Name</Label>
              <Input
                id="senderName"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Your Email</Label>
              <Input
                id="senderEmail"
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={!!user?.email}
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'm interested in your roommate listing. I'm a UF student looking for..."
              rows={5}
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Be specific about your situation, timeline, and what makes you a good roommate.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}