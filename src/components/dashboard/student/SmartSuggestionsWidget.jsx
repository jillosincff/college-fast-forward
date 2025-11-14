
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { InvokeLLM } from '@/integrations/Core';
import { Loader2, UserCheck, Lightbulb, Search, Wand2 } from 'lucide-react';
import UserCard from '@/components/directory/UserCard';
import MessageUserModal from '@/components/directory/MessageUserModal';

const suggestedPrompts = [
  'Software Engineering Internship',
  'Marketing Career Switch',
  'Medical School Prep',
  'Finance Job Hunt',
];

export default function SmartSuggestionsWidget({ user }) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { toast } = useToast();

  const handleFindMatches = async () => {
    setIsLoading(true);
    setSuggestions([]); // Clear previous suggestions

    if (!goal.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your career goal before finding matches.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await InvokeLLM({
        prompt: `Given the user's career goal: "${goal}", identify 3 specific types of individuals or alumni roles that could provide valuable mentorship or networking opportunities. For each type, generate a concise reason (1-2 sentences) why they would be a good match.
        
        Example Output Format:
        [
          { "type": "Software Engineer at Google", "reason": "This person can offer insights into big tech company culture and technical interview preparation." },
          { "type": "Startup Founder", "reason": "This person can provide advice on entrepreneurship and navigating the startup ecosystem." },
          { "type": "UX Designer", "reason": "This person can guide on building a strong design portfolio and understanding user-centered design principles." }
        ]
        
        Ensure the "reason" directly explains the value proposition based on the career goal. Keep the types and reasons professional and actionable.`,
        temperature: 0.7,
        max_tokens: 300,
        response_json: true,
      });

      if (response && Array.isArray(response) && response.length > 0) {
        // This is a placeholder for actual user lookup
        // In a real application, you would query your user database based on these "types"
        const mockUsers = response.map((suggestion, index) => ({
          id: `mock-user-${index}`,
          firstName: "Gator",
          lastName: `${index + 1}`,
          title: suggestion.type,
          company: "University of Florida",
          profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=Gator${index + 1}`,
          match_reason: suggestion.reason,
          email: `gator${index + 1}@example.com`,
          linkedIn: `https://www.linkedin.com/in/gator${index + 1}`,
        }));
        setSuggestions(mockUsers);
      } else {
        toast({
          title: "No Suggestions Found",
          description: "We couldn't generate specific user types based on your goal. Please try rephrasing.",
          variant: "default",
        });
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error invoking LLM:", error);
      toast({
        title: "Matching Failed",
        description: "There was an error finding matches. Please try again later.",
        variant: "destructive",
      });
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageUser = (user) => {
    setSelectedUser(user);
    setIsMessageModalOpen(true);
  };
  
  const handlePromptClick = (prompt) => {
    const fullPrompts = {
      'Software Engineering Internship': "I'm looking for a software engineering internship at a startup in New York for Summer 2025. I'd love advice on my resume and how to prepare for technical interviews.",
      'Marketing Career Switch': "I'm interested in switching to a career in digital marketing, specifically in the e-commerce space. I'm looking for advice on what skills to build.",
      'Medical School Prep': "I'm preparing to apply to medical school and would like to connect with alumni who are doctors or current med students for advice.",
      'Finance Job Hunt': "I'm a senior finance major looking for full-time analyst positions in investment banking or private equity in Chicago or New York."
    };
    setGoal(fullPrompts[prompt] || prompt);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <Wand2 className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI-Powered Career Matching</h2>
            <p className="text-sm text-gray-600">Tell us your goals, and we'll connect you with the right Gators</p>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your career goal, and our AI will find the best Gators to help you:
          </label>
          <Textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="e.g., 'I'm looking for a software engineering internship at a startup in New York for Summer 2025. I'd love advice on my resume and how to prepare for technical interviews.'"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Be specific about role, location, timeline, and what kind of help you need
            </p>
            <span className="text-xs text-gray-400">{goal.length}/500</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Popular career goals:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map(prompt => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full h-auto py-1 px-3"
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleFindMatches} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg h-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Find My Matches
            </>
          )}
        </Button>

        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Top Suggestions for You
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((suggestedUser) => (
                <div key={suggestedUser.id}>
                  <UserCard user={suggestedUser} onMessage={() => handleMessageUser(suggestedUser)} />
                  <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-100 rounded-md">
                    <strong>Match Reason:</strong> {suggestedUser.match_reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MessageUserModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientUser={selectedUser}
      />
    </>
  );
}
