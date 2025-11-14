import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation'; // Changed import
import { ArrowRight } from 'lucide-react';

const contentData = {
  student: {
    title: "Welcome to the Gator Network!",
    description: "Find alumni and parents ready to open doors for you. Ask for an intro, get career advice, or land your next big opportunity.",
    cta: {
      text: "Post Your First Request",
      action: () => navigate('Connections', { new: 'true' })
    }
  },
  alumni: {
    title: "Ready to Make an Impact?",
    description: "A simple introduction can change a student's career path. Browse requests and help a fellow Gator today.",
    cta: {
      text: "Browse Student Requests",
      action: () => document.getElementById('request-list')?.scrollIntoView({ behavior: 'smooth' })
    }
  },
  parent: {
    title: "Your Network is Powerful.",
    description: "Help a student land their dream job or internship. Your connections can make all the difference.",
    cta: {
      text: "See How You Can Help",
      action: () => document.getElementById('request-list')?.scrollIntoView({ behavior: 'smooth' })
    }
  }
};

export default function WelcomeBanner() {
  const { user } = useAuth();
  
  // Safely determine user persona with a fallback
  const userPersona = user?.persona || 'student';
  
  // Safely get content, falling back to student content if persona is invalid
  const bannerContent = contentData[userPersona] || contentData.student; 

  if (!bannerContent) {
    // This is an extra safety net and should not be reached
    return null; 
  }

  // Make sure cta and action exist before rendering
  const handleCtaClick = () => {
    if (bannerContent.cta && typeof bannerContent.cta.action === 'function') {
      bannerContent.cta.action();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[var(--uf-blue)] to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{bannerContent.title}</h1>
          <p className="text-lg opacity-90 max-w-3xl">{bannerContent.description}</p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            onClick={handleCtaClick}
            className="bg-white text-[var(--uf-blue)] hover:bg-white/90 font-bold py-3 px-6 rounded-lg text-base shadow-md hover:shadow-lg transition-all"
          >
            {bannerContent.cta.text}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}