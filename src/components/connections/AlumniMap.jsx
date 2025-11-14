
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// Mock real-time alumni data
const ALUMNI_HOTSPOTS = [
  { city: 'NYC', count: 47, coords: { x: 75, y: 35 }, color: 'bg-blue-500', pulse: true },
  { city: 'Miami', count: 23, coords: { x: 70, y: 75 }, color: 'bg-orange-500', pulse: false },
  { city: 'SF', count: 31, coords: { x: 15, y: 40 }, color: 'bg-purple-500', pulse: true },
  { city: 'Austin', count: 18, coords: { x: 45, y: 65 }, color: 'bg-green-500', pulse: false },
  { city: 'Atlanta', count: 29, coords: { x: 65, y: 60 }, color: 'bg-red-500', pulse: true },
  { city: 'Chicago', count: 25, coords: { x: 55, y: 35 }, color: 'bg-indigo-500', pulse: false },
  { city: 'Remote', count: 89, coords: { x: 50, y: 15 }, color: 'bg-yellow-500', pulse: true, isRemote: true }
];

const PulsingDot = ({ hotspot, onClick, isHovered, onMouseEnter, onMouseLeave }) => (
  <motion.div
    className="absolute cursor-pointer"
    style={{ 
      left: `${hotspot.coords.x}%`, 
      top: `${hotspot.coords.y}%`,
      transform: 'translate(-50%, -50%)'
    }}
    whileHover={{ scale: 1.2 }}
    onClick={() => onClick(hotspot)}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {/* Pulse rings */}
    <AnimatePresence>
      {hotspot.pulse && (
        <>
          <motion.div
            className={`absolute inset-0 rounded-full ${hotspot.color} opacity-20`}
            animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className={`absolute inset-0 rounded-full ${hotspot.color} opacity-20`}
            animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
          />
        </>
      )}
    </AnimatePresence>
    
    {/* Main dot */}
    <motion.div
      className={`w-4 h-4 rounded-full ${hotspot.color} border-2 border-white shadow-lg relative z-10`}
      animate={hotspot.pulse ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    
    {/* Count badge */}
    <motion.div
      className="absolute -top-2 -right-2 bg-white text-slate-800 rounded-full text-xs font-bold px-1.5 py-0.5 shadow-lg border border-slate-200 min-w-[20px] text-center"
      initial={{ scale: 0 }}
      animate={{ scale: isHovered ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {hotspot.count}
    </motion.div>
    
    {/* City label on hover */}
    <AnimatePresence>
      {isHovered && (
        <motion.div
          className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-lg"
          initial={{ opacity: 0, y: -10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {hotspot.city}
          {hotspot.isRemote && (
            <span className="ml-1">
              <Globe className="w-3 h-3 inline" />
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const LiveActivityIndicator = () => (
  <motion.div
    className="flex items-center gap-2 text-xs text-green-600 font-medium"
    animate={{ opacity: [1, 0.7, 1] }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <motion.div
      className="w-2 h-2 bg-green-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    Live Activity
  </motion.div>
);

// New "Live Now" Avatar Component
const LiveAvatar = ({ user, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', stiffness: 300, delay }}
    className="relative"
  >
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800 shadow-md">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.name} is online</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
  </motion.div>
);

export default function AlumniMap() {
  const [hoveredHotspot, setHoveredHotspot] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [totalOnline, setTotalOnline] = useState(0);
  const [liveUsers, setLiveUsers] = useState([]);

  useEffect(() => {
    // Calculate total online alumni
    const total = ALUMNI_HOTSPOTS.reduce((sum, hotspot) => sum + hotspot.count, 0);
    setTotalOnline(total);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTotalOnline(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 15000);
    
    // Simulate live users coming online
    const mockLiveUsers = [
      { name: 'Maria R.', avatar: 'https://i.pravatar.cc/150?u=maria' },
      { name: 'David K.', avatar: 'https://i.pravatar.cc/150?u=david' },
      { name: 'Sarah W.', avatar: 'https://i.pravatar.cc/150?u=sarah' },
    ];
    setLiveUsers(mockLiveUsers);

    return () => clearInterval(interval);
  }, []);

  const handleHotspotClick = (hotspot) => {
    setSelectedHotspot(hotspot);
    // Could trigger a modal or filter by location
    console.log(`Viewing alumni in ${hotspot.city}: ${hotspot.count} online`);
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Globe className="w-5 h-5 text-blue-500" />
            Alumni Network
          </CardTitle>
          <LiveActivityIndicator />
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{totalOnline}</span> online now
          </div>
          {/* Live Avatars Section */}
          <div className="flex -space-x-2">
            {liveUsers.map((user, index) => (
              <LiveAvatar key={user.name} user={user} delay={index * 0.2} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Simplified US Map */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 h-48 overflow-hidden">
          {/* US Map SVG Background */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 60"
            fill="none"
          >
            {/* Simplified US outline */}
            <path
              d="M10 40 L15 35 L25 30 L35 25 L45 20 L60 25 L75 30 L85 35 L90 40 L85 50 L75 55 L60 50 L45 55 L35 50 L25 45 L15 50 Z"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="currentColor"
              className="text-slate-300"
            />
          </svg>
          
          {/* Hotspot dots */}
          {ALUMNI_HOTSPOTS.map((hotspot) => (
            <PulsingDot
              key={hotspot.city}
              hotspot={hotspot}
              onClick={handleHotspotClick}
              isHovered={hoveredHotspot === hotspot.city}
              onMouseEnter={() => setHoveredHotspot(hotspot.city)}
              onMouseLeave={() => setHoveredHotspot(null)}
            />
          ))}
          
          {/* Connection lines (subtle) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
            {ALUMNI_HOTSPOTS.filter(h => !h.isRemote).map((hotspot, index) => (
              <motion.line
                key={`line-${index}`}
                x1={`${hotspot.coords.x}%`}
                y1={`${hotspot.coords.y}%`}
                x2={`${ALUMNI_HOTSPOTS[(index + 1) % ALUMNI_HOTSPOTS.length].coords.x}%`}
                y2={`${ALUMNI_HOTSPOTS[(index + 1) % ALUMNI_HOTSPOTS.length].coords.y}%`}
                stroke="currentColor"
                strokeWidth="1"
                className="text-blue-400"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.2 }}
              />
            ))}
          </svg>
        </div>
        
        {/* Quick stats with dark mode support */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
              {ALUMNI_HOTSPOTS.filter(h => h.pulse).length}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Active hubs</div>
          </div>
          <div>
            <div className="font-bold text-lg text-green-600 dark:text-green-400">
              {ALUMNI_HOTSPOTS.find(h => h.isRemote)?.count || 0}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Remote</div>
          </div>
          <div>
            <div className="font-bold text-lg text-orange-600 dark:text-orange-400">
              {Math.floor(totalOnline / 7)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Countries</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
