import { useState } from 'react';

export default function SocialDiscoveryCard({ discovery, onAddToPipeline, onGenerateMessage, schoolAbbr }) {
  const [expanded, setExpanded] = useState(false);

  const {
    company,
    role,
    company_domain,
    opportunity_url,
    post_title,
    post_snippet,
    published_date,
    insiders = [],
    alumni_count = 0,
    source_label,
  } = discovery;

  const daysSince = published_date
    ? Math.floor((Date.now() - new Date(published_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Scout Badge Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 flex items-center gap-2">
        <span className="text-[10px] font-bold text-white/90 flex-1 truncate">
          📣 Social Scout Discovery | LinkedIn (#internship)
        </span>
        {daysSince !== null && (
          <span className="text-[10px] text-white/70 shrink-0">
            {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Company + Role */}
        <div>
          <p className="font-black text-gray-900 text-sm leading-tight">{company}</p>
          <p className="text-xs text-gray-500 mt-0.5">{role}</p>
          {company_domain && (
            <p className="text-[10px] text-blue-500 mt-0.5 font-medium">🔒 Domain-locked: {company_domain}</p>
          )}
        </div>

        {/* Post snippet */}
        {post_snippet && (
          <div>
            <p className={`text-xs text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
              {post_snippet}
            </p>
            {post_snippet.length > 200 && (
              <button
                onClick={() => setExpanded(p => !p)}
                className="text-[11px] text-blue-600 font-semibold mt-1"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                {expanded ? 'Show less ▲' : 'Show more ▼'}
              </button>
            )}
          </div>
        )}

        {/* Alumni insiders */}
        {alumni_count > 0 && (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-2.5 space-y-1.5">
            <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
              🎓 {alumni_count} {schoolAbbr} Alumni Found
            </p>
            <div className="flex flex-wrap gap-1">
              {insiders.slice(0, 3).map((ins, i) => (
                <span key={i} className="text-[10px] bg-white border border-purple-200 text-purple-600 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                  {ins.name?.split(/[|\-·]/)[0]?.trim() || 'Alumni'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          {/* View LinkedIn post */}
          <a
            href={opportunity_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-[11px] font-bold py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            style={{ minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
          >
            🔗 View LinkedIn Post
          </a>
          <button
            onClick={() => onAddToPipeline?.(discovery)}
            className="flex-1 text-[11px] font-bold py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            style={{ minHeight: 'auto' }}
          >
            + Pipeline
          </button>
        </div>

        {alumni_count > 0 && (
          <button
            onClick={() => onGenerateMessage?.(discovery)}
            className="w-full text-[11px] font-bold py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition"
            style={{ minHeight: 'auto' }}
          >
            ⚡ Generate Message to Insider
          </button>
        )}
      </div>
    </div>
  );
}