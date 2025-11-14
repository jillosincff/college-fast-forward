import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

export default function MyOutreach({ offers, loading }) {
  const outreachItems = [
    { to: "Priya S.", for: "Equity Research", status: "Awaiting reply", statusColor: "text-yellow-600" },
    { to: "Alex R.", for: "Brand internships NYC", status: "Scheduled", statusColor: "text-green-600" },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">My Outreach</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('Connections')} className="text-blue-600 hover:text-blue-700">
          Offer Help
        </Button>
      </div>
      <div className="space-y-3">
        {outreachItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
            <div>
              <p className="text-sm font-semibold">{item.to}</p>
              <p className="text-xs text-slate-500 truncate">{item.for}</p>
            </div>
            <span className={`text-xs font-medium ${item.statusColor}`}>{item.status}</span>
          </div>
        ))}
        {outreachItems.length === 0 && (
          <p className="text-sm text-center text-slate-400 py-4">You haven't offered help yet.</p>
        )}
      </div>
    </div>
  );
}