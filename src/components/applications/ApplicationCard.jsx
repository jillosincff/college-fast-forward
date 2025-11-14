import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, formatDistanceToNow } from 'date-fns';
import { trackEvent } from '@/components/utils/analytics';
import { Bell, BellOff } from 'lucide-react';
import { Reminder } from '@/entities/Reminder';
import { useToast } from '@/components/ui/use-toast';

const getInitials = (name) => {
  if (!name) return 'UF';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const statusColors = {
  applied: 'bg-slate-100 text-slate-700',
  in_review: 'bg-indigo-100 text-indigo-700',
  replied: 'bg-sky-100 text-sky-700',
  interview: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-rose-100 text-rose-700',
};

const StatusPill = ({ status }) => {
  const statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || statusColors.applied}`}>
      {statusText}
    </span>
  );
};

const labelForMethod = (method) => {
  switch (method) {
    case 'external': return 'External';
    case 'email': return 'Email';
    case 'message': return 'In-App';
    default: return 'Applied';
  }
};

export default function ApplicationCard({ row }) {
  const { application, opportunity, reminder: initialReminder } = row;
  const [reminder, setReminder] = useState(initialReminder);
  const { toast } = useToast();

  if (!opportunity) return null;

  const { title, company, poster_name, poster_avatar_url, location_type, city, state, apply_method, apply_url, apply_email } = opportunity;
  const { id: appId, status, created_date } = application;
  const avatarSrc = company?.logo_url || poster_avatar_url;
  const avatarFallback = company?.name ? company.name.substring(0, 2).toUpperCase() : getInitials(poster_name);
  const locationLabel = location_type === 'remote' ? 'Remote' : `${city || ''}, ${state || ''}`.trim().replace(/^,|,$/g, '');

  const handleReopenLink = () => {
    trackEvent('apps_reopen_link', { oppId: opportunity.id });
    window.open(apply_url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailAgain = () => {
    trackEvent('apps_email_again', { oppId: opportunity.id });
    const subject = `Application: ${title}`;
    window.location.href = `mailto:${apply_email}?subject=${encodeURIComponent(subject)}`;
  };
  
  const handleViewApplication = () => {
    trackEvent('apps_view_thread', { oppId: opportunity.id });
    // This should navigate to the message thread. For now, it's a placeholder.
    window.location.hash = `#Messages?oppId=${opportunity.id}`;
  };

  const handleCancelReminder = async () => {
    if (!reminder) return;
    try {
      // Assuming Reminder.update is an async function that updates the reminder in the backend
      // and sets a 'canceled_at' timestamp.
      await Reminder.update(reminder.id, { canceled_at: new Date().toISOString() });
      setReminder(null); // Clear the reminder from local state
      toast({ title: "Reminder canceled." });
    } catch (error) {
      console.error("Failed to cancel reminder:", error);
      toast({ title: "Failed to cancel reminder.", variant: "destructive" });
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 rounded-lg ring-1 ring-slate-100">
          <AvatarImage src={avatarSrc} alt={company?.name || poster_name} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <a href={`#Opportunities?id=${opportunity.id}`} className="font-semibold text-slate-900 line-clamp-1 hover:underline">{title}</a>
            <StatusPill status={status} />
          </div>
          <p className="text-sm text-slate-600 line-clamp-1">
            {company?.name || poster_name} • {locationLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span>Applied via {labelForMethod(apply_method)}</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>{format(new Date(created_date), 'PP')}</span>
            {reminder && (
              <>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <Bell className="w-3 h-3" />
                  Follow-up in {formatDistanceToNow(new Date(reminder.remind_at), { addSuffix: true })}
                </span>
              </>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => window.location.hash = `#Opportunities?id=${opportunity.id}`}>View Opportunity</Button>
            {apply_method === 'message' && (
              <Button size="sm" variant="outline" onClick={handleViewApplication}>View Application</Button>
            )}
            {apply_method === 'external' && (
              <Button size="sm" variant="secondary" onClick={handleReopenLink}>Reopen Link</Button>
            )}
            {apply_method === 'email' && (
              <Button size="sm" variant="secondary" onClick={handleEmailAgain}>Email Again</Button>
            )}
            {reminder && (
              <Button size="sm" variant="ghost" onClick={handleCancelReminder} className="text-slate-500 hover:text-slate-800">
                <BellOff className="w-4 h-4 mr-1" />
                Cancel Reminder
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}