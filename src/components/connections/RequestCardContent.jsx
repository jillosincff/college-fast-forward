import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const RequestCardContent = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 110; // Character limit for truncation

  const shouldTruncate = description && description.length > maxLength;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e) => {
    // Allow keyboard users to toggle with Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  };

  // Determine the text to display
  const displayText = shouldTruncate && !isExpanded
    ? `${description.substring(0, maxLength)}...`
    : description;

  return (
    <div className="text-slate-600 text-sm leading-relaxed mb-4">
      <motion.p
        layout
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {displayText}
      </motion.p>
      
      {shouldTruncate && (
        <button
          onClick={toggleExpand}
          onKeyDown={handleKeyDown}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold mt-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
          aria-expanded={isExpanded}
          role="button"
          tabIndex={0}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};

export default RequestCardContent;