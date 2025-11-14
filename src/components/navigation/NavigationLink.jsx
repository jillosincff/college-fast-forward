import { useRouter } from '@/components/router/SimpleRouter';

export default function NavigationLink({ href, label, badgeCount = 0 }) {
  const { navigate, currentPage } = useRouter();
  const isActive = currentPage === href;

  return (
    <button
      onClick={() => navigate(href)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {label}
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {badgeCount}
        </span>
      )}
    </button>
  );
}