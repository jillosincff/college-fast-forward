import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/components/auth/AuthContext';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Compass, Target, Lightbulb, TrendingUp } from 'lucide-react';

export default function CareerExplorerModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    major: user?.major || '',
    interests: '',
    skills: '',
    workEnvironment: [],
    careerStage: 'exploring'
  });

  const workEnvironmentOptions = [
    { id: 'remote', label: 'Remote work' },
    { id: 'office', label: 'Traditional office' },
    { id: 'hybrid', label: 'Hybrid (remote + office)' },
    { id: 'travel', label: 'Frequent travel' },
    { id: 'startup', label: 'Startup environment' },
    { id: 'corporate', label: 'Large corporation' },
    { id: 'nonprofit', label: 'Non-profit sector' },
    { id: 'creative', label: 'Creative/artistic environment' }
  ];

  const handleWorkEnvironmentChange = (optionId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        workEnvironment: [...prev.workEnvironment, optionId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        workEnvironment: prev.workEnvironment.filter(id => id !== optionId)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const prompt = `You are a career counselor helping a University of Florida student explore career paths. 

Student Profile:
- Major: ${formData.major}
- Interests: ${formData.interests}
- Skills: ${formData.skills}
- Preferred Work Environment: ${formData.workEnvironment.join(', ')}
- Career Stage: ${formData.careerStage}

Provide personalized career guidance including:
1. 5 specific job roles that align with their profile
2. 3 industries they should consider
3. Key skills they should develop
4. Recommended next steps for their career journey
5. Potential salary ranges for suggested roles

Make the advice specific, actionable, and encouraging. Focus on realistic paths that leverage their UF education.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_roles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  salary_range: { type: "string" },
                  growth_outlook: { type: "string" }
                }
              }
            },
            target_industries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  why_good_fit: { type: "string" },
                  entry_opportunities: { type: "string" }
                }
              }
            },
            skills_to_develop: {
              type: "array",
              items: { type: "string" }
            },
            next_steps: {
              type: "array",
              items: { type: "string" }
            },
            additional_advice: { type: "string" }
          }
        }
      });

      setResults(response);
      
      toast({
        title: "Career guidance ready!",
        description: "Your personalized career roadmap has been generated.",
      });
      
    } catch (error) {
      console.error('Career exploration error:', error);
      toast({
        title: "Error",
        description: "Failed to generate career guidance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            AI Career Path Explorer
          </DialogTitle>
          <DialogDescription>
            Get personalized career guidance based on your major, interests, and preferences.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-sm text-indigo-800">
              <p className="font-semibold mb-2">What you'll get:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-semibold">Personalized job role recommendations</span> based on your profile</li>
                <li><span className="font-semibold">Industry insights</span> tailored to your interests</li>
                <li><span className="font-semibold">Skill development roadmap</span> to reach your goals</li>
                <li><span className="font-semibold">Actionable next steps</span> for your career journey</li>
              </ul>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="major">Your Major</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="e.g., Computer Science, Marketing, Biology"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="careerStage">Career Stage</Label>
                  <Select value={formData.careerStage} onValueChange={(value) => setFormData(prev => ({ ...prev, careerStage: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exploring">Just exploring options</SelectItem>
                      <SelectItem value="focused">Have some ideas, want validation</SelectItem>
                      <SelectItem value="switching">Considering changing paths</SelectItem>
                      <SelectItem value="planning">Ready to make concrete plans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="interests">Your Interests & Passions</Label>
                <Textarea
                  id="interests"
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="What excites you? What problems do you want to solve? What activities do you enjoy?"
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label htmlFor="skills">Your Skills & Strengths</Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="Technical skills, soft skills, languages, certifications, relevant experience..."
                  className="mt-1 h-24"
                />
              </div>

              <div>
                <Label>Preferred Work Environment (select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {workEnvironmentOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={formData.workEnvironment.includes(option.id)}
                        onCheckedChange={(checked) => handleWorkEnvironmentChange(option.id, checked)}
                      />
                      <Label htmlFor={option.id} className="text-sm cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 mr-2" />
                    Explore My Career Path
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Career Roles */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Recommended Career Roles
              </h3>
              <div className="grid gap-4">
                {results.recommended_roles?.map((role, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-900">{role.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span><strong>Salary:</strong> {role.salary_range}</span>
                      <span><strong>Growth:</strong> {role.growth_outlook}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Industries */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Industries to Consider
              </h3>
              <div className="grid gap-4">
                {results.target_industries?.map((industry, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-900">{industry.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{industry.why_good_fit}</p>
                    <p className="text-xs text-gray-500 mt-2"><strong>Entry opportunities:</strong> {industry.entry_opportunities}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-indigo-600" />
                  Skills to Develop
                </h3>
                <ul className="space-y-2">
                  {results.skills_to_develop?.map((skill, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Next Steps</h3>
                <ul className="space-y-2">
                  {results.next_steps?.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full text-xs flex items-center justify-center mt-0.5 mr-3 flex-shrink-0 font-semibold">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Advice */}
            {results.additional_advice && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Career Counselor's Additional Advice</h3>
                <p className="text-blue-800 text-sm">{results.additional_advice}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setResults(null)}>
                Explore Again
              </Button>
              <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}