import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, ThumbsUp } from 'lucide-react';

export default function ThankYouModal({ isOpen, onClose, messages }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-lg bg-slate-50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
                <Heart className="w-6 h-6 text-pink-600" />
                Gator Gratitude Wall
              </DialogTitle>
              <DialogDescription>
                Recent success stories and thank yous from the community.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                >
                  <p className="text-sm italic text-slate-700 mb-3">"{msg}"</p>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-500 hover:text-pink-600 hover:bg-pink-50">
                      <Heart className="w-4 h-4" /> {Math.floor(Math.random() * 20) + 2}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <ThumbsUp className="w-4 h-4" /> {Math.floor(Math.random() * 15)}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1 text-slate-500 hover:text-green-600 hover:bg-green-50">
                      <MessageSquare className="w-4 h-4" /> Reply
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            <Button onClick={onClose} variant="outline" className="mt-4 w-full">Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}