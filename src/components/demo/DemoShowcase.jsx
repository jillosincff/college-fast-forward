import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Users, 
  TrendingUp, 
  Handshake, 
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import LiveStatsCounter from '../connections/LiveStatsCounter';
import ConfettiCelebration from '../viral/ConnectionCelebration';

export default function DemoShowcase({ 
  isOpen, 
  onClose, 
  targetAudience = "alumni" // alumni, parents, administrators
}) {
  const [activeDemo, setActiveDemo] = useState('overview');
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const demoContent = {
    overview: {
      title: "GatorConnect: 10x Engagement Platform",
      subtitle: "See how we're revolutionizing alumni networking",
      features: [
        "Real-time connection matching",
        "Viral sharing mechanisms", 
        "Gamified engagement system",
        "Mobile-first design"
      ]
    },
    confetti: {
      title: "Delightful Micro-Interactions",
      subtitle: "Every connection feels like a celebration",
      action: () => setShowConfetti(true)
    },
    stats: {
      title: "Live Engagement Metrics",
      subtitle: "Track impact in real-time",
      component: <LiveStatsCounter />
    }
  };

  const handleCopyInviteLink = async () => {
    const inviteLink = "https://gatorconnect.com/demo/alumni-org";
    await navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const engagementStats = {
    alumni: {
      metric1: { label: "Alumni Participation", value: "73%", trend: "+15%" },
      metric2: { label: "Connections Made", value: "2,847", trend: "+34%" },
      metric3: { label: "Success Stories", value: "156", trend: "+28%" }
    },
    parents: {
      metric1: { label: "Parent Engagement", value: "89%", trend: "+22%" },
      metric2: { label: "Student Helps", value: "1,234", trend: "+45%" },
      metric3: { label: "Network Growth", value: "67%", trend: "+12%" }
    }
  };

  const stats = engagementStats[targetAudience] || engagementStats.alumni;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold mb-2">
                Experience the GatorConnect Difference
              </DialogTitle>
              <p className="text-blue-100 text-lg">
                See why alumni organizations get 10x more engagement with our platform
              </p>
            </DialogHeader>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              {Object.entries(stats).map(([key, stat]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-200 mb-2">
                    {stat.label}
                  </div>
                  <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                    {stat.trend} this month
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Demo Navigation */}
            <div className="flex gap-2 mb-8">
              {Object.entries(demoContent).map(([key, content]) => (
                <Button
                  key={key}
                  variant={activeDemo === key ? "default" : "outline"}
                  onClick={() => setActiveDemo(key)}
                  className="capitalize"
                >
                  {key === 'confetti' && <Sparkles className="w-4 h-4 mr-2" />}
                  {key === 'stats' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {key === 'overview' && <Play className="w-4 h-4 mr-2" />}
                  {key}
                </Button>
              ))}
            </div>

            {/* Demo Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDemo}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {demoContent[activeDemo].title}
                  </h3>
                  <p className="text-slate-600">
                    {demoContent[activeDemo].subtitle}
                  </p>
                </div>

                {activeDemo === 'overview' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-600" />
                          Network Effect
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {demoContent.overview.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Handshake className="w-5 h-5 text-green-600" />
                          Success Stories
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm italic">
                              "Posted Monday, hired Friday. The Gator network is incredible!"
                            </p>
                            <p className="text-xs text-green-700 mt-2">— Sarah M., Class of '23</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm italic">
                              "Helped 15 students land jobs this year. So rewarding!"
                            </p>
                            <p className="text-xs text-blue-700 mt-2">— Dr. Chen, Class of '98</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeDemo === 'confetti' && (
                  <div className="text-center py-12">
                    <Button
                      size="lg"
                      onClick={() => setShowConfetti(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Trigger Celebration
                    </Button>
                    <p className="text-slate-600 mt-4">
                      Every connection feels like a victory with our delightful animations
                    </p>
                  </div>
                )}

                {activeDemo === 'stats' && (
                  <div>
                    <LiveStatsCounter />
                    <p className="text-center text-slate-600 mt-6">
                      Real-time metrics that create FOMO and drive engagement
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-slate-200">
              <Button
                onClick={handleCopyInviteLink}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Demo Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Get Invite-Only Demo Link
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Schedule Full Walkthrough
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Celebration Effect */}
      <ConfettiCelebration
        isVisible={showConfetti}
        connectionData={{
          helperName: "Demo User",
          studentName: "Future Gator"
        }}
        onComplete={() => setShowConfetti(false)}
      />
    </>
  );
}