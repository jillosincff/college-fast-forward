
export default function OpportunityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-7 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4 flex-1">
          {/* Logo skeleton */}
          <div className="w-[60px] h-[60px] bg-slate-200 rounded-[14px]"></div>
          
          {/* Title & Company skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
            <div className="h-3 bg-slate-200 rounded-lg w-1/3"></div>
          </div>
        </div>
        
        {/* Actions skeleton */}
        <div className="flex flex-col items-end gap-2">
          <div className="w-11 h-11 bg-slate-200 rounded-full"></div>
          <div className="w-16 h-5 bg-slate-200 rounded"></div>
        </div>
      </div>
      
      {/* Metadata skeleton */}
      <div className="mb-[18px] py-4 border-t border-b border-slate-100">
        <div className="flex gap-4 mb-3">
          <div className="h-8 bg-slate-200 rounded-md w-28"></div>
          <div className="h-8 bg-slate-200 rounded-md w-24"></div>
          <div className="h-8 bg-slate-200 rounded-md w-20"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded-[10px] w-40"></div>
      </div>
      
      {/* Tags skeleton */}
      <div className="flex gap-2.5 mb-[18px]">
        <div className="h-7 bg-slate-200 rounded-lg w-28"></div>
        <div className="h-7 bg-slate-200 rounded-lg w-20"></div>
        <div className="h-7 bg-slate-200 rounded-lg w-24"></div>
      </div>
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-[22px]">
        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
      </div>
      
      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-5 border-t-2 border-slate-100">
        <div className="h-6 bg-slate-200 rounded-md w-32"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 rounded-lg w-28"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-28"></div>
        </div>
      </div>
    </div>
  );
}