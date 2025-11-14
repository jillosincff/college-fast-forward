import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronDown, Hand, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'U';

const ONLINE_USERS = [
  { 
    id: 1, 
    name: "Maria Rodriguez", 
    avatar: "https://ui-avatars.com/api/?name=Maria+Rodriguez&background=0021A5&color=fff",
    role: "Senior Analyst",
    company: "Goldman Sachs",
    gradYear: "2022"
  },
  { 
    id: 2, 
    name: "David Kim", 
    avatar: "https://ui-avatars.com/api/?name=David+Kim&background=FA4616&color=fff",
    role: "Software Engineer",
    company: "Google",
    gradYear: "2020"
  },
  { 
    id: 3, 
    name: "Jessica Brown", 
    avatar: "https://ui-avatars.com/api/?name=Jessica+Brown&background=0021A5&color=fff",
    role: "Product Manager",
    company: "Meta",
    gradYear: "2021"
  },
  { 
    id: 4, 
    name: "Mike Davis", 
    avatar: "https://ui-avatars.com/api/?name=Mike+Davis&background=FA4616&color=fff",
    role: "Engineering Lead",
    company: "Tesla",
    gradYear: "2019"
  },
];

const MiniProfileModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold">{user.name}</h3>
              <p className="text-sm text-slate-600">Class of '{user.gradYear}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-semibold text-slate-800">{user.role}</p>
            <p className="text-sm text-slate-600">{user.company}</p>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1 bg-[var(--uf-blue)]">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" className="flex-1">
              <Hand className="w-4 h-4 mr-2" />
              Refer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function OnlineNowPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <>
      <motion.div 
        className="fixed top-20 right-6 z-40 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <TooltipProvider>
          <motion.div
            className="p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
            whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Users className="w-5 h-5 text-slate-600" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Online Now</p>
                  <p className="text-xs text-slate-500">{ONLINE_USERS.length} alumni</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </div>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-slate-200"
              >
                <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                  {ONLINE_USERS.map((user) => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          whileHover={{ scale: 1.02 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                        >
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.company}</p>
                          </div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs">{user.role} at {user.company}</p>
                        <p className="text-xs text-slate-400">Click to view profile</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TooltipProvider>
      </motion.div>

      <MiniProfileModal 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </>
  );
}