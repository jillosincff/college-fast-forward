import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, DollarSign, Briefcase } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

export default function DataSubmissionModal({ open, onOpenChange, defaultTab = 'salary' }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Salary form state
  const [salaryData, setSalaryData] = useState({
    company_name: '',
    company_type: '',
    role_title: '',
    role_level: 'entry',
    location_city: '',
    location_state: '',
    remote_policy: 'hybrid',
    base_salary: '',
    signing_bonus: '',
    annual_bonus: '',
    equity_value: '',
    offer_year: new Date().getFullYear(),
    was_negotiated: false,
    was_accepted: null
  });

  // Interview form state
  const [interviewData, setInterviewData] = useState({
    company_name: '',
    role_title: '',
    interview_round: 'phone_screen',
    had_behavioral: false,
    had_technical: false,
    had_case_study: false,
    had_product_design: false,
    had_estimation: false,
    question_descriptions: '',
    tips_for_candidates: '',
    overall_difficulty: 'medium',
    got_offer: null
  });

  const handleSalarySubmit = async () => {
    if (!salaryData.company_name || !salaryData.role_title) {
      toast.error('Please fill in company and role');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalComp = (parseInt(salaryData.base_salary) || 0) + 
                        (parseInt(salaryData.signing_bonus) || 0) + 
                        (parseInt(salaryData.annual_bonus) || 0);

      await base44.entities.AICareerSubmission.create({
        submission_type: 'salary',
        user_id: user.id,
        company_name: salaryData.company_name,
        company_type: salaryData.company_type,
        role_title: salaryData.role_title,
        role_level: salaryData.role_level,
        location_city: salaryData.location_city,
        location_state: salaryData.location_state,
        remote_policy: salaryData.remote_policy,
        base_salary: parseInt(salaryData.base_salary) || null,
        signing_bonus: parseInt(salaryData.signing_bonus) || null,
        annual_bonus: parseInt(salaryData.annual_bonus) || null,
        equity_value: salaryData.equity_value,
        total_comp: totalComp || null,
        offer_year: salaryData.offer_year,
        was_negotiated: salaryData.was_negotiated,
        was_accepted: salaryData.was_accepted
      });

      toast.success('Thank you! Your data will help future UF students.');
      onOpenChange(false);
      
      // Reset form
      setSalaryData({
        company_name: '',
        company_type: '',
        role_title: '',
        role_level: 'entry',
        location_city: '',
        location_state: '',
        remote_policy: 'hybrid',
        base_salary: '',
        signing_bonus: '',
        annual_bonus: '',
        equity_value: '',
        offer_year: new Date().getFullYear(),
        was_negotiated: false,
        was_accepted: null
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInterviewSubmit = async () => {
    if (!interviewData.company_name || !interviewData.role_title) {
      toast.error('Please fill in company and role');
      return;
    }

    setIsSubmitting(true);
    try {
      await base44.entities.AICareerSubmission.create({
        submission_type: 'interview',
        user_id: user.id,
        company_name: interviewData.company_name,
        role_title: interviewData.role_title,
        interview_round: interviewData.interview_round,
        had_behavioral: interviewData.had_behavioral,
        had_technical: interviewData.had_technical,
        had_case_study: interviewData.had_case_study,
        had_product_design: interviewData.had_product_design,
        had_estimation: interviewData.had_estimation,
        question_descriptions: interviewData.question_descriptions,
        tips_for_candidates: interviewData.tips_for_candidates,
        overall_difficulty: interviewData.overall_difficulty,
        got_offer: interviewData.got_offer,
        offer_year: new Date().getFullYear()
      });

      toast.success('Thank you! Your insights will help future UF students.');
      onOpenChange(false);
      
      // Reset form
      setInterviewData({
        company_name: '',
        role_title: '',
        interview_round: 'phone_screen',
        had_behavioral: false,
        had_technical: false,
        had_case_study: false,
        had_product_design: false,
        had_estimation: false,
        question_descriptions: '',
        tips_for_candidates: '',
        overall_difficulty: 'medium',
        got_offer: null
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Share Anonymously
          </DialogTitle>
          <DialogDescription>
            Your data powers the AI advisor — it's never displayed publicly or tied to you.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="salary" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Salary Data
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Interview
            </TabsTrigger>
          </TabsList>

          {/* Salary Tab */}
          <TabsContent value="salary" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Company *</Label>
                <Input
                  value={salaryData.company_name}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="e.g., Google"
                />
              </div>

              <div className="col-span-2">
                <Label>Role *</Label>
                <Input
                  value={salaryData.role_title}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, role_title: e.target.value }))}
                  placeholder="e.g., Product Manager"
                />
              </div>

              <div>
                <Label>Level</Label>
                <Select
                  value={salaryData.role_level}
                  onValueChange={(v) => setSalaryData(prev => ({ ...prev, role_level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Company Type</Label>
                <Select
                  value={salaryData.company_type}
                  onValueChange={(v) => setSalaryData(prev => ({ ...prev, company_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="big_tech">Big Tech</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={salaryData.location_city}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, location_city: e.target.value }))}
                  placeholder="e.g., Miami"
                />
              </div>

              <div>
                <Label>State</Label>
                <Input
                  value={salaryData.location_state}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, location_state: e.target.value }))}
                  placeholder="e.g., FL"
                />
              </div>

              <div className="col-span-2 border-t pt-4 mt-2">
                <Label className="text-base font-semibold">Compensation</Label>
              </div>

              <div>
                <Label>Base Salary</Label>
                <Input
                  type="number"
                  value={salaryData.base_salary}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, base_salary: e.target.value }))}
                  placeholder="$"
                />
              </div>

              <div>
                <Label>Signing Bonus</Label>
                <Input
                  type="number"
                  value={salaryData.signing_bonus}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, signing_bonus: e.target.value }))}
                  placeholder="$"
                />
              </div>

              <div>
                <Label>Annual Bonus</Label>
                <Input
                  type="number"
                  value={salaryData.annual_bonus}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, annual_bonus: e.target.value }))}
                  placeholder="$"
                />
              </div>

              <div>
                <Label>Equity</Label>
                <Input
                  value={salaryData.equity_value}
                  onChange={(e) => setSalaryData(prev => ({ ...prev, equity_value: e.target.value }))}
                  placeholder="e.g., 0.1% or $50K RSUs"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <Checkbox
                  id="negotiated"
                  checked={salaryData.was_negotiated}
                  onCheckedChange={(c) => setSalaryData(prev => ({ ...prev, was_negotiated: c }))}
                />
                <Label htmlFor="negotiated" className="text-sm">I negotiated this offer</Label>
              </div>
            </div>

            <Button 
              onClick={handleSalarySubmit} 
              disabled={isSubmitting}
              className="w-full bg-[#0021A5] hover:bg-[#001878]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
            </Button>
          </TabsContent>

          {/* Interview Tab */}
          <TabsContent value="interview" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Company *</Label>
                <Input
                  value={interviewData.company_name}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="e.g., Google"
                />
              </div>

              <div>
                <Label>Role *</Label>
                <Input
                  value={interviewData.role_title}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, role_title: e.target.value }))}
                  placeholder="e.g., Product Manager"
                />
              </div>

              <div>
                <Label>Interview Round</Label>
                <Select
                  value={interviewData.interview_round}
                  onValueChange={(v) => setInterviewData(prev => ({ ...prev, interview_round: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone_screen">Phone Screen</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="onsite">Onsite</SelectItem>
                    <SelectItem value="final">Final Round</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Question Types Asked</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { key: 'had_behavioral', label: 'Behavioral' },
                    { key: 'had_technical', label: 'Technical' },
                    { key: 'had_case_study', label: 'Case Study' },
                    { key: 'had_product_design', label: 'Product Design' },
                    { key: 'had_estimation', label: 'Estimation' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={interviewData[key]}
                        onCheckedChange={(c) => setInterviewData(prev => ({ ...prev, [key]: c }))}
                      />
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Describe the questions (general terms)</Label>
                <Textarea
                  value={interviewData.question_descriptions}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, question_descriptions: e.target.value }))}
                  placeholder="They asked me to design a product for elderly users, then estimate the market size for..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Tips for future candidates</Label>
                <Textarea
                  value={interviewData.tips_for_candidates}
                  onChange={(e) => setInterviewData(prev => ({ ...prev, tips_for_candidates: e.target.value }))}
                  placeholder="Practice frameworks out loud. They cut you off if you ramble..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select
                  value={interviewData.overall_difficulty}
                  onValueChange={(v) => setInterviewData(prev => ({ ...prev, overall_difficulty: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleInterviewSubmit} 
              disabled={isSubmitting}
              className="w-full bg-[#0021A5] hover:bg-[#001878]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200 mt-4">
          <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-800">
            Your data is never displayed publicly or shared with your identity attached. It only powers aggregated insights for the AI advisor.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}