import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, FileText, Edit3, ArrowRight } from 'lucide-react';

const ActionButtons = ({ onSelect }) => {
  const options = [
    { 
      id: 'linkedin', 
      text: 'Use LinkedIn Profile', 
      icon: Linkedin,
      description: 'Quick & easy - just paste your LinkedIn URL',
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    },
    { 
      id: 'resume', 
      text: 'Upload Resume', 
      icon: FileText,
      description: 'Upload your PDF resume to extract info',
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white'
    },
    { 
      id: 'manual', 
      text: 'Enter Manually', 
      icon: Edit3,
      description: 'Fill out a quick form with your details',
      color: 'bg-slate-600 hover:bg-slate-700',
      textColor: 'text-white'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Choose Your Setup Method</h3>
        <p className="text-sm text-slate-600">Pick whichever option works best for you:</p>
      </div>
      
      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
          >
            <Card className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => onSelect(option.id, option.text)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center`}>
                      <option.icon className={`w-6 h-6 ${option.textColor}`} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-900 text-base">{option.text}</h4>
                      <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500">
          Don't worry - you can always update your information later in your profile settings.
        </p>
      </div>
    </motion.div>
  );
};

export default ActionButtons;