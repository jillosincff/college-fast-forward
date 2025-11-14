import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

const mockOpps = [
    // { title: "Brand Analyst Intern", status: "live", views: 124 },
    // { title: "Coffee Chat (Consulting)", status: "draft", views: 0 },
];

function EmptyOpportunities({ onPostOpp }) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-orange-50 grid place-items-center text-xl">📣</div>
      <h3 className="text-base font-semibold">Share your first opportunity</h3>
      <p className="mt-1 text-sm text-gray-600">
        Post a job, internship, coffee chat, or shadow day—whatever opens doors for Gators.
      </p>
      <div className="mt-4">
        <button onClick={onPostOpp} className="rounded-xl bg-[#FA4616] px-3 py-2 text-sm text-white hover:opacity-90 transition-opacity">
          Post an Opportunity
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">You can edit or close it anytime from your dashboard.</p>
    </div>
  );
}

export default function MyPostedOpportunitiesList() {
    const opportunities = mockOpps; // Replace with real data

    const handlePostOpportunity = () => {
      navigate('PostOpportunity');
    };

    if (opportunities.length === 0) {
      return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Your Opportunities</h3>
          <EmptyOpportunities onPostOpp={handlePostOpportunity} />
        </div>
      );
    }

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Your Opportunities</h3>
            <div className="space-y-3">
            {opportunities.map((opp, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                        <p className="font-semibold text-sm">{opp.title}</p>
                        <p className="text-xs text-slate-500">Status: {opp.status} • Views: {opp.views}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Close</Button>
                    </div>
                </div>
            ))}
            </div>
        </div>
    );
}