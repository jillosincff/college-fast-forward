
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { optimizeResume } from '@/functions/optimizeResume';
import { UploadFile } from '@/integrations/Core';
import { trackEvent } from '@/components/utils/analytics';
import { FileText, CheckCircle, AlertCircle, TrendingUp, Zap, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ResultsDisplay = ({ results }) => {
  // After the fix, 'results' will directly be the data object
  // const data = results; // No longer needed, results is already the data
  // The scoreColor logic from original is replaced by new styling in the outline
  
  return (
    <div className="space-y-6 max-w-none">
      {/* Score Section */}
      {results.resume_score_out_of_100 !== undefined && ( // Check for undefined to allow 0 score if applicable
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Resume Score</h3>
            <div className="text-3xl font-bold text-blue-600">
              {results.resume_score_out_of_100}/100
            </div>
          </div>
          {results.score_rationale && (
            <p className="text-slate-700 leading-relaxed">{results.score_rationale}</p>
          )}
        </div>
      )}

      {/* Summary */}
      {results.summary && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Summary
          </h3>
          <p className="text-slate-700 leading-relaxed">{results.summary}</p>
        </div>
      )}

      {/* Strengths */}
      {results.strengths && results.strengths.length > 0 && (
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Key Strengths
          </h3>
          <ul className="space-y-3">
            {results.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-green-800 leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Areas */}
      {results.improvement_areas && results.improvement_areas.length > 0 && (
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            {results.improvement_areas.map((area, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-orange-800 leading-relaxed">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewritten Bullets */}
      {results.rewritten_bullets && results.rewritten_bullets.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Optimized Bullet Points
          </h3>
          <div className="space-y-4">
            {results.rewritten_bullets.map((bullet, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-blue-800 leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ResumeOptimizerModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [state, setState] = useState('initial'); // initial, uploading, analyzing, results, error, upload_error
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'

  const handleClose = () => {
    setState('initial');
    setResults(null);
    setError(null);
    setResumeUrl('');
    setUploadMethod('file');
    onClose();
  };
  
  const processResumeAnalysis = useCallback(async (fileUrl) => {
    setState('analyzing');
    console.log('Starting resume analysis...');
    
    // Step 2: Call the optimization function
    const optimizeResponse = await optimizeResume({ 
      resume_url: fileUrl,
      mode: 'general',
      student_profile: {
        major: user?.major,
        graduation_year: user?.graduation_year,
        persona: user?.persona,
      }
    });
    
    console.log('Full optimization response:', optimizeResponse);
    
    if (!optimizeResponse || !optimizeResponse.data) {
      throw new Error('No response from resume analysis service.');
    }
    
    if (!optimizeResponse.data.success) {
      throw new Error(optimizeResponse.data.error || 'Resume analysis failed.');
    }
    
    // Debug the actual data structure
    const aiResults = optimizeResponse.data.data;
    console.log('AI Results:', aiResults);
    
    if (!aiResults) {
      throw new Error('AI analysis returned no data.');
    }
    
    setResults(aiResults);
    setState('results');
    trackEvent('resume_optimizer_success');
  }, [user]);

  const handleAnalysisError = useCallback((err) => {
    console.error('Resume optimization failed:', err);
    
    let userFriendlyError = 'An error occurred while processing your resume.';
    
    if (err.message?.includes('timeout') || err.message?.includes('DatabaseTimeout')) {
      userFriendlyError = 'Analysis timed out due to server load. Please try again in a few moments.';
    } else if (err.message?.includes('544')) {
      userFriendlyError = 'Server is temporarily busy. Please try again in a few minutes.';
    } else if (err.message?.includes('analysis failed') || err.message?.includes('AI')) {
      userFriendlyError = 'Resume analysis failed. Please try again or contact support.';
    } else if (err.message?.includes('Request failed')) {
      userFriendlyError = 'Network error occurred. Please check your connection and try again.';
    } else {
      userFriendlyError = err.message;
    }
    
    setError(userFriendlyError);
    setState('error');
    trackEvent('resume_optimizer_failed', { error: err.message });
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid File Type', description: 'Please upload a PDF, DOC, or DOCX file.', variant: 'destructive' });
      return;
    }
    
    trackEvent('resume_optimizer_upload_started');
    setState('uploading');
    setError(null);

    try {
      // Step 1: Upload the file with retry logic
      let uploadResponse;
      let uploadAttempts = 0;
      const maxUploadAttempts = 2; // Reduced attempts due to known infrastructure issue
      
      while (uploadAttempts < maxUploadAttempts) {
        try {
          uploadAttempts++;
          console.log(`File upload attempt ${uploadAttempts}/${maxUploadAttempts}`);
          
          uploadResponse = await UploadFile({ file });
          
          if (uploadResponse && uploadResponse.file_url) {
            console.log('File upload successful:', uploadResponse.file_url);
            break; // Success, exit retry loop
          } else {
            throw new Error('Upload succeeded but no file URL returned');
          }
        } catch (uploadErr) {
          console.error(`Upload attempt ${uploadAttempts} failed:`, uploadErr);
          
          if (uploadAttempts === maxUploadAttempts) {
            // Last attempt failed - suggest URL alternative
            throw new Error('FILE_UPLOAD_FAILED');
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      if (!uploadResponse || !uploadResponse.file_url) {
        throw new Error('FILE_UPLOAD_FAILED');
      }
      
      await processResumeAnalysis(uploadResponse.file_url);
      
    } catch (err) {
      console.error('File upload failed:', err);
      
      if (err.message === 'FILE_UPLOAD_FAILED') {
        // Show URL input option
        setError('FILE_UPLOAD_INFRASTRUCTURE_ERROR');
        setState('upload_error');
      } else {
        handleAnalysisError(err);
      }
    }
  }, [toast, processResumeAnalysis, handleAnalysisError]);

  const handleUrlSubmit = useCallback(async () => {
    if (!resumeUrl || !resumeUrl.trim()) {
      toast({ title: 'URL Required', description: 'Please enter a valid resume URL.', variant: 'destructive' });
      return;
    }

    // Basic URL validation
    try {
      new URL(resumeUrl);
    } catch {
      toast({ title: 'Invalid URL', description: 'Please enter a valid HTTP/HTTPS URL.', variant: 'destructive' });
      return;
    }

    setState('analyzing');
    setError(null);
    
    try {
      await processResumeAnalysis(resumeUrl.trim());
    } catch (err) {
      handleAnalysisError(err);
    }
  }, [resumeUrl, toast, processResumeAnalysis, handleAnalysisError]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const onDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);
  
  const onDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const renderContent = () => {
    switch (state) {
      case 'uploading':
        return (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Uploading your resume...</p>
            <p className="text-sm text-slate-600 mt-2">This may take a moment</p>
          </div>
        );
      
      case 'analyzing':
        return (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Analyzing your resume...</p>
            <p className="text-sm text-slate-600 mt-2">Our AI is reviewing and optimizing your content</p>
          </div>
        );

      case 'upload_error':
        return (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-lg font-medium text-slate-900 mb-4">Upload Temporarily Unavailable</p>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Our file upload service is experiencing high traffic. As an alternative, you can paste a public link to your resume instead.
            </p>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label htmlFor="resume-url" className="block text-sm font-medium text-slate-700 mb-2">
                  Resume URL (Google Drive, Dropbox, etc.)
                </label>
                <input
                  id="resume-url"
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setState('initial')} 
                  variant="outline"
                  className="flex-1"
                >
                  Try Upload Again
                </Button>
                <Button 
                  onClick={handleUrlSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!resumeUrl.trim()}
                >
                  Analyze from URL
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-xs text-slate-500">
              <p>💡 Tip: Make sure your resume link is publicly accessible</p>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-lg font-medium text-red-900 mb-4">Analysis Failed</p>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => setState('initial')} 
                variant="outline"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => setState('upload_error')} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Use URL Instead
              </Button>
            </div>
          </div>
        );
      
      case 'results':
        console.log('Rendering results:', results);
        
        if (!results) {
          return (
            <div className="text-center py-12">
              <p className="text-red-600">No results available. Please try again.</p>
              <Button onClick={() => setState('initial')} className="mt-4">
                Start Over
              </Button>
            </div>
          );
        }
        
        return <ResultsDisplay results={results} />;
      
      default: // initial state
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Optimize Your Resume with AI</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Upload your resume and get personalized suggestions to improve your job search success.
            </p>
            
            {/* Method Selection */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    uploadMethod === 'file' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    uploadMethod === 'url' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Use URL
                </button>
              </div>
            </div>
            
            {uploadMethod === 'file' ? (
              <div className="space-y-4">
                <div 
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">Drag and drop your resume here</p>
                  <p className="text-sm text-slate-500">Supports PDF, DOC, and DOCX files</p>
                </div>
                
                <div className="text-center">
                  <span className="text-slate-500">or</span>
                </div>
                
                <div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors"
                  >
                    Choose File to Upload
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label htmlFor="resume-url-main" className="block text-sm font-medium text-slate-700 mb-2">
                    Resume URL (Google Drive, Dropbox, etc.)
                  </label>
                  <input
                    id="resume-url-main"
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <Button 
                  onClick={handleUrlSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!resumeUrl.trim()}
                >
                  Analyze Resume from URL
                </Button>
                
                <div className="text-xs text-slate-500 space-y-1">
                  <p>💡 Make sure your resume link is publicly accessible</p>
                  <p>📄 Supports Google Drive, Dropbox, OneDrive, and direct file links</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-slate-200">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Resume Optimizer
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {state === 'results' && (
          <div className="flex-shrink-0 pt-4 border-t border-slate-200 flex justify-end">
            <Button 
              onClick={() => setState('initial')} 
              variant="outline" 
              className="mr-3"
            >
              Analyze Another Resume
            </Button>
            <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
