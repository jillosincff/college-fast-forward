import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SuggestionsModal from './SuggestionsModal';

export default function NetworkGrowth() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section className="rounded-2xl border bg-white p-5 shadow-sm h-full flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold">Network Growth</h3>
          <div className="mt-3 text-sm text-gray-700">3 new alumni in <span className="font-semibold text-[#0021A5]">Consulting</span> joined this month.</div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {["Sarah '12","Jordan '15","Maya '10"].map(n=>(
              <div key={n} className="rounded-xl border px-3 py-2 text-sm text-center hover:border-[#0021A5] transition-colors">{n}</div>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 You have <span className="font-semibold">2 mutual connections</span> with Jordan '15
          </div>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="mt-4 w-full rounded-xl"
          variant="outline"
        >
          View Suggestions
        </Button>
      </section>
      
      <SuggestionsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}