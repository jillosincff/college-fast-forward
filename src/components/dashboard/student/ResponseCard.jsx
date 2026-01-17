import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

const UF_BLUE = '#0021A5';
const UF_BUTTON_GRADIENT = 'linear-gradient(135deg, #0021A5 0%, #003DCE 100%)';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  const days = Math.floor(diffHours / 24);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

export default function ResponseCard({ response, onRead }) {
  // Get display info - never show "Gator"
  const displayName = response.sender_name || response.professionalDisplayName || 'UF Professional';
  const initials = displayName
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'UF';
  
  const preview = response.body || response.messagePreview || response.last_message_preview || '';
  const createdAt = response.created_date || response.createdAt;

  const handleClick = () => {
    if (onRead) {
      onRead(response);
    } else if (response.conversation_id) {
      navigate(`MyMessages?id=${response.conversation_id}`);
    } else {
      navigate('MyMessages');
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex items-start gap-3 md:gap-4">
        
        {/* Avatar */}
        <div 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm md:text-base"
          style={{ background: UF_BUTTON_GRADIENT }}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
            <span className="font-semibold text-gray-900 text-sm md:text-base">
              {displayName} responded
            </span>
            <span className="text-xs md:text-sm text-gray-400 flex-shrink-0">
              {formatTimeAgo(createdAt)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2">
            "{preview.substring(0, 100)}{preview.length > 100 ? '...' : ''}"
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={handleClick}
          className="flex-shrink-0 text-white font-semibold px-3 md:px-4 py-2 rounded-xl shadow-lg transition hover:scale-105 text-sm"
          style={{ 
            background: UF_BUTTON_GRADIENT,
            boxShadow: `0 4px 12px ${UF_BLUE}30`
          }}
        >
          <span className="hidden sm:inline">Read & Reply →</span>
          <span className="sm:hidden">Reply →</span>
        </Button>
      </div>
    </div>
  );
}