import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InterviewQuestion } from '@/entities/InterviewQuestion';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Mic, Lock, Loader2, Plus, X } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'behavioral', label: 'Behavioral / Fit' },
  { value: 'case', label: 'Case / Problem-Solving' },
  { value: 'technical', label: 'Technical' },
  { value: 'product', label: 'Product / Design' },
  { value: 'system_design', label: 'System Design' },
  { value: 'other', label: 'Other' }
];

const EXPERIENCE_LEVELS = [
  { value: 'intern', label: 'Intern' },
  { value: 'entry', label: 'Entry Level / New Grad' },
  { value: 'mid', label: 'Mid Level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5+ yrs)' }
];

const currentYear = new Date().getFullYear();
const QUARTERS = [
  `Q1 ${currentYear}`, `Q2 ${currentYear}`, `Q3 ${currentYear}`, `Q4 ${currentYear}`,
  `Q1 ${currentYear - 1}`, `Q2 ${currentYear - 1}`, `Q3 ${currentYear - 1}`, `Q4 ${currentYear - 1}`
];

export default function InterviewQuestionForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questions, setQuestions] = useState([{
    question_text: '',
    question_type: '',
    answer_tips: ''
  }]);
  const [commonFields, setCommonFields] = useState({
    company: '',
    role: '',
    experience_level: '',
    interview_date: ''
  });

  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', question_type: '', answer_tips: '' }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commonFields.company || !commonFields.role || !commonFields.experience_level) {
      toast.error('Please fill in company, role, and experience level');
      return;
    }

    const validQuestions = questions.filter(q => q.question_text && q.question_type);
    if (validQuestions.length === 0) {
      toast.error('Please add at least one question with type');
      return;
    }

    setIsSubmitting(true);
    try {
      for (const question of validQuestions) {
        await InterviewQuestion.create({
          user_id: user.id,
          is_anonymous: isAnonymous,
          submitter_name: isAnonymous ? null : user.full_name,
          submitter_title: isAnonymous ? null : user.current_role,
          company: commonFields.company,
          company_normalized: commonFields.company.toLowerCase().trim(),
          role: commonFields.role,
          role_normalized: commonFields.role.toLowerCase().trim(),
          experience_level: commonFields.experience_level,
          interview_date: commonFields.interview_date || null,
          question_text: question.question_text,
          question_type: question.question_type,
          answer_tips: question.answer_tips || null
        });
      }

      toast.success(`Thank you! ${validQuestions.length} question${validQuestions.length > 1 ? 's' : ''} submitted.`);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting questions:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Share Interview Questions</h2>
        <p className="text-gray-600 mt-2">
          Help students prep by sharing real questions from your interviews.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              placeholder="e.g., Google"
              value={commonFields.company}
              onChange={(e) => setCommonFields({ ...commonFields, company: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role/Position *</Label>
            <Input
              id="role"
              placeholder="e.g., Product Manager"
              value={commonFields.role}
              onChange={(e) => setCommonFields({ ...commonFields, role: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Experience Level *</Label>
            <Select 
              value={commonFields.experience_level} 
              onValueChange={(value) => setCommonFields({ ...commonFields, experience_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level..." />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>When was this interview?</Label>
            <Select 
              value={commonFields.interview_date} 
              onValueChange={(value) => setCommonFields({ ...commonFields, interview_date: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quarter..." />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map(q => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-4">Interview Questions</h3>
          
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border relative">
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                
                <div className="space-y-3">
                  <div>
                    <Label>Question Type *</Label>
                    <Select 
                      value={question.question_type} 
                      onValueChange={(value) => updateQuestion(index, 'question_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Interview Question *</Label>
                    <Textarea
                      placeholder='e.g., "Tell me about a time you had to make a decision with incomplete information"'
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Tips for answering (optional)</Label>
                    <Textarea
                      placeholder='e.g., "Use the STAR format. They want to see your thought process"'
                      value={question.answer_tips}
                      onChange={(e) => updateQuestion(index, 'answer_tips', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addQuestion}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Question
          </Button>
        </div>

        <div className="border-t pt-4">
          <Label>Attribution</Label>
          <RadioGroup
            value={isAnonymous ? 'anonymous' : 'named'}
            onValueChange={(value) => setIsAnonymous(value === 'anonymous')}
            className="mt-2 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="anonymous" id="anonymous" />
              <Label htmlFor="anonymous" className="font-normal cursor-pointer">
                Submit anonymously
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="named" id="named" />
              <Label htmlFor="named" className="font-normal cursor-pointer">
                Attach my name (helps students know who to reach out to)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          {isAnonymous ? 'Submitting anonymously' : `Submitting as ${user?.full_name}`}
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Questions'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}