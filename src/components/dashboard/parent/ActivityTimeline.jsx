import { Briefcase, MessageSquare, PlusCircle } from 'lucide-react';

export default function ActivityTimeline() {
  const activities = [
    { icon: PlusCircle, text: "Posted 'Data Analyst Intern'", time: "2d ago", color: "text-green-500" },
    { icon: MessageSquare, text: "Replied to Samantha J.", time: "4d ago", color: "text-blue-500" },
    { icon: Briefcase, text: "Offered help for 'Marketing Role'", time: "1w ago", color: "text-purple-500" },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border h-full">
      <h3 className="font-bold text-slate-900 mb-4">Activity Timeline</h3>
      <div className="space-y-4">
        {activities.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">{item.text}</p>
            </div>
            <p className="text-xs text-slate-400">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}