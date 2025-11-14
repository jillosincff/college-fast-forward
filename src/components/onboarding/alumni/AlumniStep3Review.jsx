
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, ExternalLink, Loader2 } from "lucide-react";
import UserAvatar from '@/components/common/UserAvatar';
import { motion } from 'framer-motion'; // Import motion from framer-motion

export default function AlumniStep3Review({ formData, user, onEdit, onBack, onSubmit, isSubmitting }) {
  
  const ReviewItem = ({ label, value, step, isArray = false }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {/* Render value, handling arrays and LinkedIn URL if it's the LinkedIn item */}
        {label === "LinkedIn" && value ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 underline"
          >
            {value} <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <p className="font-medium text-slate-800">
            {isArray && Array.isArray(value) ? value.join(', ') : value || 'Not provided'}
          </p>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={() => onEdit(step)} aria-label={`Edit ${label}`}>
        <Edit className="w-4 h-4 text-slate-500" />
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-8"
    >
      <div className="text-center mb-8">
        <div className="inline-block bg-green-100 p-3 rounded-full mb-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Review & Confirm</h2>
        <p className="text-slate-600">One last look to make sure everything is perfect.</p>
      </div>

      <Card className="w-full max-w-xl mx-auto shadow-md">
        <CardHeader className="bg-slate-50 flex flex-row items-center gap-4 p-4 rounded-t-lg">
          <UserAvatar 
            user={{ ...user, ...formData }} // Merging user and formData for avatar data
            className="w-16 h-16 text-2xl" 
          />
          <div>
            <CardTitle className="text-xl">{formData.full_name}</CardTitle>
            <CardDescription>{formData.current_position} at {formData.current_company}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <ReviewItem label="Full Name" value={formData.full_name} step={1} />
          <ReviewItem label="Graduation Year" value={formData.graduation_year} step={1} />
          <ReviewItem label="Major" value={formData.major} step={1} />
          <ReviewItem label="Current Role" value={`${formData.current_position} at ${formData.current_company}`} step={1} />
          <ReviewItem label="Location" value={formData.location} step={1} />
          <ReviewItem label="Industry" value={formData.industry} step={2} />
          <ReviewItem label="Ways to Help" value={formData.ways_to_help} step={2} isArray={true} />
          <ReviewItem label="LinkedIn" value={formData.linkedin_url} step={2} />
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          size="lg" 
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
        </Button>
      </div>
    </motion.div>
  );
}
