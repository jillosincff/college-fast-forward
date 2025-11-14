import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  UserPlus, 
  Gift,
  Sparkles
} from 'lucide-react';

export default function MobileActionBar({ onInviteClick, onPostClick }) {
  return (
    <>
      {/* Mobile Sticky Bottom Action Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg"
      >
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <Button 
            onClick={onPostClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Request
          </Button>
          
          <Button 
            onClick={onInviteClick}
            variant="outline"
            className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 font-semibold py-3 rounded-xl"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </motion.div>

      {/* Floating Invite Alumni Button (Desktop) */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 300, damping: 15 }}
        className="fixed bottom-6 right-6 z-50 hidden md:block"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={onInviteClick}
            size="lg"
            className="
              bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 
              text-white font-bold rounded-full shadow-xl hover:shadow-2xl
              px-6 py-4 relative overflow-hidden group
            "
          >
            {/* Sparkle Background Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            <div className="relative flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-5 h-5" />
              </motion.div>
              <span>Invite Alumni</span>
              <Sparkles className="w-4 h-4 group-hover:animate-spin" />
            </div>
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
}