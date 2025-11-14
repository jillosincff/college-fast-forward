import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function EventsMeetups({ onNotify }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border h-full flex flex-col justify-between">
      <div>
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
          <Calendar className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="font-bold text-slate-900">Events & Meetups</h3>
        <p className="text-sm text-slate-500 mt-1">Be the first to know about virtual coffee chats and local chapter events.</p>
      </div>
      <Button onClick={onNotify} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
        Notify Me
      </Button>
    </div>
  );
}