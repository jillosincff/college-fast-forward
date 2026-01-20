import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { SalarySubmission } from '@/entities/SalarySubmission';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { DollarSign, Lock, Loader2 } from 'lucide-react';

const INDUSTRIES = [
  'Technology',
  'Finance & Banking',
  'Consulting',
  'Healthcare',
  'Marketing & Advertising',
  'Law & Legal',
  'Engineering',
  'Real Estate',
  'Media & Entertainment',
  'Retail & Consumer',
  'Manufacturing',
  'Education',
  'Non-Profit',
  'Government',
  'Other'
];

const LOCATIONS = [
  'San Francisco Bay Area',
  'New York City',
  'Los Angeles',
  'Seattle',
  'Boston',
  'Austin',
  'Chicago',
  'Denver',
  'Atlanta',
  'Miami / South Florida',
  'Washington D.C.',
  'Dallas / Fort Worth',
  'Other US',
  'International'
];

const EXPERIENCE_BANDS = [
  { value: '0-2', label: '0-2 years (Entry Level)' },
  { value: '3-5', label: '3-5 years (Mid Level)' },
  { value: '6-10', label: '6-10 years (Senior)' },
  { value: '11-15', label: '11-15 years (Director/Manager)' },
  { value: '16+', label: '16+ years (Executive)' }
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

export default function SalarySubmissionForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    industry: '',
    years_experience_band: '',
    location: '',
    is_remote: false,
    base_salary: '',
    annual_bonus: '',
    stock_equity: '',
    is_current_role: true,
    data_year: currentYear,
    negotiation_advice: ''
  });

  const totalComp = (parseInt(formData.base_salary) || 0) + 
                    (parseInt(formData.annual_bonus) || 0) + 
                    (parseInt(formData.stock_equity) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.job_title || !formData.industry || !formData.years_experience_band || 
        !formData.location || !formData.base_salary) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await SalarySubmission.create({
        ...formData,
        user_id: user.id,
        job_title_normalized: formData.job_title.toLowerCase().trim(),
        company_normalized: formData.company?.toLowerCase().trim() || null,
        base_salary: parseInt(formData.base_salary),
        annual_bonus: formData.annual_bonus ? parseInt(formData.annual_bonus) : null,
        stock_equity: formData.stock_equity ? parseInt(formData.stock_equity) : null,
        total_comp: totalComp,
        data_year: parseInt(formData.data_year)
      });

      toast.success('Thank you! Your salary data has been submitted anonymously.');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting salary:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Share Your Salary Data</h2>
        <p className="text-gray-600 mt-2">
          Help students know their worth. Your response is completely anonymous.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="job_title">Job Title *</Label>
          <Input
            id="job_title"
            placeholder="e.g., Product Marketing Manager"
            value={formData.job_title}
            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="company">Company (optional but encouraged)</Label>
          <Input
            id="company"
            placeholder="e.g., Google"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">💡 Company names help students compare offers</p>
        </div>

        <div>
          <Label>Industry *</Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => setFormData({ ...formData, industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry..." />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(ind => (
                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Years of Experience *</Label>
          <RadioGroup
            value={formData.years_experience_band}
            onValueChange={(value) => setFormData({ ...formData, years_experience_band: value })}
            className="mt-2 space-y-2"
          >
            {EXPERIENCE_BANDS.map(band => (
              <div key={band.value} className="flex items-center space-x-2">
                <RadioGroupItem value={band.value} id={band.value} />
                <Label htmlFor={band.value} className="font-normal cursor-pointer">
                  {band.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label>Location *</Label>
          <Select 
            value={formData.location} 
            onValueChange={(value) => setFormData({ ...formData, location: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select metro area..." />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="is_remote"
              checked={formData.is_remote}
              onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
            />
            <Label htmlFor="is_remote" className="font-normal cursor-pointer">Remote position</Label>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Compensation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="base_salary">Base Salary (annual) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="base_salary"
                  type="number"
                  className="pl-7"
                  placeholder="120000"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="annual_bonus">Annual Bonus</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="annual_bonus"
                  type="number"
                  className="pl-7"
                  placeholder="20000"
                  value={formData.annual_bonus}
                  onChange={(e) => setFormData({ ...formData, annual_bonus: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="stock_equity">Stock/Equity (annual)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="stock_equity"
                  type="number"
                  className="pl-7"
                  placeholder="50000"
                  value={formData.stock_equity}
                  onChange={(e) => setFormData({ ...formData, stock_equity: e.target.value })}
                />
              </div>
            </div>
          </div>

          {totalComp > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Total Compensation:</strong> {formatCurrency(totalComp)}
              </p>
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-4">
          <div>
            <Label>Is this your current role? *</Label>
            <RadioGroup
              value={formData.is_current_role ? 'current' : 'previous'}
              onValueChange={(value) => setFormData({ ...formData, is_current_role: value === 'current' })}
              className="mt-2 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current" className="font-normal cursor-pointer">Yes, current role</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="previous" id="previous" />
                <Label htmlFor="previous" className="font-normal cursor-pointer">No, previous role (within last 2 years)</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Year of this data *</Label>
            <Select 
              value={String(formData.data_year)} 
              onValueChange={(value) => setFormData({ ...formData, data_year: parseInt(value) })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border-t pt-4">
          <Label htmlFor="negotiation_advice">Any advice for students negotiating in this field? (optional)</Label>
          <Textarea
            id="negotiation_advice"
            placeholder="e.g., Always negotiate. I got $15K more just by asking politely..."
            value={formData.negotiation_advice}
            onChange={(e) => setFormData({ ...formData, negotiation_advice: e.target.value })}
            rows={3}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          Your name will never be attached to this data
        </div>
        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Anonymously'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}