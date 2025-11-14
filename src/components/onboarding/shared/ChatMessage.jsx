import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isBot = message.role === 'bot';

  const formatTime = (date) => {
    if (!date || !(date instanceof Date)) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isBot ? '' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#005496] to-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
          <Bot className="w-5 h-5" />
        </div>
      )}
      <div className={`px-4 py-3 rounded-2xl max-w-md md:max-w-lg ${
        isBot 
          ? 'bg-slate-100 text-slate-800 rounded-bl-md' 
          : 'bg-[#005496] text-white rounded-br-md'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 text-right ${isBot ? 'text-slate-400' : 'text-blue-200'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
       {!isBot && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
          <User className="w-5 h-5"/>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;