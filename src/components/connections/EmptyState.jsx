import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, UserPlus, Sparkles } from 'lucide-react';

export default function EmptyState({ onPostRequest, onInviteStudent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 rounded-3xl bg-gradient-to-br from-blue-50 to-orange-50 border-2 border-dashed border-blue-200 mt-8"
    >
      {/* Friendly Gator Illustration */}
      <motion.div
        animate={{ 
          rotate: [-5, 5, -5],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-8xl mb-6"
      >
        🐊
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-slate-800 mb-3 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          No matches here, Gator!
        </h3>
        
        <p className="text-lg text-slate-600 max-w-md mx-auto mb-8">
          Be the first to help a fellow Gator — or invite your student to post their own request.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onPostRequest}
            className="bg-[var(--uf-orange)] hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Heart className="w-5 h-5 mr-2" />
            Post a Request
          </Button>
          
          <Button 
            onClick={onInviteStudent}
            variant="outline"
            className="border-2 border-[var(--uf-blue)] text-[var(--uf-blue)] hover:bg-[var(--uf-blue)] hover:text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite Your Student
          </Button>
        </div>
      </motion.div>
      
      {/* UF Colors accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-8 h-8 bg-[var(--uf-blue)] opacity-10 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-[var(--uf-orange)] opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-8 w-6 h-6 bg-[var(--uf-blue)] opacity-5 rounded-full"></div>
      </div>
    </motion.div>
  );
}