import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Swipeable Carousel for Mobile Sidebars
export default function MobileCarousel({ 
  title, 
  children, 
  items = [], 
  renderItem,
  className = "",
  autoScroll = false,
  interval = 4000 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || items.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoScroll, interval, items.length]);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  if (items.length === 0) return null;

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="w-8 h-8 p-0"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="w-8 h-8 p-0"
              aria-label="Next item"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <div key={index} className="w-full flex-shrink-0">
                {renderItem ? renderItem(item, index) : (
                  <div className="p-4 text-center">
                    <p className="text-slate-600">{item.toString()}</p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Pagination Dots */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-6' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mobile Challenge Carousel
export function MobileChallengeCarousel() {
  const challenges = [
    {
      title: "Daily Connector",
      description: "Help 3 students today",
      progress: 2,
      total: 3,
      reward: "50 XP",
      icon: "🎯"
    },
    {
      title: "Referral Master",
      description: "Make 5 referrals this week",
      progress: 3,
      total: 5,
      reward: "Badge + 100 XP",
      icon: "🔗"
    },
    {
      title: "Network Builder",
      description: "Invite 2 new alumni",
      progress: 1,
      total: 2,
      reward: "Special Badge",
      icon: "👥"
    }
  ];

  const renderChallenge = (challenge) => (
    <div className="p-4 text-center">
      <div className="text-3xl mb-2">{challenge.icon}</div>
      <h4 className="font-bold text-slate-900 mb-1">{challenge.title}</h4>
      <p className="text-sm text-slate-600 mb-3">{challenge.description}</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>{challenge.progress}/{challenge.total}</span>
        <span>{challenge.reward}</span>
      </div>
      
      {challenge.progress === challenge.total && (
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
          Claim Reward! 🎉
        </Button>
      )}
    </div>
  );

  return (
    <MobileCarousel
      title="🏆 Daily Challenges"
      items={challenges}
      renderItem={renderChallenge}
      autoScroll={true}
      interval={5000}
    />
  );
}

// Mobile Top Connectors Carousel
export function MobileTopConnectors() {
  const connectors = [
    {
      name: "Sarah M.",
      title: "Tech Recruiter",
      connections: 47,
      badge: "🔥",
      avatar: "https://ui-avatars.com/api/?name=Sarah+M&background=0021A5&color=fff"
    },
    {
      name: "Mike K.",
      title: "Engineering Manager",
      connections: 38,
      badge: "⚡",
      avatar: "https://ui-avatars.com/api/?name=Mike+K&background=FA4616&color=fff"
    },
    {
      name: "Lisa R.",
      title: "Product Director",
      connections: 34,
      badge: "🌟",
      avatar: "https://ui-avatars.com/api/?name=Lisa+R&background=0021A5&color=fff"
    }
  ];

  const renderConnector = (connector) => (
    <div className="p-4 text-center">
      <div className="relative mb-3">
        <img 
          src={connector.avatar} 
          alt={connector.name}
          className="w-14 h-14 rounded-full mx-auto border-3 border-white shadow-lg"
        />
        <div className="absolute -top-1 -right-1 text-lg">
          {connector.badge}
        </div>
      </div>
      <h4 className="font-bold text-slate-900">{connector.name}</h4>
      <p className="text-sm text-slate-600 mb-2">{connector.title}</p>
      <div className="text-xs text-blue-600 font-semibold">
        {connector.connections} connections this month
      </div>
    </div>
  );

  return (
    <MobileCarousel
      title="⭐ Top Connectors"
      items={connectors}
      renderItem={renderConnector}
      autoScroll={true}
      interval={6000}
    />
  );
}

// Mobile Thank You Carousel
export function MobileThankYouCarousel() {
  const thankYous = [
    {
      from: "Jessica L. '24",
      text: "Thank you Maria R. '18 for the incredible interview prep that landed me my dream job at Google! 🎉",
      reactions: 47
    },
    {
      from: "Mike C. '23",
      text: "Grateful to David K. '20 for the intro to Microsoft. It made all the difference! 🚀",
      reactions: 38
    },
    {
      from: "Emily S. '25",
      text: "Sarah W. '21 - your mentorship over the past few months has been life-changing! 🙏",
      reactions: 52
    }
  ];

  const renderThankYou = (thankYou) => (
    <div className="p-4">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
        <p className="text-sm text-slate-700 italic mb-3">
          "{thankYou.text}"
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            — {thankYou.from}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>❤️</span>
            <span>{thankYou.reactions}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MobileCarousel
      title="💙 Thank You Wall"
      items={thankYous}
      renderItem={renderThankYou}
      autoScroll={true}
      interval={7000}
    />
  );
}