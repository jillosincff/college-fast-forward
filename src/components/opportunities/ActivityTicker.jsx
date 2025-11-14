import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mockActions = [
  { user: { name: "Sarah ('25)", role: 'student' }, action: 'applied for', target: 'Marketing Internship' },
  { user: { name: "UF Parent of '26", role: 'parent' }, action: 'posted', target: 'a new Software Engineer role' },
  { user: { name: "David ('19)", role: 'alumni' }, action: 'made an intro for', target: 'a Data Analyst Request' },
  { user: { name: "Mike ('24)", role: 'student' }, action: 'asked about', target: 'the Junior Frontend Developer role' },
  { user: { name: "Jessica ('15)", role: 'alumni' }, action: 'posted', target: 'a Product Management Shadowing opportunity' },
];

const roleIcons = {
  student: '🎓',
  parent: '👨‍👩‍👧',
  alumni: '🐊',
};

export default function ActivityTicker({ actions = mockActions }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (actions.length === 0) return;
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % actions.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [actions]);

  if (actions.length === 0) return null;

  const currentAction = actions[index];
  const Icon = roleIcons[currentAction.role] || '⭐';

  return (
    <div className="relative h-6 overflow-hidden text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="text-sm text-slate-700">
            <span className="mr-2">{Icon}</span>
            <span className="font-semibold text-slate-800">{currentAction.user.name}</span>
            <span className="mx-1">just {currentAction.action}</span>
            <span className="font-semibold text-blue-600 truncate max-w-[200px] inline-block align-bottom">{currentAction.target}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}