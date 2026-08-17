export default function AllCaughtUpCard({ dropDate, onUpgrade }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="text-center py-6">
      <p className="text-sm text-gray-500 leading-relaxed">
        You're all caught up for today — CLIFF's next batch lands <span className="font-semibold text-gray-700">{tomorrowStr}</span>.
      </p>
    </div>
  );
}