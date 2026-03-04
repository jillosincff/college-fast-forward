import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Check, Loader2, Sparkles, ClipboardPaste } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function ResumeUploadStep({ user, onResumeReady, onStartBuilder }) {
  const [mode, setMode] = useState(null); // null, 'upload', 'paste'
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedSummary, setParsedSummary] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [pasteText, setPasteText] = useState('');
  const fileRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setParsing(true);
      setUploading(false);
      
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            full_text: { type: "string", description: "The complete resume text content" },
            name: { type: "string" },
            companies: { type: "array", items: { type: "string" }, description: "Companies the person worked at" },
            skills: { type: "array", items: { type: "string" }, description: "Key skills mentioned" },
            education: { type: "string", description: "Education summary" },
            gpa: { type: "string" },
            coursework: { type: "array", items: { type: "string" } },
            experience_summary: { type: "string", description: "Brief summary of work experience" }
          },
          required: ["full_text"]
        }
      });

      if (extracted.status === 'success' && extracted.output) {
        const data = extracted.output;
        setResumeText(data.full_text || '');
        setParsedSummary({
          companies: data.companies || [],
          skills: data.skills || [],
          education: data.education || '',
          gpa: data.gpa || '',
          coursework: data.coursework || [],
          experience_summary: data.experience_summary || '',
          name: data.name || '',
        });
      } else {
        setParsedSummary({ error: true });
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setParsedSummary({ error: true });
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteText.trim()) return;
    setParsing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse this resume text and extract structured information.\n\nRESUME:\n${pasteText.substring(0, 5000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            companies: { type: "array", items: { type: "string" } },
            skills: { type: "array", items: { type: "string" } },
            education: { type: "string" },
            gpa: { type: "string" },
            coursework: { type: "array", items: { type: "string" } },
            experience_summary: { type: "string" },
            name: { type: "string" }
          },
          required: ["companies", "skills", "education"]
        }
      });
      setResumeText(pasteText);
      setParsedSummary({
        companies: result.companies || [],
        skills: result.skills || [],
        education: result.education || '',
        gpa: result.gpa || '',
        coursework: result.coursework || [],
        experience_summary: result.experience_summary || '',
        name: result.name || '',
      });
    } catch (err) {
      setResumeText(pasteText);
      setParsedSummary({ error: true });
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = () => {
    onResumeReady(resumeText, parsedSummary);
  };

  // Initial choice screen
  if (!mode && !parsedSummary) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setMode('upload')}
          className="w-full flex items-center gap-4 p-5 rounded-xl text-left transition-all bg-white/10 text-white/90 hover:bg-white/15 border border-white/10 hover:border-[#FA4616]/50"
          style={{ minHeight: 'auto' }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#FA4616]/20 flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-[#FA4616]" />
          </div>
          <div>
            <span className="font-bold text-base block">Upload or paste my resume</span>
            <span className="text-white/50 text-sm">PDF, DOCX, or paste the text</span>
          </div>
        </button>

        <button
          onClick={onStartBuilder}
          className="w-full flex items-center gap-4 p-5 rounded-xl text-left transition-all bg-white/10 text-white/90 hover:bg-white/15 border border-white/10 hover:border-purple-400/50"
          style={{ minHeight: 'auto' }}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <span className="font-bold text-base block">I don't have a resume yet</span>
            <span className="text-white/50 text-sm">No worries — I'll help you build one</span>
          </div>
        </button>

        <p className="text-white/30 text-xs text-center mt-4">
          You can always update your resume later
        </p>
      </div>
    );
  }

  // Upload / paste mode
  if (mode && !parsedSummary) {
    return (
      <div className="space-y-5">
        {/* File upload */}
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || parsing}
          className="w-full flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-white/20 hover:border-[#FA4616]/50 text-white/70 hover:text-white transition-all"
          style={{ minHeight: 'auto' }}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#FA4616]" />
          ) : (
            <Upload className="w-8 h-8 text-white/50" />
          )}
          <span className="text-sm font-medium">
            {uploading ? 'Uploading...' : 'Click to upload PDF or DOCX'}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/30 text-xs font-semibold">OR PASTE</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your resume text here..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[180px] text-sm"
          rows={8}
        />
        {pasteText.trim() && (
          <Button
            onClick={handlePasteSubmit}
            disabled={parsing}
            className="w-full bg-[#FA4616] hover:bg-orange-600 text-white h-12 font-semibold"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ClipboardPaste className="w-4 h-4 mr-2" />}
            {parsing ? 'Analyzing...' : 'Submit Resume Text'}
          </Button>
        )}

        {parsing && (
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#FA4616]" />
            <span className="text-white/70 text-sm">FASTIQ is reading your resume...</span>
          </div>
        )}

        <button
          onClick={() => setMode(null)}
          className="text-white/40 text-xs hover:text-white/60 underline"
          style={{ minHeight: 'auto' }}
        >
          ← Back to options
        </button>
      </div>
    );
  }

  // Parsed confirmation
  if (parsedSummary) {
    if (parsedSummary.error) {
      return (
        <div className="space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <p className="text-white/80 text-sm mb-3">
              I had trouble reading your resume, but I saved the text. You can update it later in the chat.
            </p>
            <Button onClick={handleConfirm} className="w-full bg-[#FA4616] hover:bg-orange-600 text-white h-12 font-semibold">
              <Check className="w-4 h-4 mr-2" /> Continue anyway
            </Button>
          </div>
        </div>
      );
    }

    const companies = parsedSummary.companies?.filter(Boolean) || [];
    const skills = parsedSummary.skills?.filter(Boolean) || [];
    const education = parsedSummary.education || '';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold text-sm">Got it!</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            I can see {companies.length > 0 ? `your experience at ${companies.slice(0, 2).join(' and ')}${companies.length > 2 ? ` (+${companies.length - 2} more)` : ''}` : 'your experience'}{skills.length > 0 ? `, your ${skills.slice(0, 3).join(', ')} skills` : ''}{education ? `, and your ${education}` : ''}. I'll use this to personalize everything.
          </p>
        </div>

        {companies.length > 0 && (
          <div>
            <p className="text-white/40 text-xs font-semibold mb-2">EXPERIENCE</p>
            <div className="flex flex-wrap gap-2">
              {companies.map((c, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <p className="text-white/40 text-xs font-semibold mb-2">KEY SKILLS</p>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 10).map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-[#FA4616]/10 text-[#FA4616] text-xs font-medium border border-[#FA4616]/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleConfirm} className="w-full bg-[#FA4616] hover:bg-orange-600 text-white h-12 font-semibold">
          <Sparkles className="w-4 h-4 mr-2" /> Looks great — activate FASTIQ
        </Button>
      </motion.div>
    );
  }

  return null;
}