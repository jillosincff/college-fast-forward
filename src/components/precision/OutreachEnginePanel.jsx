import React from 'react';

const ROW_STYLE = "flex justify-between items-baseline py-2 border-b border-white/5 last:border-0";
const LABEL = "text-[11px] text-slate-500 uppercase tracking-[0.08em] font-medium";
const VALUE = "text-[13px] text-slate-200 font-medium text-right";

function ContactCard({ name, title, badge, badgeColor, shared, note }) {
  return (
    <div className="px-5 py-3">
      <div className={ROW_STYLE}>
        <span className={LABEL}>Contact</span>
        <span className="flex items-center gap-2">
          <span className={`${VALUE} text-white font-semibold`}>{name}</span>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded"
            style={{ background: badgeColor, color: '#fff' }}
          >
            {badge}
          </span>
        </span>
      </div>
      <div className={ROW_STYLE}>
        <span className={LABEL}>Title</span>
        <span className={VALUE}>{title}</span>
      </div>
      <div className={ROW_STYLE}>
        <span className={LABEL}>Shared Background</span>
        <span className={VALUE}>{shared}</span>
      </div>
      {note && (
        <p className="text-[10px] text-slate-500 mt-1.5 italic">{note}</p>
      )}
    </div>
  );
}

export default function OutreachEnginePanel() {
  return (
    <div className="flex flex-col h-full">
      <div
        className="rounded-md overflow-hidden flex-1 flex flex-col"
        style={{
          background: '#0F172A',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.14em] font-semibold">Outreach Engine</p>
        </div>

        {/* Contact 1 — CFF Member */}
        <ContactCard
          name="Sarah Mitchell"
          title="VP, Strategy"
          badge="CFF"
          badgeColor="#2563EB"
          shared="UF · Finance · 2020"
        />

        {/* Divider */}
        <div className="px-5">
          <div className="border-t border-white/5" />
        </div>

        {/* Contact 2 — Discovered by FASTIQ */}
        <ContactCard
          name="James Rivera"
          title="Associate, Goldman Sachs"
          badge="FASTIQ"
          badgeColor="#EA580C"
          shared="UF · Finance · 2021"
          note="Found via web search — not a CFF member"
        />

        {/* Message Preview */}
        <div className="px-5 pb-3">
          <div
            className="rounded px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-[11px] text-slate-400 leading-[1.75]" style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace' }}>
              "Hi James — I'm a UF junior exploring IB roles and noticed your path from UF to GS. I'd value 10 minutes to learn from your experience."
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-medium">2 Drafts Saved</span>
            <span className="text-[10px] text-slate-600">|</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-medium">Not Sent</span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[12px] text-slate-500 leading-[1.7] mt-4 px-1">
        FASTIQ searches inside CFF <em>and</em> across the web — surfacing UF alumni at target companies you'd never find alone.
      </p>
    </div>
  );
}