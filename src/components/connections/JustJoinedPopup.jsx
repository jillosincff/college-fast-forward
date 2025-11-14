import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'U';

const JOINED_USERS = [
  { name: "Alex Johnson", role: "Software Engineer at Meta" },
  { name: "Samantha Lee", role: "Marketing Manager at Nike" },
  { name: "Kevin Hart", role: "Financial Analyst at J.P. Morgan" },
];

export default function JustJoinedPopup() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const showRandomPopup = () => {
      const randomUser = JOINED_USERS[Math.floor(Math.random() * JOINED_USERS.length)];
      setUser(randomUser);
      setTimeout(() => setUser(null), 5000); // Hide after 5 seconds
    };
    
    // Show a popup every 15-30 seconds
    const interval = setInterval(showRandomPopup, 15000 + Math.random() * 15000);
    
    // Show one initially after a short delay
    const initialTimeout = setTimeout(showRandomPopup, 8000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {user && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm pointer-events-auto"
          >
            <Avatar>
              <AvatarImage />
              <AvatarFallback className="bg-green-100 text-green-600">
                <UserCheck className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-sm text-slate-800">{user.name} just joined!</p>
              <p className="text-xs text-slate-600">{user.role}</p>
            </div>
            <button onClick={() => setUser(null)} className="ml-auto text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}