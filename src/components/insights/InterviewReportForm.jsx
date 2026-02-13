import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mic, Lock, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Consulting', 'Healthcare',
  'Marketing & Advertising', 'Law & Legal', 'Engineering', 'Real Estate',
  'Media & Entertainment', 'Retail & Consumer', 'Manufacturing',
  'Education', 'Non-Profit', 'Government', 'Other',
];

const INTERVIEW_TYPES = [
  { value: 'behavioral', label: 'Behavioral / Fit' },
  { value: 'case', label: 'Case Study' },
  { value: 'technical', label: 'Technical / Coding' },
  { value: 'product', label: 'Product / Design' },
  { value: 'system_design', label: 'System Design' },
  { value: 'group', label: 'Group / Panel' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'panel', label: 'Panel Interview' },
  { value: 'other', label: 'Other' },
];

const EXPERIENCE_LEVELS = [
  { value: 'intern', label: 'Intern' },
  { value: 'entry', label: 'Entry Level / New Grad' },
  { value: 'mid', label: 'Mid Level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5+ yrs)' },
];

const currentYear = new Date().getFullYear();
const QUARTERS = [
  `Q1 ${currentYear}`, `Q2 ${currentYear}`, `Q3 ${currentYear}`, `Q4 ${currentYear}`,
  `Q1 ${currentYear - 1}`, `Q2 ${currentYear - 1}`, `Q3 ${currentYear - 1}`, `Q4 ${currentYear - 1}`,
];

export default function InterviewReportForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    company: '',
    role: '',
    industry: '',
    experience_level: '',
    interview_types: [],
    what_they_asked: '',
    tips_for_students: '',
    got_the_offer: '',
    interview_date: '',
    difficulty: '',
    num_rounds: '',
  });

  const toggleInterviewType = (type) => {
    setForm(prev => ({
      ...prev,
      interview_types: prev.interview_types.includes(type)
        ? prev.interview_types.filter(t => t !== type)
        : [...prev.interview_types, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company || !form.role || !form.industry || !form.what_they_asked) {
      toast.error('Please fill in company, role, industry, and what they asked');
      return;
    }

    setSubmitting(true);
    try {
      const report = await base44.entities.InterviewReport.create({
        user_id: user.id,
        company: form.company,
        company_normalized: form.company.toLowerCase().trim(),
        role: form.role,
        industry: form.industry,
        experience_level: form.experience_level || null,
        interview_types: form.interview_types,
        what_they_asked: form.what_they_asked,
        tips_for_students: form.tips_for_students || null,
        got_the_offer: form.got_the_offer || null,
        interview_date: form.interview_date || null,
        difficulty: form.difficulty || null,
        num_rounds: form.num_rounds ? parseInt(form.num_rounds) : null,
      });

      // Award +15 karma
      try {
        if (user.persona === 'gator' || user.roles?.includes('gator')) {
          await base44.functions.invoke('awardStudentKarma', {
            userId: user.id,
            userEmail: user.email,
            actionType: 'interview_question_submitted',
            referenceId: report.id,
            description: `Shared interview experience at ${form.company}`,
          });
        }
        if (user.persona === 'parent' || user.persona === 'alumni' || user.roles?.includes('parent') || user.roles?.includes('alumni')) {
          await base44.functions.invoke('awardKarma', {
            parentUserId: user.id,
            parentEmail: user.email,
            parentName: user.full_name,
            actionType: 'interview_question_submitted',
            referenceType: 'interview_report',
            referenceId: report.id,
            description: `Shared interview experience at ${form.company}`,
          });
        }
      } catch (karmaErr) {
        console.log('Karma award failed (non-critical):', karmaErr.message);
      }

      setSubmitted(true);
      toast.success('+15 karma! Thanks for sharing your interview experience.');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to submit interview report:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Thank you!</h3>
        <p className="text-slate-600 mb-1">Your interview experience has been shared anonymously.</p>
        <p className="text-sm font-semibold text-purple-600 mb-6">+15 karma earned 🎉</p>
        <Button variant="outline" onClick={onCancel}>Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Mic className="w-7 h-7 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Share Your Interview Experience</h2>
        <p className="text-sm text-slate-500 mt-1">Always anonymous · +15 karma</p>
      </div>

      {/* Company + Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Company *</Label>
          <Input
            placeholder="e.g., Google"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
        </div>
        <div>
          <Label>Role / Position *</Label>
          <Input
            placeholder="e.g., Software Engineer Intern"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>
      </div>

      {/* Industry + Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Industry *</Label>
          <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
            <SelectTrigger><SelectValue placeholder="Select industry..." /></SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Experience Level</Label>
          <Select value={form.experience_level} onValueChange={(v) => setForm({ ...form, experience_level: v })}>
            <SelectTrigger><SelectValue placeholder="Select level..." /></SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map(l => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interview types checkboxes */}
      <div>
        <Label className="mb-2 block">Interview Types (select all that apply)</Label>
        <div className="flex flex-wrap gap-2">
          {INTERVIEW_TYPES.map(t => {
            const checked = form.interview_types.includes(t.value);
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleInterviewType(t.value)}
                className={`text-xs px-3 py-2 rounded-lg border-2 font-medium transition-colors ${
                  checked
                    ? 'bg-purple-100 border-purple-400 text-purple-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {checked ? '✓ ' : ''}{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* What they asked */}
      <div>
        <Label>What did they ask? *</Label>
        <Textarea
          placeholder="Describe the questions they asked, the format of the interview, any surprises..."
          value={form.what_they_asked}
          onChange={(e) => setForm({ ...form, what_they_asked: e.target.value })}
          rows={4}
        />
      </div>

      {/* Tips */}
      <div>
        <Label>Tips for other students</Label>
        <Textarea
          placeholder="What would you tell a friend who's about to interview here?"
          value={form.tips_for_students}
          onChange={(e) => setForm({ ...form, tips_for_students: e.target.value })}
          rows={3}
        />
      </div>

      {/* Offer outcome + meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Did you get the offer?</Label>
          <Select value={form.got_the_offer} onValueChange={(v) => setForm({ ...form, got_the_offer: v })}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes ✅</SelectItem>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="pending">Still waiting</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>When was the interview?</Label>
          <Select value={form.interview_date} onValueChange={(v) => setForm({ ...form, interview_date: v })}>
            <SelectTrigger><SelectValue placeholder="Select quarter..." /></SelectTrigger>
            <SelectContent>
              {QUARTERS.map(q => (
                <SelectItem key={q} value={q}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Difficulty</Label>
          <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Anonymous notice + submit */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Lock className="w-4 h-4" />
          Always anonymous — your name is never shown
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          )}
          <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Submit +15 karma</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}