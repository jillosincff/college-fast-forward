import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, ArrowRight } from 'lucide-react';
import PipelineFunnel from './PipelineFunnel';
import PipelineCompanyRow from './PipelineCompanyRow';
import titleCase from '@/components/utils/titleCase';

export default function PipelineSection({ userEmail, companyIntel, onOpenChat }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = useCallback(async () => {
    if (!userEmail) return;
    const data = await base44.entities.NetworkingPipeline.filter(
      { user_email: userEmail },
      '-status_date',
      200
    );
    setContacts(data || []);
    setLoading(false);
  }, [userEmail]);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  if (loading) {
    return (
      <div className="rounded-xl p-6 text-center bg-white border border-slate-200">
        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Compute funnel counts
  const counts = { identified: 0, reached_out: 0, replied: 0, interview: 0, offer: 0 };
  contacts.forEach(c => {
    const s = c.status || 'identified';
    if (counts[s] !== undefined) counts[s]++;
  });
  const total = contacts.length;

  // Group by company
  const byCompany = {};
  contacts.forEach(c => {
    const key = (c.company || '').toLowerCase();
    if (!byCompany[key]) byCompany[key] = { name: titleCase(c.company || ''), contacts: [] };
    byCompany[key].contacts.push(c);
  });

  // Sort companies by most recent activity
  const sortedCompanies = Object.values(byCompany).sort((a, b) => {
    const latestA = Math.max(...a.contacts.map(c => new Date(c.status_date || c.created_date || 0).getTime()));
    const latestB = Math.max(...b.contacts.map(c => new Date(c.status_date || c.created_date || 0).getTime()));
    return latestB - latestA;
  });

  if (total === 0) {
    return (
      <div className="rounded-xl p-6 text-center bg-white border border-slate-200">
        <p className="text-[13px] text-slate-600 mb-1 font-medium">No contacts in your pipeline yet.</p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
          Start by researching a target company → FASTIQ will find alumni → then you'll see them here as you reach out.
        </p>
        <button
          onClick={() => onOpenChat('What company should I target next? Help me find one that matches my interests.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold text-white transition-all hover:brightness-110"
          style={{ background: '#FA4616', minHeight: 'auto' }}
        >
          <Search className="w-3.5 h-3.5" /> Research a company <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Funnel — horizontal flow */}
      <div className="rounded-xl px-4 py-4 bg-white border border-slate-200 overflow-x-auto">
        <PipelineFunnel counts={counts} />
      </div>

      {/* Company accordion */}
      <div className="space-y-2">
        {sortedCompanies.map(group => {
          const key = group.name.toLowerCase();
          const intel = companyIntel[key];
          return (
            <PipelineCompanyRow
              key={key}
              company={group.name}
              contacts={group.contacts}
              hiringScore={intel?.hiring_score}
              onOpenChat={onOpenChat}
              onContactsChange={loadContacts}
            />
          );
        })}
      </div>
    </div>
  );
}