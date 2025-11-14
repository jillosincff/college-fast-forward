import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, MessageSquare } from 'lucide-react';

const mockOutreachData = [
  { 
    name: "Priya S.", 
    role: "Equity Research", 
    status: "Awaiting reply", 
    contextualResponseRate: 85, 
    contextualAvgResponseTime: 2.3 
  },
  { 
    name: "Alex R.", 
    role: "Brand Internships NYC", 
    status: "Scheduled", 
    success: "Meeting scheduled", 
    responseTime: 1.2 
  },
];

const ResponseRateIndicator = ({ rate }) => {
  let colorClass = 'text-red-500';
  if (rate > 70) colorClass = 'text-green-500';
  else if (rate >= 50) colorClass = 'text-yellow-500';

  return <span className={`font-bold ${colorClass}`}>{rate}%</span>;
};

export default function MyOutreach() {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
              <MessageSquare />
            </span>
            My Outreach
          </CardTitle>
          <Button onClick={() => navigate('Connections')} variant="ghost" className="text-sm text-[#0021A5] hover:underline font-medium">Browse Requests</Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mb-6 p-4 bg-slate-50 rounded-lg">
          <div>
            <div className="text-xs text-slate-500">Response Rate</div>
            <div className="text-lg font-bold text-slate-800 flex items-center justify-center gap-1">
              78% <ArrowUp className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Avg. Response</div>
            <div className="text-lg font-bold text-slate-800">1.8 days</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Success Rate</div>
            <div className="text-lg font-bold text-slate-800">45%</div>
          </div>
        </div>

        {/* Outreach List */}
        <ul className="divide-y divide-slate-100">
          {mockOutreachData.map((r, i) => (
            <li key={i} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.status === 'Scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span>
                  <Button variant="outline" size="sm" className="rounded-xl px-3 py-1.5 text-sm h-auto">Open</Button>
                </div>
              </div>
              {/* Success Metrics */}
              <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                {r.status === 'Awaiting reply' ? (
                  <div className="flex items-center justify-between">
                    <span>Similar Response Rate: <ResponseRateIndicator rate={r.contextualResponseRate} /></span>
                    <span>Avg. Response Time: {r.contextualAvgResponseTime} days</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="font-semibold">Success:</span> {r.success} | <span className="font-semibold">Response Time:</span> {r.responseTime} days
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        {mockOutreachData.length === 0 && (
          <div className="text-sm text-gray-500 h-full flex items-center justify-center py-8">You haven't offered help yet. Start by browsing requests.</div>
        )}
      </CardContent>
    </Card>
  );
}