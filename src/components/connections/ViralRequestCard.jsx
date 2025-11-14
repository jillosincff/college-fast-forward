
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/brand/Card';
import { Tag } from '@/components/brand/Tag';

const roleStyles = {
  student: { icon: '🎓', name: 'Student' },
  parent: { icon: '👨‍👩‍👧', name: 'Parent' },
  alumni: { icon: '🐊', name: 'Alumni' },
};

const CardBadges = ({ request }) => {
  const badges = [];
  const now = new Date();
  
  if (request.is_featured) {
    badges.push({ tone: 'featured', label: '✨ Featured' });
  }
  
  const isTrending = (request.offers_count || 0) + (request.intros_count || 0) >= 10;
  if (isTrending) {
    badges.push({ tone: 'active', label: '🔥 Trending' });
  }

  const isNew = (now - new Date(request.created_date)) < 7 * 24 * 60 * 60 * 1000;
  if (isNew && badges.length < 2) {
    badges.push({ tone: 'new', label: '🆕 New' });
  }

  if (badges.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
      {badges.map(badge => <Tag key={badge.label} tone={badge.tone}>{badge.label}</Tag>)}
    </div>
  );
};

export default function ViralRequestCard({ request, onOpenModal, onOfferHelp, onMakeIntro, isAlternate }) {
  const poster = request.poster || {};
  const posterRoleStyle = roleStyles[poster.persona] || roleStyles.student;
  
  return (
    <Card className={`p-5 transition-all hover:shadow-lift hover:-translate-y-1 ${isAlternate ? 'bg-surface-subtle' : ''}`}>
      <CardBadges request={request} />

      <div className="flex items-center gap-4 mb-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={poster.profile_image_url} />
          <AvatarFallback>{poster.full_name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-ink">{poster.full_name || 'A Gator'}</p>
          <div className="flex items-center gap-2 text-sm text-ink-60">
            <span>{posterRoleStyle.icon} {posterRoleStyle.name}</span>
            {poster.graduation_year && <span>'{String(poster.graduation_year).slice(-2)}</span>}
          </div>
        </div>
      </div>
      
      <h3 className="h3 text-lg mb-2 truncate">{request.role}</h3>
      <p className="text-sm text-ink-60 line-clamp-2 mb-4">{request.description}</p>
      
      <div className="border-t border-surface-subtle pt-4">
        <div className="flex items-center justify-between text-xs text-ink-40 mb-4">
          <span>🔁 {request.intros_count || 0} intros</span>
          <span>🤝 {request.offers_count || 0} offers</span>
          <span>👀 {request.views_count || 0} views</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onOfferHelp(request.id)}
            className="w-full inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Step Up 🐊
          </button>
          <button
            onClick={() => onMakeIntro(request.id)}
            className="w-full inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-orange-600 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            Intro ✉️
          </button>
        </div>
      </div>
    </Card>
  );
}
