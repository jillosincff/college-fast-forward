import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { CompanyReview } from '@/entities/CompanyReview';
import { Company } from '@/entities/Company';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function CompanyReviewForm({ company, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    review_type: 'internship',
    employment_status: 'former',
    reviewer_role: '',
    rating_overall: 0,
    rating_culture: 0,
    rating_compensation: 0,
    rating_work_life_balance: 0,
    rating_career_growth: 0,
    title: '',
    pros: '',
    cons: '',
    advice_to_management: '',
    interview_experience: '',
    is_anonymous: false,
    start_date: '',
    end_date: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (field, rating) => {
    setFormData({ ...formData, [field]: rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rating_overall || !formData.title || !formData.pros) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await CompanyReview.create({
        company_id: company.id,
        company_name: company.name,
        reviewer_id: user.id,
        reviewer_name: formData.is_anonymous ? 'Anonymous' : user.full_name,
        ...formData,
        is_approved: false // Requires admin approval
      });

      // Update company review stats
      const allReviews = await CompanyReview.filter({ company_id: company.id });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating_overall, 0) / allReviews.length;
      await Company.update(company.id, {
        review_count: allReviews.length,
        average_rating: avgRating
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingInput = ({ label, field, value }) => (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleRatingClick(field, rating)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                rating <= value
                  ? 'text-yellow-500 fill-current'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Write a Review for {company.name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Experience Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Type of Experience</Label>
              <Select
                value={formData.review_type}
                onValueChange={(value) => setFormData({ ...formData, review_type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="full_time">Full-time Employee</SelectItem>
                  <SelectItem value="interview">Interview Experience</SelectItem>
                  <SelectItem value="general">General Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Employment Status</Label>
              <Select
                value={formData.employment_status}
                onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Employee</SelectItem>
                  <SelectItem value="former">Former Employee</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role */}
          <div>
            <Label>Your Role/Position</Label>
            <Input
              value={formData.reviewer_role}
              onChange={(e) => setFormData({ ...formData, reviewer_role: e.target.value })}
              placeholder="e.g., Marketing Intern, Software Engineer"
              className="mt-1"
            />
          </div>

          {/* Ratings */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-900">Rate Your Experience *</h4>
            <RatingInput label="Overall Rating" field="rating_overall" value={formData.rating_overall} />
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <RatingInput label="Culture" field="rating_culture" value={formData.rating_culture} />
              <RatingInput label="Compensation" field="rating_compensation" value={formData.rating_compensation} />
              <RatingInput label="Work-Life Balance" field="rating_work_life_balance" value={formData.rating_work_life_balance} />
              <RatingInput label="Career Growth" field="rating_career_growth" value={formData.rating_career_growth} />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label>Review Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience in one sentence"
              className="mt-1"
              required
            />
          </div>

          {/* Pros */}
          <div>
            <Label>What are the pros? *</Label>
            <Textarea
              value={formData.pros}
              onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
              placeholder="What did you like about working here?"
              className="mt-1 h-24"
              required
            />
          </div>

          {/* Cons */}
          <div>
            <Label>What are the cons?</Label>
            <Textarea
              value={formData.cons}
              onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
              placeholder="What could be improved?"
              className="mt-1 h-24"
            />
          </div>

          {/* Advice */}
          <div>
            <Label>Advice to Management (optional)</Label>
            <Textarea
              value={formData.advice_to_management}
              onChange={(e) => setFormData({ ...formData, advice_to_management: e.target.value })}
              placeholder="What would you suggest to improve the company?"
              className="mt-1 h-20"
            />
          </div>

          {/* Interview Experience */}
          {formData.review_type === 'interview' && (
            <div>
              <Label>Interview Experience</Label>
              <Textarea
                value={formData.interview_experience}
                onChange={(e) => setFormData({ ...formData, interview_experience: e.target.value })}
                placeholder="Describe the interview process, questions asked, timeline, etc."
                className="mt-1 h-24"
              />
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1"
              />
            </div>
            {formData.employment_status === 'former' && (
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Anonymous */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="font-semibold">Post Anonymously</Label>
              <p className="text-sm text-slate-600 mt-1">
                Your name will be hidden from the review
              </p>
            </div>
            <Switch
              checked={formData.is_anonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, is_anonymous: checked })}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}