
const activities = [
  { text: 'Mike Chen posted a new Marketing Internship', time: '3 minutes ago', color: 'bg-green-400' },
  { text: 'Jennifer L. answered a question about resume tips', time: '1 hour ago', color: 'bg-blue-400' },
  { text: 'David R. became a mentor in Software Engineering', time: '2 hours ago', color: 'bg-purple-400' },
];

export default function RecentPlatformActivity() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 ${activity.color} rounded-full mt-1.5 flex-shrink-0`}></div>
            <div className="text-sm">
              <p className="text-gray-900" dangerouslySetInnerHTML={{ __html: activity.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              <p className="text-gray-500 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}