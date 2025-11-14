import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, Users, MessageSquare } from 'lucide-react';

const ImpactDetailsModal = ({ isOpen, onClose, stats }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#0021A5]" />
          Your Impact Timeline
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {/* Monthly progress chart */}
        <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-4 rounded-xl">
          <h4 className="font-semibold mb-3">This Semester's Progress</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Students Helped</span>
              <span className="font-bold text-[#0021A5]">{stats.helped}/20 goal</span>
            </div>
            <div className="w-full bg-white rounded-full h-2">
              <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] h-2 rounded-full" style={{width: `${(stats.helped/20)*100}%`}}></div>
            </div>
          </div>
        </div>
        
        {/* Recent activity */}
        <div>
          <h4 className="font-semibold mb-3">Recent Impact</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm">Helped Jessica M. connect with Disney recruiter</span>
              <span className="text-xs text-green-600 ml-auto">2 days ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Sent warm intro for Marketing internship</span>
              <span className="text-xs text-blue-600 ml-auto">5 days ago</span>
            </div>
          </div>
        </div>
        
        {/* Testimonial */}
        <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-[#FA4616]">
          <p className="text-sm italic text-slate-700 mb-2">
            "Thanks to Sarah '08, I landed my first interview at Deloitte!"
          </p>
          <p className="text-xs text-slate-500">— Marcus R. '25</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default function ImpactCard({ stats }) {
  const [showModal, setShowModal] = useState(false);
  const progressPercentage = Math.min((stats.helped / 20) * 100, 100);

  return (
    <>
      <div className="rounded-2xl border bg-white p-5 shadow-sm h-full flex flex-col relative overflow-hidden">
        {/* Gamification ribbon */}
        <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white border-0 rounded-bl-lg rounded-tr-2xl px-2 py-1 text-xs font-bold">
          🏅 Top 10%
        </Badge>
        
        <h3 className="text-base font-semibold text-slate-800">Your Impact</h3>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center flex-grow">
          <div className="relative">
            {/* Progress ring effect */}
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#0021A5"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${progressPercentage * 1.76} 176`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{stats.helped}</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 font-medium">Students Helped</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{stats.intros}</div>
            <div className="text-xs text-gray-600 font-medium">Intros Sent</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{stats.shared}</div>
            <div className="text-xs text-gray-600 font-medium">Opportunities</div>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 w-full rounded-xl border-slate-200 hover:bg-slate-50"
          onClick={() => setShowModal(true)}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Impact Timeline
        </Button>
      </div>
      
      <ImpactDetailsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        stats={stats}
      />
    </>
  );
}