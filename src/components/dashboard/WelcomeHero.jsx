import { getGreeting } from '@/components/utils/greetingLogic';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';

export default function WelcomeHero({ user }) {
  const { greeting, firstName, isFirstTime } = getGreeting(user);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl border bg-white p-6 md:p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-[#0021A5]/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#FA4616]/10 blur-3xl" />
        </div>

        <div className="relative">
          {isFirstTime && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="inline-flex items-center gap-2 rounded-full bg-orange-100/80 px-3 py-1.5 text-xs font-semibold text-[#FA4616] mb-3"
            >
              <Sparkles className="w-4 h-4" />
              <span>Let's get started!</span>
            </motion.div>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0021A5]">
            {greeting}, <span className="text-[#FA4616]">{firstName}</span>!
          </h1>
          <p className="mt-2 text-base md:text-lg text-slate-600">
            {isFirstTime
              ? "Here's your starting point for connecting with the Gator network."
              : "Ready to make some connections and find opportunities?"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('Connections')}
              className="bg-[#0021A5] hover:bg-[#001a85] text-white rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Browse Network <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('Profile')}
              variant="outline"
              className="rounded-xl"
            >
              View My Profile
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}