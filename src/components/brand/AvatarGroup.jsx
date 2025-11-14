import ImageWithFallback from '@/components/common/ImageWithFallback';

export function AvatarGroup({ srcs = [] }) {
  return (
    <div className="flex -space-x-2" aria-hidden="true">
      {srcs.slice(0, 4).map((s, i) => (
        <ImageWithFallback 
          key={i} 
          src={s} 
          alt="" 
          aria-hidden="true"
          className="h-5 w-5 rounded-full ring-2 ring-white" 
        />
      ))}
    </div>
  );
}