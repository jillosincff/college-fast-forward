
const topics = [
  { name: '#TechInternships', posts: 43 },
  { name: '#ResumeReview', posts: 28 },
  { name: '#NetworkingTips', posts: 19 },
  { name: '#MedSchoolPrep', posts: 15 },
];

export default function TrendingTopics() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending This Week</h3>
      <div className="space-y-2">
        {topics.map(topic => (
          <div key={topic.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-700 cursor-pointer hover:text-blue-600">{topic.name}</span>
            <span className="text-xs text-gray-500">{topic.posts} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}