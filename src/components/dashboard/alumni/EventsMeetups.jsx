import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import EventNotificationModal from './EventNotificationModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';

const mockEvents = [
  { id: 1, title: 'Tampa Alumni Mixer', date: 'Sept 15', type: 'mixer', location: 'Tampa, FL', rsvps: 23 },
  { id: 2, title: 'Virtual Coffee Chat', date: 'Sept 22', type: 'coffee_chat', location: 'Virtual', rsvps: 8 },
  { id: 3, title: 'Orlando Career Fair', date: 'Oct 5', type: 'career_fair', location: 'Orlando, FL', rsvps: 41 },
  { id: 4, title: 'Miami Tech Meetup', date: 'Oct 12', type: 'industry_meetup', location: 'Miami, FL', rsvps: 18 },
  { id: 5, title: 'Gainesville Homecoming Tailgate', date: 'Oct 28', type: 'mixer', location: 'Gainesville, FL', rsvps: 112 },
];

const eventIcons = {
  mixer: '🍻',
  coffee_chat: '☕',
  career_fair: '🏢',
  industry_meetup: '🎯'
};

const EventCard = ({ event }) => {
  const [rsvpd, setRsvpd] = useState(false);
  
  return (
    <div className="flex-shrink-0 w-64 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="text-4xl">{eventIcons[event.type]}</div>
        <div className="text-right">
          <div className="font-bold text-slate-800">{event.date}</div>
          <div className="text-xs text-slate-500">{event.location}</div>
        </div>
      </div>
      <h4 className="font-bold text-slate-900 mb-4 h-10">{event.title}</h4>
      <Button
        onClick={() => setRsvpd(!rsvpd)}
        variant={rsvpd ? 'secondary' : 'default'}
        className="w-full bg-[var(--uf-blue)] hover:bg-[var(--uf-dark-blue)] text-white"
      >
        {rsvpd ? <><CheckCircle className="w-4 h-4 mr-2"/> Going</> : `RSVP (${event.rsvps})`}
      </Button>
    </div>
  );
};

export default function EventsMeetups() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const hasOptedIn = user?.notification_preferences && Object.values(user.notification_preferences).some(v => v === true);

  return (
    <Card className="shadow-sm w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 text-purple-600 flex items-center justify-center rounded-lg">
              <Calendar />
            </span>
            Upcoming Events & Meetups
          </h3>
          <Button onClick={() => {}} variant="ghost" className="text-sm text-[#0021A5] hover:underline font-medium">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
          {mockEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
           <div className="flex-shrink-0 w-64 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center text-center">
            <h4 className="font-bold text-slate-800 mb-2">Get Notified</h4>
            <p className="text-sm text-slate-600 mb-4">Never miss an event in your area or industry.</p>
            {hasOptedIn ? (
              <button onClick={() => setShowModal(true)} className="w-full rounded-xl border border-green-200 bg-green-100 px-3 py-2 text-sm font-semibold text-green-800 flex items-center justify-center gap-2 hover:bg-green-200 transition-colors">
                <CheckCircle className="h-4 w-4" /> Prefs Set
              </button>
            ) : (
              <Button onClick={() => setShowModal(true)} className="w-full" variant="outline">
                Set Prefs
              </Button>
            )}
           </div>
        </div>
      </CardContent>
      {showModal && (
        <EventNotificationModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </Card>
  );
}