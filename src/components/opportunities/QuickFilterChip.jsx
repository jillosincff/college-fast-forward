
export default function QuickFilterChip({ id, label, icon: Icon, isActive, onToggle }) {
  return (
    <button
        onClick={() => onToggle(id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}
    >
        {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />}
        {label}
    </button>
  );
}