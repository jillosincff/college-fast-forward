import { Button } from '@/components/ui/button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  size = 'default'
}) {
  const variants = {
    default: 'text-gray-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400'
  };

  const sizes = {
    sm: { icon: 'w-8 h-8', title: 'text-lg', desc: 'text-sm', container: 'py-8' },
    default: { icon: 'w-12 h-12', title: 'text-xl', desc: 'text-base', container: 'py-12' },
    lg: { icon: 'w-16 h-16', title: 'text-2xl', desc: 'text-lg', container: 'py-16' }
  };

  const sizeConfig = sizes[size];

  return (
    <div className={`text-center ${sizeConfig.container}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className={`${sizeConfig.icon} ${variants[variant]}`} />
        </div>
      )}
      
      <h3 className={`font-semibold text-gray-900 mb-2 ${sizeConfig.title}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`text-gray-600 mb-6 max-w-md mx-auto leading-relaxed ${sizeConfig.desc}`}>
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Pre-configured common empty states
export const NoRequestsFound = ({ onCreateRequest }) => (
  <EmptyState
    icon={() => <div className="text-4xl">🔍</div>}
    title="No requests found"
    description="Try adjusting your filters or be the first to post a request for help."
    actionLabel="Post a Request"
    onAction={onCreateRequest}
  />
);

export const NoOpportunitiesFound = ({ onCreateOpportunity }) => (
  <EmptyState
    icon={() => <div className="text-4xl">💼</div>}
    title="No opportunities found"
    description="Check back soon for new opportunities, or share one from your network."
    actionLabel="Share Opportunity"
    onAction={onCreateOpportunity}
  />
);

export const NoMessagesYet = () => (
  <EmptyState
    icon={() => <div className="text-4xl">💬</div>}
    title="No messages yet"
    description="When someone reaches out to help or connect, their messages will appear here."
    size="sm"
  />
);