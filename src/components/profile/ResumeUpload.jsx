import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, Sparkles, AlertCircle, CheckCircle, 
  Download, Trash2, Loader2, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { analyzeResume } from '@/functions/analyzeResume';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResumeUpload({ user, onResumeUpdated }) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDescInput, setShowJobDescInput] = useState(false);
  const [analysis, setAnalysis] = useState(user?.resume_analysis || null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Resume must be under 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Update user profile
      await base44.auth.updateMe({
        resume_url: file_url,
        resume_uploaded_at: new Date().toISOString()
      });

      toast({
        title: "✅ Resume Uploaded!",
        description: "Your resume has been uploaded successfully"
      });

      if (onResumeUpdated) {
        onResumeUpdated({ resume_url: file_url });
      }

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!user?.resume_url) {
      toast({
        title: "No Resume Found",
        description: "Please upload a resume first",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);

    try {
      const { data } = await analyzeResume({
        resume_url: user.resume_url,
        job_description: jobDescription || undefined
      });

      if (data.success) {
        setAnalysis(data.analysis);
        toast({
          title: "✅ Analysis Complete!",
          description: "Your resume has been analyzed"
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;

    try {
      await base44.auth.updateMe({
        resume_url: null,
        resume_uploaded_at: null,
        resume_analysis: {}
      });

      setAnalysis(null);
      
      toast({
        title: "Resume Deleted",
        description: "Your resume has been removed"
      });

      if (onResumeUpdated) {
        onResumeUpdated({ resume_url: null });
      }

    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Resume Upload
          </CardTitle>
          <CardDescription>
            Upload your resume and get AI-powered improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.resume_url ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Resume uploaded on {new Date(user.resume_uploaded_at).toLocaleDateString()}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(user.resume_url, '_blank')}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  View Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-base font-semibold mb-2 block">
                  Replace Resume
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="text-lg font-semibold text-slate-700 mb-2">
                    Click to upload your resume
                  </div>
                  <div className="text-sm text-slate-500">
                    PDF or Word document (max 5MB)
                  </div>
                </Label>
                <Input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              {uploading && (
                <div className="text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-slate-600 mt-2">Uploading...</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      {user?.resume_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Resume Analysis
            </CardTitle>
            <CardDescription>
              Get personalized suggestions to improve your resume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Add a job description (optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowJobDescInput(!showJobDescInput)}
                >
                  {showJobDescInput ? 'Hide' : 'Add Job Description'}
                </Button>
              </div>

              {showJobDescInput && (
                <Textarea
                  placeholder="Paste the job description here to get tailored suggestions..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  className="text-sm"
                />
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze My Resume
                </>
              )}
            </Button>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6 pt-4 border-t">
                {/* Overall Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Overall Score</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {analysis.overall_score}/100
                    </span>
                  </div>
                  <Progress value={analysis.overall_score} className="h-3" />
                </div>

                {/* Summary */}
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>{analysis.summary}</AlertDescription>
                </Alert>

                {/* ATS Status */}
                {analysis.ats_friendly ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your resume is ATS-friendly! ✅
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Your resume may have ATS compatibility issues
                    </AlertDescription>
                  </Alert>
                )}

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-slate-700 pl-4 border-l-2 border-green-400">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Suggested Improvements
                    </h4>
                    <div className="space-y-3">
                      {analysis.improvements.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${getPriorityColor(item.priority)}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-sm">{item.category}</span>
                            <span className="text-xs uppercase font-bold">{item.priority}</span>
                          </div>
                          <p className="text-sm">{item.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {analysis.keywords_missing?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">
                      Missing Keywords (Add These!)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords_missing.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formatting Tips */}
                {analysis.formatting_tips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-2">
                      Formatting Tips
                    </h4>
                    <ul className="space-y-2">
                      {analysis.formatting_tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ATS Issues */}
                {analysis.ats_issues?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">
                      ATS Compatibility Issues
                    </h4>
                    <ul className="space-y-2">
                      {analysis.ats_issues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}