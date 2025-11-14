import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';

export default function CompanyReviewCard({ review }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating_overall
                        ? 'text-yellow-500 fill-current'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg text-slate-900">
                {review.rating_overall.toFixed(1)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{review.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="font-semibold">
                {review.is_anonymous ? 'Anonymous' : review.reviewer_name}
              </span>
              {review.reviewer_role && (
                <>
                  <span>•</span>
                  <span>{review.reviewer_role}</span>
                </>
              )}
              <span>•</span>
              <Badge variant="outline" className="capitalize">
                {review.employment_status.replace('_', ' ')}
              </Badge>
              <Badge className="capitalize">
                {review.review_type.replace('_', ' ')}
              </Badge>
              {review.is_verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Verified</span>
                </div>
              )}
            </div>
            {(review.start_date || review.end_date) && (
              <p className="text-sm text-slate-500 mt-1">
                {formatDate(review.start_date)}
                {review.end_date && ` - ${formatDate(review.end_date)}`}
              </p>
            )}
          </div>
        </div>

        {/* Detailed Ratings */}
        {(review.rating_culture || review.rating_compensation || review.rating_work_life_balance || review.rating_career_growth) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            {review.rating_culture > 0 && (
              <div className="text-center">
                <div className="text-sm text-slate-600">Culture</div>
                <div className="font-bold text-lg">{review.rating_culture.toFixed(1)}</div>
              </div>
            )}
            {review.rating_compensation > 0 && (
              <div className="text-center">
                <div className="text-sm text-slate-600">Compensation</div>
                <div className="font-bold text-lg">{review.rating_compensation.toFixed(1)}</div>
              </div>
            )}
            {review.rating_work_life_balance > 0 && (
              <div className="text-center">
                <div className="text-sm text-slate-600">Work-Life</div>
                <div className="font-bold text-lg">{review.rating_work_life_balance.toFixed(1)}</div>
              </div>
            )}
            {review.rating_career_growth > 0 && (
              <div className="text-center">
                <div className="text-sm text-slate-600">Growth</div>
                <div className="font-bold text-lg">{review.rating_career_growth.toFixed(1)}</div>
              </div>
            )}
          </div>
        )}

        {/* Pros */}
        <div className="mb-4">
          <h4 className="font-semibold text-slate-900 mb-2">✅ Pros</h4>
          <p className="text-slate-700 leading-relaxed">{review.pros}</p>
        </div>

        {/* Cons */}
        {review.cons && (
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-2">⚠️ Cons</h4>
            <p className="text-slate-700 leading-relaxed">{review.cons}</p>
          </div>
        )}

        {/* Advice to Management */}
        {review.advice_to_management && (
          <div className="mb-4">
            <h4 className="font-semibold text-slate-900 mb-2">💡 Advice to Management</h4>
            <p className="text-slate-700 leading-relaxed">{review.advice_to_management}</p>
          </div>
        )}

        {/* Interview Experience */}
        {review.interview_experience && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Interview Experience</h4>
            <p className="text-blue-800 leading-relaxed">{review.interview_experience}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-500">
            Posted {new Date(review.created_date).toLocaleDateString()}
          </div>
          <Button variant="ghost" size="sm" className="text-slate-600">
            <ThumbsUp className="w-4 h-4 mr-1" />
            Helpful ({review.helpful_count || 0})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}