
export function ProofStrip() {
  const checkMark = <span className="text-[var(--gator-green)]">✔</span>;
  return (
    <ul className="mt-5 flex flex-wrap justify-center text-center gap-x-6 gap-y-2 text-sm text-slate-700">
      <li className="flex items-center gap-2">{checkMark} <span className="font-semibold">12,847+</span> Gators ready to help</li>
      <li className="flex items-center gap-2">{checkMark} <span className="font-semibold">847+</span> warm connections sparked</li>
      <li className="flex items-center gap-2">{checkMark} <span className="font-semibold">94%</span> jobs via the network</li>
    </ul>
  );
}