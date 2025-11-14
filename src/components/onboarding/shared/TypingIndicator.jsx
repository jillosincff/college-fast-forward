import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start gap-3"
  >
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005496] to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
      <Bot className="w-5 h-5" />
    </div>
    <div className="px-4 py-3 rounded-2xl bg-slate-100 rounded-bl-md">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      </div>
    </div>
  </motion.div>
);

export default TypingIndicator;