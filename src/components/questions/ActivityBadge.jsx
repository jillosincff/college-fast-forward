import React from 'react';

export default function ActivityBadge({ question }) {
  const now = Date.now();
  const createdAt = new Date(question.created_date).getTime();
  const ageHours = (now - createdAt) / (1000 * 60 * 60);
  
  // Hot: High engagement relative to age
  const answers = question.answer_count || 0;
  const upvotes = question.total_upvotes || 0;
  const isHot = ageHours < 48 && (answers >= 3 || upvotes >= 5);
  
  // Rising: Good engagement for newer posts
  const isRising = ageHours < 24 && ageHours > 2 && (answers >= 1 || upvotes >= 2);
  
  // New: Posted in last 2 hours
  const isNew = ageHours < 2;
  
  if (isHot) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
        🔥 Hot
      </span>
    );
  }
  
  if (isRising) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
        📈 Rising
      </span>
    );
  }
  
  if (isNew) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
        ✨ New
      </span>
    );
  }
  
  return null;
}