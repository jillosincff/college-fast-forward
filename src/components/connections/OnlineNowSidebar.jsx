
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessagesSquare, Trophy, Crown, Award, Star, Heart, Hand } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'U';

// Custom Badge for gamification
function CustomBadge({ text, variant = "default" }) {
  const variants = {
    default: "bg-gradient-to-r from-orange-200 to-pink-100 text-orange-800",
    fire: "bg-gradient-to-r from-red-400 to-yellow-400 text-white",
    crown: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900",
    blue: "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
  };
  
  return (
    <span className={`text-xs rounded-xl px-2 py-1 font-bold shadow ${variants[variant]}`}>
      {text}
    </span>
  );
}

// Sample data - in a real app this would come from props/API
const ONLINE_ALUMNI = [
  {
    id: 1,
    name: "Sarah Chen",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=0021A5&color=fff",
    title: "Product Manager @ Google",
    isOnline: true
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    avatar: "https://ui-avatars.com/api/?name=Mike+Rodriguez&background=FA4616&color=fff",
    title: "Software Engineer @ Meta",
    isOnline: true
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=0021A5&color=fff",
    title: "Marketing Director @ Nike",
    isOnline: true
  },
  {
    id: 4,
    name: "James Wilson",
    avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=FA4616&color=fff",
    title: "Investment Banker @ Goldman",
    isOnline: true
  }
];

const LEADERBOARD = [
  {
    id: 1,
    name: "Maria Rodriguez",
    avatar: "https://ui-avatars.com/api/?name=Maria+Rodriguez&background=0021A5&color=fff",
    badge: "Super Connector",
    connections: 47,
    rank: 1
  },
  {
    id: 2,
    name: "David Kim",
    avatar: "https://ui-avatars.com/api/?name=David+Kim&background=FA4616&color=fff",
    badge: "Mentor",
    connections: 39,
    rank: 2
  },
  {
    id: 3,
    name: "Jessica Brown",
    avatar: "https://ui-avatars.com/api/?name=Jessica+Brown&background=0021A5&color=fff",
    badge: "Gator Guardian",
    connections: 34,
    rank: 3
  }
];

const THANK_YOU_MESSAGES = [
  "Just got my dream job at Tesla thanks to an amazing Gator connection! 🚗⚡",
  "The mentorship I received helped me pivot my career successfully! 🙏",
  "Three interviews lined up after one introduction - this network is incredible! 🎯",
  "From coding bootcamp to senior engineer role - thank you Gator family! 💻",
  "Got into my top choice MBA program with alum recommendations! 🎓"
];

export default function OnlineNowSidebar() {
  const [currentThankYou, setCurrentThankYou] = useState(0);
  const [hoveredUser, setHoveredUser] = useState(null);
  
  // Rotate thank you messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentThankYou(prev => (prev + 1) % THANK_YOU_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Online Now with Live Avatars */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <div className="relative">
              <Users className="w-5 h-5 text-green-600" />
              <motion.div 
                className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            Online Now
            <Badge className="bg-green-100 text-green-800 text-xs ml-auto">
              {ONLINE_ALUMNI.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ONLINE_ALUMNI.map(alum => (
              <motion.div 
                key={alum.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 relative"
                onMouseEnter={() => setHoveredUser(alum.id)}
                onMouseLeave={() => setHoveredUser(null)}
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-green-200 transition-transform hover:scale-110">
                    <AvatarImage src={alum.avatar} alt={alum.name} />
                    <AvatarFallback className="text-xs bg-slate-200">
                      {getInitials(alum.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Enhanced pulsing online indicator */}
                  <motion.div 
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">
                    {alum.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {alum.title}
                  </div>
                </div>
                
                {/* Enhanced hover interactions */}
                <AnimatePresence>
                  {hoveredUser === alum.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-1"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        title={`Wave to ${alum.name}! 👋`}
                      >
                        <Hand className="w-3 h-3 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-green-100"
                        title={`Message ${alum.name}`}
                      >
                        <MessagesSquare className="w-3 h-3 text-green-600" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Connectors Leaderboard */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Connectors
            <Badge className="bg-yellow-100 text-yellow-800 text-xs ml-auto">
              This Week
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEADERBOARD.map((user, index) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-2 items-center"
              >
                <div className="flex items-center justify-center w-6 h-6">
                  {index === 0 && <Crown className="w-5 h-5 text-yellow-500" />}
                  {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                  {index === 2 && <Star className="w-5 h-5 text-orange-600" />}
                  {index > 2 && (
                    <span className="font-bold text-orange-600 text-sm">#{index + 1}</span>
                  )}
                </div>
                
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs bg-slate-200">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.connections} connections
                  </div>
                </div>
                
                <CustomBadge 
                  text={user.badge} 
                  variant={index === 0 ? "crown" : index === 1 ? "blue" : "default"}
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Thank You Wall */}
      <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-orange-800">
            <Heart className="w-5 h-5 text-pink-600" />
            Thank You Wall
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-16 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentThankYou}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center"
              >
                <p className="text-xs italic text-orange-700 leading-relaxed">
                  {THANK_YOU_MESSAGES[currentThankYou]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
