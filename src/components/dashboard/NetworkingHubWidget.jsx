import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, ArrowRight, Briefcase, MessageSquare, Send, Sparkles, Wand2 } from 'lucide-react';
import { trackEvent } from '@/components/utils/analytics';
import { useAuth } from '@/components/auth/AuthContext';
import { Message } from '@/entities/Message';
import { useToast } from '@/components/ui/use-toast';
import UserAvatar from '@/components/common/UserAvatar';

export default function NetworkingHubWidget({ alumniPeers, loading, onViewAll }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // DM Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  // AI-powered message suggestions based on peer profile and user context
  const suggestMessage = (peer) => {
    const currentUserName = user?.full_name?.split(' ')[0] || 'there';
    const peerFirstName = peer.name.split(' ')[0];
    const currentYear = new Date().getFullYear();
    const userGradYear = user?.graduation_year || currentYear - 5;
    const peerGradYear = peer.gradYear || currentYear - 5;
    
    // Different templates based on relationship context
    const templates = {
      sameIndustry: `Hi ${peerFirstName}! 🐊 Fellow Gator here working in ${peer.industry}. Would love to connect and share experiences about our industry. Open to grabbing coffee or a quick chat?`,
      sameGradYear: `Hey ${peerFirstName}! 🐊 Class of '${userGradYear.toString().slice(-2)} here too! Saw your profile and would love to connect with a fellow alum from our year. How's ${peer.company} treating you?`,
      recentGrad: `Hi ${peerFirstName}! 🐊 ${userGradYear > peerGradYear ? 'Newer' : 'Fellow'} Gator here - would love to learn from your experience at ${peer.company}. Any insights you'd be willing to share about ${peer.industry}?`,
      networking: `Hey ${peerFirstName}! 🐊 I'm impressed by your journey at ${peer.company}. As a fellow Gator, I'd love to connect and hear about your experience in ${peer.industry}. Coffee chat sometime?`,
      default: `Hi ${peerFirstName}! 🐊 Fellow Gator reaching out - saw your profile and would love to connect. Always excited to meet other UF alums making waves in their careers!`
    };

    // Smart template selection based on context
    if (user?.current_company && peer.industry && 
        (user.current_company.toLowerCase().includes(peer.industry.toLowerCase()) || 
         peer.industry.toLowerCase().includes(user.current_company.toLowerCase()))) {
      return templates.sameIndustry;
    }
    
    if (Math.abs(userGradYear - peerGradYear) <= 1) {
      return templates.sameGradYear;
    }
    
    if (Math.abs(userGradYear - peerGradYear) <= 3) {
      return templates.recentGrad;
    }
    
    return templates.networking;
  };

  const handleDMClick = (peer) => {
    setSelectedPeer(peer);
    setMessage(suggestMessage(peer));
    setIsModalOpen(true);
    trackEvent('alumni_peer_dm_modal_opened', { 
      peerId: peer.id, 
      peerName: peer.name,
      peerIndustry: peer.industry,
      peerGradYear: peer.gradYear
    });
  };

  const handleGenerateMessage = async () => {
    if (!selectedPeer) return;
    
    setIsGeneratingMessage(true);
    try {
      // Simulate AI generation with multiple creative suggestions
      const suggestions = [
        suggestMessage(selectedPeer),
        `Hey ${selectedPeer.name.split(' ')[0]}! 🐊 Love seeing fellow Gators thriving at ${selectedPeer.company}. Mind if we connect? I'm ${user?.persona === 'alumni' ? 'also in the' : 'exploring the'} ${selectedPeer.industry} space.`,
        `Hi ${selectedPeer.name.split(' ')[0]}! 🐊 Your background in ${selectedPeer.industry} caught my eye. As a fellow UF alum, I'd appreciate any insights you might share about the industry!`,
        `${selectedPeer.name.split(' ')[0]} - Go Gators! 🐊 I'm always looking to expand my network with fellow alumni. Would love to hear about your journey at ${selectedPeer.company} if you're open to connecting!`
      ];
      
      // Pick a random suggestion for variety
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      
      // Simulate network delay for realistic feel
      setTimeout(() => {
        setMessage(randomSuggestion);
        setIsGeneratingMessage(false);
        toast({
          title: "✨ Message Generated!",
          description: "Feel free to personalize before sending.",
        });
      }, 1500);
    } catch (error) {
      setIsGeneratingMessage(false);
      toast({
        title: "Couldn't generate message",
        description: "Please try writing your own message.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedPeer) return;

    setIsSending(true);
    try {
      // In a real app, this would create a message record
      await Message.create({
        recipient_email: selectedPeer.email || `${selectedPeer.name.toLowerCase().replace(' ', '.')}@example.com`,
        sender_email: user.email,
        subject: `Message from ${user.full_name} via Gator Network`,
        body: message
      });
      
      trackEvent('alumni_peer_message_sent', { 
        peerId: selectedPeer.id, 
        messageLength: message.length,
        peerIndustry: selectedPeer.industry,
        source: 'networking_hub_widget'
      });
      
      toast({
        title: `🎉 Message Sent!`,
        description: `Your message has been sent to ${selectedPeer.name}.`,
      });
      
      setIsModalOpen(false);
      setMessage('');
      setSelectedPeer(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Couldn't send message",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-slate-200 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Users className="w-6 h-6 text-orange-600" />
            </motion.div>
            <div>
              <div className="text-xl font-bold text-slate-900">Alumni Networking Hub</div>
              <div className="text-sm text-slate-600 font-normal">
                Connect with fellow alumni in your industry
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {alumniPeers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-semibold text-slate-900 mb-2">Grow Your Network</h3>
              <p className="text-slate-600 text-sm mb-4">
                Discover and connect with other Gator alumni.
              </p>
              <Button onClick={onViewAll} variant="outline">
                Browse Directory
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {alumniPeers.map((peer, index) => (
                <motion.div
                  key={peer.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <UserAvatar user={{ full_name: peer.name }} className="w-10 h-10" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{peer.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Briefcase className="w-3 h-3" />
                      <span>{peer.industry} at {peer.company}</span>
                    </div>
                    {peer.gradYear && (
                      <div className="text-xs text-slate-400 mt-1">
                        Class of '{peer.gradYear.toString().slice(-2)}
                      </div>
                    )}
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div className="flex-shrink-0">
                        <Button 
                          size="sm"
                          onClick={() => handleDMClick(peer)}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold min-w-[120px] min-h-[48px] px-4"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={`Send a direct message to ${peer.name}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          DM this Gator
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send a private message to start networking</p>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
               
              <Button 
                onClick={onViewAll}
                variant="outline" 
                className="w-full mt-4 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                View All Peers in Directory
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced DM Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPeer && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <UserAvatar user={{ full_name: selectedPeer.name }} className="w-10 h-10" />
                    <div>
                      <div className="text-lg">DM {selectedPeer.name.split(' ')[0]}</div>
                      <div className="text-sm font-normal text-slate-600">
                        {selectedPeer.industry} at {selectedPeer.company}
                        {selectedPeer.gradYear && ` • Class of '${selectedPeer.gradYear.toString().slice(-2)}`}
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="min-h-[120px] resize-none pr-12"
                      disabled={isSending}
                      aria-label="Message content"
                    />
                    <div className="absolute bottom-3 right-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerateMessage}
                            disabled={isGeneratingMessage}
                            className="text-slate-500 hover:text-slate-700 p-2"
                            aria-label="Generate AI message suggestion"
                          >
                            {isGeneratingMessage ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <Wand2 className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate AI message suggestion</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 bg-blue-50 p-3 rounded-lg">
                    💡 <strong>Pro tip:</strong> Mention shared UF experiences or ask about their career journey for better engagement!
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!message.trim() || isSending}
                      className="bg-orange-500 hover:bg-orange-600 min-w-[100px]"
                    >
                      {isSending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Send className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </DialogFooter>
                </form>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}