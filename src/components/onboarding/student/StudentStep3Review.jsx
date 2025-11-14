
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, PartyPopper, Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ReviewItem = ({ label, value, icon: Icon }) => (
  <div className="flex justify-between items-start py-3 border-b border-slate-200">
    <div className="flex items-center">
      {Icon && <Icon className="w-4 h-4 mr-2 text-slate-500" />}
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <span className="font-semibold text-slate-900 text-sm text-right">{value || 'Not provided'}</span>
  </div>
);

export default function StudentStep3Review({ formData, onBack, onSubmit, isSubmitting }) {
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="text-center mb-8">
        <div className="text-sm text-slate-500 mb-4">Step 2 of 2</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
          <PartyPopper className="w-8 h-8 text-[var(--uf-orange)]" />
          You're All Set!
        </h2>
        <p className="text-slate-600">Please review your information below. You can always change this later from your profile.</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
          <Avatar className="w-16 h-16 text-2xl">
            <AvatarImage src={formData.profile_image_url} alt="Profile Photo" />
            <AvatarFallback className="bg-slate-200">{getInitials(formData.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{formData.full_name}</CardTitle>
            <CardDescription>Student Profile Summary</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <ReviewItem label="Full Name" value={formData.full_name} />
            <ReviewItem label="Graduation Year" value={formData.graduation_year} />
            <ReviewItem label="Major" value={formData.major} />
            <ReviewItem label="Location" value={formData.location} />
            <ReviewItem label="LinkedIn" value={formData.linkedin_url} icon={Linkedin} />
            <ReviewItem label="Include in Directory" value={formData.includeInDirectory ? 'Yes' : 'No'} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Completing...
            </>
          ) : (
            <>
              Complete Profile
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
