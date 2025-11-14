
import { Button } from '@/components/ui/button';

export default function RequestsPanel({ requests = [], onFilter, onOfferHelp, onBrowseAll }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800">Requests Near You / In Your Industry</h3>
        <div className="flex gap-2 flex-wrap">
          {["All", "Marketing", "Finance", "Tech", "Healthcare"].map(tag => (
            <Button key={tag} onClick={() => onFilter(tag)} variant="outline" size="sm" className="rounded-full text-xs">
              {tag}
            </Button>
          ))}
        </div>
      </div>
      <ul className="mt-4 divide-y">
        {requests && requests.length > 0 ? requests.slice(0, 4).map((r, i) => (
          <li key={r.id || i} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="font-medium text-slate-800">{r.role}</div>
              <div className="text-xs text-gray-500 mt-1">{r.created_by.split('@')[0]} • {r.target_industry} • {r.location_preference}</div>
            </div>
            <Button onClick={() => onOfferHelp(r)} size="sm" className="rounded-xl bg-[#0021A5] text-white hover:opacity-90 w-full sm:w-auto mt-2 sm:mt-0">
                Offer Help
            </Button>
          </li>
        )) : (
            <div className="text-center py-8 text-sm text-slate-500">
                No matching requests right now.
            </div>
        )}
      </ul>
      <Button variant="link" onClick={onBrowseAll} className="mt-3 text-sm text-[#0021A5] hover:underline p-0 h-auto">
        Browse All Requests
      </Button>
    </section>
  );
}
