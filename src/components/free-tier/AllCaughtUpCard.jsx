export default function AllCaughtUpCard({ dropDate }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Star icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 flex items-center justify-center mb-6">
        <span className="text-4xl">✨</span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        You're all caught up for today
      </h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        We're busy scouting the web and the network for your next batch.
        Come back <span className="font-semibold text-gray-700">{tomorrowStr}</span> for your next tailored opportunities.
      </p>

      {/* Subtle next-drop indicator */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-xs text-gray-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
        CLiFF is scouting your next 5 matches
      </div>
    </div>
  );
}