
export default function ActivityTimeline() {
  const acts = [
    { icon:"🤝", title:"Offered help to Priya (Finance)", when:"2h ago" },
    { icon:"📣", title:"Posted internship: Brand Analyst", when:"1d ago" },
    { icon:"🔗", title:"Introduced Diego to Sarah '12", when:"3d ago" },
  ];
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm h-full">
      <h3 className="text-base font-semibold">Activity Timeline</h3>
      <ol className="mt-3 space-y-3">
        {acts.map((a,i)=>(
          <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="text-lg mt-0.5 bg-blue-50 p-1 rounded-full">{a.icon}</span>
            <div>
              <div className="text-sm font-medium">{a.title}</div>
              <div className="text-xs text-gray-500">{a.when}</div>
            </div>
          </li>
        ))}
      </ol>
      <button className="mt-4 w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 transition-colors">View All Activity</button>
    </section>
  );
}