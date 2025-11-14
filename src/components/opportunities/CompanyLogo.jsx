import { cn } from '@/lib/utils';

const getInitials = (name) => {
  if (!name || !name.trim()) return '??';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
};

const getGradientClass = (name) => {
  const str = name || 'default';
  const hash = str.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const gradients = [
    'from-blue-100 to-purple-100 text-blue-700',
    'from-green-100 to-teal-100 text-green-700',
    'from-orange-100 to-red-100 text-orange-700',
    'from-purple-100 to-pink-100 text-purple-700',
    'from-indigo-100 to-blue-100 text-indigo-700',
  ];
  
  return gradients[Math.abs(hash) % gradients.length];
};

export default function CompanyLogo({ name, className = "w-12 h-12" }) {
  const initials = getInitials(name);
  const gradientClass = getGradientClass(name);

  return (
    <div 
      className={cn(
        "rounded-lg flex-shrink-0 flex items-center justify-center font-bold bg-gradient-to-br",
        gradientClass,
        className
      )}
    >
      <span className="text-base tracking-tighter">{initials}</span>
    </div>
  );
}