import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Briefcase, Sparkles } from 'lucide-react';

const mockStories = [
  {
    id: 1,
    studentName: "John D. '24",
    quote: "The intro from Mr. Smith was a game-changer. I landed an interview I never could have gotten on my own.",
    parentName: "your connection"
  },
  {
    id: 2,
    studentName: "Jessica P. '23",
    quote: "Because of a parent's help, I secured my first full-time role before graduation!",
    parentName: "another parent's help"
  }
];

export default function ParentSuccessStoriesWidget() {
  return (
    <Card className="shadow-lg border-0 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Success Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockStories.map(story => (
            <div key={story.id} className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <Quote className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-sm italic text-gray-700 mb-3">"{story.quote}"</p>
              <div className="text-xs text-gray-600 font-medium">
                <strong>{story.studentName}</strong>, thanks to {story.parentName}.
              </div>
              <div className="flex items-center gap-2 mt-2 text-blue-700 text-xs font-medium">
                  <Briefcase className="w-3 h-3" />
                  Landed Interview
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}