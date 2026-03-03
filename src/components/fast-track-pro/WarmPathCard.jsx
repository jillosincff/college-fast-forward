import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Users, Building2, MessageSquare, Handshake, Compass, ExternalLink } from 'lucide-react';
import titleCase from '@/components/utils/titleCase';
import { navigate } from '@/components/utils/navigation';

function Section({ icon: Icon, title, subtitle, color, defaultOpen, children, count }) {
  const [open, setOpen] = useState(defaultOpen || false);
  if (!children) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        style={{ minHeight: 'auto' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {count > 0 && <Badge className="bg-orange-100 text-orange-700 text-[10px] border-0 mr-1">{count}</Badge>}
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function AlumniRow({ person, connectionNote }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700 font-bold text-[10px] flex-shrink-0">
        {person.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-900">{person.name}</p>
        <p className="text-[11px] text-slate-500">{person.role_title} at {titleCase(person.company || '')}</p>
        {person.degree_info && <p className="text-[10px] text-purple-600 mt-0.5">🐊 {person.degree_info}</p>}
        {connectionNote && <p className="text-[11px] text-slate-600 mt-1 italic">{connectionNote}</p>}
      </div>
      {person.match_score && (
        <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0 flex-shrink-0">{person.match_score}%</Badge>
      )}
    </div>
  );
}

function CFFContactRow({ person, onMessage }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-[10px] flex-shrink-0">
        {person.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-900">{person.name}</p>
        <p className="text-[11px] text-slate-500">{person.role} at {person.company}</p>
      </div>
      <Button
        onClick={() => onMessage(person)}
        size="sm"
        variant="outline"
        className="text-[10px] gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 h-7 px-2"
        style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
      >
        <MessageSquare className="w-3 h-3" /> Message on CFF →
      </Button>
    </div>
  );
}

export default function WarmPathCard({ data, onOpenChat }) {
  if (!data || typeof data !== 'object') return null;

  const {
    target_company,
    nearby_alumni = [],
    cff_insiders = [],
    partner_alumni = [],
    recruiters = [],
    linkedin_strategy,
  } = data;

  const handleMessage = (person) => {
    if (person.email) {
      navigate(`MessageComposer?to=${encodeURIComponent(person.email)}&name=${encodeURIComponent(person.name)}`);
    }
  };

  const handleDraftMessage = (name, company) => {
    if (onOpenChat) {
      onOpenChat(`Draft a LinkedIn message to ${name} at ${company}`);
    }
  };

  const totalPaths = nearby_alumni.length + cff_insiders.length + partner_alumni.length + recruiters.length + (linkedin_strategy ? 1 : 0);

  return (
    <Card className="p-4 border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-white mt-2 mb-1">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-xl flex items-center justify-center">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">YOUR PATH INTO {(target_company || '').toUpperCase()}</p>
          <p className="text-[11px] text-slate-500">{totalPaths} warm {totalPaths === 1 ? 'path' : 'paths'} found — FASTIQ never hits a dead end</p>
        </div>
      </div>

      <div className="space-y-2">
        {/* Layer 1: Nearby Alumni */}
        {nearby_alumni.length > 0 && (
          <Section
            icon={Users}
            title="UF Alumni at Similar Companies"
            subtitle={`${nearby_alumni.length} Gators in the same space who can give you insider knowledge`}
            color="#7C3AED"
            count={nearby_alumni.length}
            defaultOpen={true}
          >
            <div className="divide-y divide-slate-100">
              {nearby_alumni.map((a, i) => (
                <AlumniRow key={i} person={a} connectionNote={a.connection_note} />
              ))}
            </div>
            <Button
              onClick={() => onOpenChat && onOpenChat(`Draft a LinkedIn message to ${nearby_alumni[0]?.name} at ${nearby_alumni[0]?.company}`)}
              size="sm"
              className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-[11px] gap-1"
              style={{ minHeight: 'auto' }}
            >
              ✉️ Draft message to {nearby_alumni[0]?.name?.split(' ')[0]}
            </Button>
          </Section>
        )}

        {/* Layer 2: CFF Insiders */}
        {cff_insiders.length > 0 && (
          <Section
            icon={MessageSquare}
            title="Industry Insiders on CFF"
            subtitle={`Parents and alumni in the same industry — message them directly`}
            color="#0021A5"
            count={cff_insiders.length}
            defaultOpen={nearby_alumni.length === 0}
          >
            <div className="divide-y divide-slate-100">
              {cff_insiders.map((p, i) => (
                <CFFContactRow key={i} person={p} onMessage={handleMessage} />
              ))}
            </div>
          </Section>
        )}

        {/* Layer 3: Partner/Client Alumni */}
        {partner_alumni.length > 0 && (
          <Section
            icon={Handshake}
            title="Alumni at Partners & Clients"
            subtitle={`Creative second-degree connections through ${titleCase(target_company || '')} partners`}
            color="#059669"
            count={partner_alumni.length}
          >
            <div className="divide-y divide-slate-100">
              {partner_alumni.map((a, i) => (
                <AlumniRow key={i} person={a} connectionNote={a.connection_note} />
              ))}
            </div>
            {partner_alumni[0] && (
              <Button
                onClick={() => onOpenChat && onOpenChat(`Draft a LinkedIn message to ${partner_alumni[0]?.name} at ${partner_alumni[0]?.company} — they work at a partner/client of ${target_company}`)}
                size="sm"
                className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] gap-1"
                style={{ minHeight: 'auto' }}
              >
                ✉️ Draft message to {partner_alumni[0]?.name?.split(' ')[0]}
              </Button>
            )}
          </Section>
        )}

        {/* Layer 4: Recruiters */}
        {recruiters.length > 0 && (
          <Section
            icon={Building2}
            title="Recruiters Who Place at This Company"
            subtitle={`Recruiting firms that specialize in this industry`}
            color="#D97706"
            count={recruiters.length}
          >
            <div className="space-y-2">
              {recruiters.map((r, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-bold text-[10px] flex-shrink-0">
                    {r.firm_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-slate-900">{r.firm_name}</p>
                    <p className="text-[11px] text-slate-500">{r.specialization}</p>
                    {r.contact_tip && <p className="text-[11px] text-amber-700 mt-0.5">{r.contact_tip}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Layer 5: LinkedIn Strategy */}
        {linkedin_strategy && (
          <Section
            icon={ExternalLink}
            title="Your Action Plan"
            subtitle="Step-by-step strategy to build your connection"
            color="#FA4616"
            defaultOpen={nearby_alumni.length === 0 && cff_insiders.length === 0 && partner_alumni.length === 0}
          >
            <div className="space-y-2">
              {(linkedin_strategy.steps || []).map((step, i) => (
                <div key={i} className="flex gap-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-[11px] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-[12px] text-slate-700 leading-relaxed">{step}</p>
                </div>
              ))}
              {linkedin_strategy.groups?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">LinkedIn Groups to Join</p>
                  <div className="flex flex-wrap gap-1">
                    {linkedin_strategy.groups.map((g, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {linkedin_strategy.events?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Events to Attend</p>
                  {linkedin_strategy.events.map((e, i) => (
                    <p key={i} className="text-[11px] text-slate-600">📅 {e}</p>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-orange-700 font-medium mt-3 italic">
              The warm path sometimes takes two hops instead of one. Let me draft your first message to get started.
            </p>
            {nearby_alumni[0] && (
              <Button
                onClick={() => onOpenChat && onOpenChat(`Draft a message to start building connections toward ${target_company}`)}
                size="sm"
                className="w-full mt-2 bg-[#FA4616] hover:bg-orange-600 text-white text-[11px] gap-1"
                style={{ minHeight: 'auto' }}
              >
                ✉️ Draft my first outreach message
              </Button>
            )}
          </Section>
        )}
      </div>
    </Card>
  );
}