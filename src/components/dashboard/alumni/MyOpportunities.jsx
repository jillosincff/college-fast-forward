import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';

export default function MyOpportunities() {
  const posts = [
    { title:"Brand Analyst Intern – Summer", status:"Live", views:124, posted:"3 days ago", expires:"30 days" },
    { title:"Coffee Chat: Intro to Consulting", status:"Draft", views:0, posted:"1 day ago", expires:"Never" },
  ];
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm h-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">My Opportunities</h3>
        <Button 
          onClick={() => navigate('PostOpportunity')} 
          className="rounded-xl bg-[#FA4616] px-3 py-2 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Share an Opportunity
        </Button>
      </div>
      <ul className="divide-y">
        {posts.map((p,i)=>(
          <li key={i} className="py-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>Views: {p.views}</span>
                <span>•</span>
                <span>Posted {p.posted}</span>
                {p.expires !== "Never" && (
                  <>
                    <span>•</span>
                    <span>Expires in {p.expires}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.status==='Live' ? 'bg-blue-50 text-[#0021A5]' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
              <Button variant="outline" size="sm" className="rounded-xl px-3 py-1.5 text-sm">Edit</Button>
              <Button variant="outline" size="sm" className="rounded-xl px-3 py-1.5 text-sm">Close</Button>
            </div>
          </li>
        ))}
      </ul>
      {posts.length===0 && (
        <div className="text-sm text-gray-500 h-full flex items-center justify-center">No posts yet. Share your first opportunity to help Gators.</div>
      )}
    </section>
  );
}