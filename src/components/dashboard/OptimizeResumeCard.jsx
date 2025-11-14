import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import ResumeOptimizerModal from './ResumeOptimizerModal'; // We will create this next

export default function OptimizeResumeCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex-shrink-0 flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Optimize My Resume &amp; LinkedIn
            </h3>
          </div>
          <p className="text-sm text-slate-600 flex-grow mb-6">
            Make your resume shine ✨. Upload your file and let AI polish it — then get a LinkedIn headline + About section drafted for you.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#0021A5] hover:bg-[#FA4616] text-white font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upload &amp; Optimize
          </Button>
        </CardContent>
      </Card>
      
      {isModalOpen && <ResumeOptimizerModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}