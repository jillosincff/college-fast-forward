import { Badge } from '@/components/ui/badge';
import { MessageSquare, UserPlus, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const fmtCompact = (v) => 
  new Intl.NumberFormat('en', { notation: 'compact' }).format(v);

const plural = (n, s) => (n === 1 ? s : `${s}s`);

export default function StatsRow({ 
  messagesCount = 0, 
  introsCount = 0, 
  isBoosted = false, 
  lastActivityAt = null,
  showLastActivity = false,
  variant = 'card', // 'card' or 'modal'
  showZeroAsNew = true
}) {
  const hasEngagement = messagesCount > 0 || introsCount > 0;

  // Accessible description (always full numbers)
  const aria = [
    isBoosted ? 'Boosted' : '',
    `${messagesCount} ${plural(messagesCount, 'message')}`,
    `${introsCount} ${plural(introsCount, 'intro')}`,
  ]
    .filter(s => s && s !== '0 messages' && s !== '0 intros')
    .join(', ');

  // For cards without engagement, show "New" badge
  if (!hasEngagement && showZeroAsNew) {
    return (
      <div className="flex items-center gap-2 mt-3" aria-label="Engagement: New">
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 mr-1" />
          New
        </Badge>
        {isBoosted && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-medium px-2.5 py-1 rounded-full animate-pulse">
            🔥 Boosted
          </Badge>
        )}
      </div>
    );
  }

  // For engaged cards or modal view, show stats
  return (
    <div className="flex flex-col gap-1 mt-3">
      <div 
        className="flex flex-wrap items-center gap-2" 
        aria-label={`Engagement: ${aria || 'No activity yet'}`}
      >
        {isBoosted && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-medium px-2.5 py-1 rounded-full animate-pulse">
            🔥 Boosted
          </Badge>
        )}
        
        {messagesCount > 0 && (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">
            <MessageSquare className="w-3 h-3 mr-1" />
            {fmtCompact(messagesCount)} {plural(messagesCount, 'Message')}
          </Badge>
        )}
        
        {introsCount > 0 && (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-medium px-2.5 py-1 rounded-full">
            <UserPlus className="w-3 h-3 mr-1" />
            {fmtCompact(introsCount)} {plural(introsCount, 'Intro')}
          </Badge>
        )}

        {/* Show encouraging message when no engagement in modal */}
        {!hasEngagement && variant === 'modal' && (
          <div className="text-sm text-slate-500">
            Be the first to help 🎉
          </div>
        )}
      </div>

      {/* Show last activity in modal view */}
      {showLastActivity && lastActivityAt && variant === 'modal' && (
        <div className="text-xs text-slate-500">
          Last activity {formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true })}
        </div>
      )}
    </div>
  );
}