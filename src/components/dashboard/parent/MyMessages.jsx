import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';

export default function MyMessages() {
  const messages = [
    { from:"Alex R.", snippet:"Thanks for the info on the internship!", unread:true, when:"2h" },
    { from:"Samantha J.", snippet:"Quick question about the role...", unread:false, when:"1d" },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">My Messages</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('Messages')} className="text-blue-600 hover:text-blue-700">
          View All
        </Button>
      </div>
      <div className="flex-grow space-y-3">
        {messages.map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
            <div className={`w-2 h-2 rounded-full ${m.unread ? 'bg-orange-500' : 'bg-slate-300'} flex-shrink-0`}></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">{m.from}</p>
              <p className="text-xs text-slate-500 truncate">{m.snippet}</p>
            </div>
            <p className="text-xs text-slate-400">{m.when}</p>
          </div>
        ))}
      </div>
    </div>
  );
}