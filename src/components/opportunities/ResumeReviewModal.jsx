
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { UploadFile } from '@/integrations/Core';
import { optimizeResume } from '@/functions/optimizeResume';
import { Upload, FileText, Star, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export default function ResumeReviewModal({ isOpen, onClose, user }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Accept PDF, DOC, and DOCX files
      const allowedTypes = [
        'application/pdf',
        'application/msword', // for .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // for .docx
      ];
      
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setReviewResult(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmitReview = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload your resume first.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setAnalyzing(true);

    try {
      // First upload the file
      console.log('Uploading file:', file.name);
      const uploadResult = await UploadFile({ file });
      console.log('Upload result:', uploadResult);

      if (!uploadResult?.file_url) {
        throw new Error('Failed to upload file');
      }

      // Then analyze the resume
      console.log('Analyzing resume at URL:', uploadResult.file_url);
      const analysisResult = await optimizeResume({ 
        resume_url: uploadResult.file_url,
        additional_notes: additionalNotes 
      });
      console.log('Analysis result:', analysisResult);

      if (analysisResult?.success && analysisResult?.data) {
        setReviewResult(analysisResult.data);
        toast({
          title: "✅ Resume Analyzed!",
          description: "Your resume has been reviewed by AI. Check the feedback below.",
        });
      } else {
        throw new Error(analysisResult?.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Resume review error:', error);
      toast({
        title: "Review Failed",
        description: error.message || "Unable to analyze your resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setReviewResult(null);
    setAdditionalNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            AI Resume Review
          </DialogTitle>
        </DialogHeader>

        {!reviewResult ? (
          <div className="space-y-6">
            {/* Upload Section */}
            <div>
              <Label>Upload Your Resume</Label>
              <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {!file ? (
                  <div>
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF, DOC, or DOCX files only, max 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Label htmlFor="resume-upload" className="cursor-pointer">
                      <Button variant="outline" className="mt-4">
                        Select File
                      </Button>
                    </Label>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes">Additional Context (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Tell us about the types of roles you're targeting, specific industries, or any particular feedback you're looking for..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="mt-1 h-24"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">{additionalNotes.length}/500 characters</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">What You'll Get:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Professional summary rewrite</li>
                <li>• Top 3 strengths identified</li>
                <li>• Areas for improvement</li>
                <li>• 3-5 rewritten bullet points using STAR method</li>
                <li>• Overall resume score and feedback</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Supported formats:</strong> PDF, Microsoft Word (DOC/DOCX)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={!file || uploading || analyzing}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {analyzing ? 'Analyzing...' : 'Uploading...'}
                  </>
                ) : (
                  'Get Review'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Review Results */
          <div className="space-y-6">
            {/* Score */}
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {reviewResult.resume_score_out_of_100}/100
              </div>
              <p className="text-slate-600">{reviewResult.score_rationale}</p>
            </div>

            {/* Professional Summary */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Improved Professional Summary
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border">
                <p className="text-slate-800 leading-relaxed">{reviewResult.summary}</p>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Top Strengths
              </h3>
              <ul className="space-y-2">
                {reviewResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {reviewResult.improvement_areas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improved Bullet Points */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Rewritten Bullet Points (STAR Method)
              </h3>
              <div className="space-y-3">
                {reviewResult.rewritten_bullets.map((bullet, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-slate-800">{bullet}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Review Another Resume
              </Button>
              <Button onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
