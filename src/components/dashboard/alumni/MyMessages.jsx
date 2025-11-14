import { navigate } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';

export default function MyMessages() {
  const items = [
    { from:"Jill • Marketing", snippet:"Thank you for offering to help…", unread:true, when:"2h" },
    { from:"Alex • CS", snippet:"Could we schedule Friday?", unread:false, when:"1d" },
  ];
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm h-full">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">My Messages</h3>
        <button onClick={() => navigate('Messages')} className="text-sm text-[#0021A5] hover:underline font-medium">Open Inbox</button>
      </div>
      <ul className="divide-y">
        {items.map((m,i)=>(
          <li key={i} className="py-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${m.unread?'bg-[#FA4616]':'bg-gray-300'}`} />
                <span className="font-medium">{m.from}</span>
                <span className="text-xs text-gray-500">{m.when}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-1">{m.snippet}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('Messages')} 
              className="rounded-xl px-3 py-1.5 text-sm"
            >
              Reply
            </Button>
          </li>
        ))}
      </ul>
      {items.length===0 && (
        <div className="text-sm text-gray-500 h-full flex items-center justify-center">No messages yet. Once you offer help, replies appear here.</div>
      )}
    </section>
  );
}