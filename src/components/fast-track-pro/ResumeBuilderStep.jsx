import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Download, Pencil, Check, Sparkles, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const BUILDER_STEPS = [
  {
    id: 'contact',
    question: "Let's start with the basics — what's your full name, phone number, and LinkedIn URL (if you have one)?",
    encourage: "This goes at the top of your resume.",
    fields: ['name', 'phone', 'linkedin'],
  },
  {
    id: 'education',
    question: "Tell me about your education. What's your major, expected graduation, and GPA if you're comfortable sharing?",
    encourage: "Your UF degree is a huge asset — let's make it shine.",
    fields: ['major', 'graduation', 'gpa', 'coursework'],
  },
  {
    id: 'experience',
    question: "Have you had any jobs, internships, or volunteer work? Even part-time or campus jobs count! Tell me about each one.",
    encourage: "Campus jobs totally count — employers love seeing work ethic.",
    fields: ['experience_text'],
    isLongForm: true,
  },
  {
    id: 'projects',
    question: "Any relevant projects? Class projects, personal projects, hackathons, case competitions?",
    encourage: "Class projects are great — especially if you can show results.",
    fields: ['projects_text'],
    isLongForm: true,
  },
  {
    id: 'skills',
    question: "What are your top skills? Technical skills, software, languages?",
    encourage: "Include anything you're comfortable using professionally.",
    fields: ['skills_text'],
  },
  {
    id: 'extras',
    question: "Any certifications, awards, or leadership roles? Club president, Dean's list, anything?",
    encourage: "Don't worry about having a lot — I'll make what you have shine.",
    fields: ['extras_text'],
    isLongForm: true,
  },
];

export default function ResumeBuilderStep({ user, onResumeReady, onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: user?.full_name || '',
    phone: '',
    linkedin: '',
    major: user?.major || '',
    graduation: user?.graduation_year ? String(user.graduation_year) : '',
    gpa: '',
    coursework: '',
    experience_text: '',
    projects_text: '',
    skills_text: '',
    extras_text: '',
  });
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentStep]);

  const step = BUILDER_STEPS[currentStep];
  const isLastStep = currentStep === BUILDER_STEPS.length - 1;

  const getCurrentValue = () => {
    if (step.isLongForm) return answers[step.fields[0]] || '';
    return step.fields.map(f => answers[f]).filter(Boolean).join(' | ');
  };

  const canProceed = () => {
    // At least one field should have content
    return step.fields.some(f => (answers[f] || '').trim().length > 0);
  };

  const handleNext = () => {
    if (isLastStep) {
      generateResume();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      generateResume();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const generateResume = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are FASTIQ, helping a UF student build their first resume. Generate a complete, professionally formatted resume from this information. Strengthen weak bullet points — make them quantified and impactful.

STUDENT INFO:
- Name: ${answers.name || user?.full_name || 'Student'}
- Email: ${user?.email || ''}
- Phone: ${answers.phone || ''}
- LinkedIn: ${answers.linkedin || ''}

EDUCATION:
- University of Florida
- Major: ${answers.major || user?.major || 'Undeclared'}
- Expected Graduation: ${answers.graduation || user?.graduation_year || 'TBD'}
- GPA: ${answers.gpa || 'Not provided'}
- Relevant Coursework: ${answers.coursework || 'Not provided'}

EXPERIENCE:
${answers.experience_text || 'No experience provided — create a section header but leave it minimal.'}

PROJECTS:
${answers.projects_text || 'No projects provided.'}

SKILLS:
${answers.skills_text || 'Not provided.'}

CERTIFICATIONS / AWARDS / LEADERSHIP:
${answers.extras_text || 'Not provided.'}

RULES:
1. Format as a clean, professional resume in plain text
2. Strengthen weak descriptions (e.g., "I helped with social media" → "Managed social media content calendar across Instagram and Twitter, increasing follower engagement by 25%")
3. Use strong action verbs (Led, Developed, Managed, Analyzed, Created, etc.)
4. Add quantified results where possible
5. Keep it to 1 page worth of content
6. If experience is thin, emphasize education, projects, and leadership
7. Be encouraging — this student might have more value than they realize

Return the full resume text and a brief encouraging summary.`,
        response_json_schema: {
          type: "object",
          properties: {
            resume_text: { type: "string", description: "The complete formatted resume" },
            summary: { type: "string", description: "Brief encouraging summary of what was included" },
            companies_extracted: { type: "array", items: { type: "string" } },
            skills_extracted: { type: "array", items: { type: "string" } },
            education_summary: { type: "string" }
          },
          required: ["resume_text", "summary"]
        }
      });

      setGeneratedResume(result);
      setEditText(result.resume_text || '');
    } catch (err) {
      console.error('Resume generation error:', err);
      // Fallback: create basic resume from answers
      const basicResume = `${answers.name || user?.full_name}\n${user?.email || ''}\n${answers.phone || ''}\n\nEDUCATION\nUniversity of Florida\n${answers.major || ''} | Expected ${answers.graduation || ''}\n${answers.gpa ? `GPA: ${answers.gpa}` : ''}\n\nEXPERIENCE\n${answers.experience_text || 'N/A'}\n\nPROJECTS\n${answers.projects_text || 'N/A'}\n\nSKILLS\n${answers.skills_text || 'N/A'}`;
      setGeneratedResume({ resume_text: basicResume, summary: "Here's your resume! You can edit it anytime." });
      setEditText(basicResume);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveResume = () => {
    const text = editing ? editText : generatedResume.resume_text;
    const parsed = {
      companies: generatedResume.companies_extracted || [],
      skills: generatedResume.skills_extracted || [],
      education: generatedResume.education_summary || answers.major || '',
      gpa: answers.gpa || '',
      coursework: answers.coursework ? answers.coursework.split(',').map(s => s.trim()) : [],
    };
    onResumeReady(text, parsed);
  };

  const handleDownload = () => {
    const text = editing ? editText : generatedResume.resume_text;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(answers.name || 'resume').replace(/\s+/g, '_')}_Resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generating state
  if (generating) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-[#FA4616]" />
          <Sparkles className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <p className="text-white/80 text-sm font-medium">Building your resume...</p>
        <p className="text-white/40 text-xs">Strengthening bullet points & formatting</p>
      </div>
    );
  }

  // Generated resume view
  if (generatedResume) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold text-sm">Your resume is ready!</span>
          </div>
          <p className="text-white/70 text-sm">{generatedResume.summary}</p>
        </div>

        {/* Resume preview */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <span className="text-white/50 text-xs font-semibold">RESUME PREVIEW</span>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors px-2 py-1 rounded"
                style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
              >
                <Pencil className="w-3 h-3" /> {editing ? 'Preview' : 'Edit'}
              </button>
            </div>
          </div>
          {editing ? (
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-transparent border-0 text-white/80 text-xs font-mono min-h-[300px] rounded-none focus:ring-0"
              rows={20}
            />
          ) : (
            <pre className="p-4 text-white/80 text-xs font-mono whitespace-pre-wrap max-h-[400px] overflow-y-auto leading-relaxed">
              {editText || generatedResume.resume_text}
            </pre>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 border-white/20 text-white hover:bg-white/10 bg-white/5 h-11"
            style={{ minHeight: 'auto' }}
          >
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button
            onClick={handleSaveResume}
            className="flex-1 bg-[#FA4616] hover:bg-orange-600 text-white h-11 font-semibold"
          >
            <Check className="w-4 h-4 mr-2" /> Save & Activate FASTIQ
          </Button>
        </div>
      </motion.div>
    );
  }

  // Conversational builder steps
  return (
    <div className="space-y-6" ref={scrollRef}>
      {/* Previous answers (collapsed) */}
      {currentStep > 0 && (
        <div className="space-y-2 mb-4">
          {BUILDER_STEPS.slice(0, currentStep).map((s, i) => {
            const val = s.fields.map(f => answers[f]).filter(Boolean).join(', ');
            return val ? (
              <div key={i} className="flex items-start gap-2 text-white/30 text-xs">
                <Check className="w-3 h-3 mt-0.5 text-green-400/50 flex-shrink-0" />
                <span className="truncate">{val.substring(0, 60)}{val.length > 60 ? '...' : ''}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <p className="text-white/90 text-sm font-medium mb-1">{step.question}</p>
            <p className="text-white/40 text-xs">{step.encourage}</p>
          </div>

          {/* Input fields */}
          {step.id === 'contact' && (
            <div className="space-y-3">
              <Input
                value={answers.name}
                onChange={(e) => setAnswers(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
              <Input
                value={answers.phone}
                onChange={(e) => setAnswers(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone number (optional)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
              <Input
                value={answers.linkedin}
                onChange={(e) => setAnswers(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="LinkedIn URL (optional)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
            </div>
          )}

          {step.id === 'education' && (
            <div className="space-y-3">
              <Input
                value={answers.major}
                onChange={(e) => setAnswers(prev => ({ ...prev, major: e.target.value }))}
                placeholder="Major (e.g., Finance, Computer Science)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
              <Input
                value={answers.graduation}
                onChange={(e) => setAnswers(prev => ({ ...prev, graduation: e.target.value }))}
                placeholder="Expected graduation (e.g., Spring 2027)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
              <Input
                value={answers.gpa}
                onChange={(e) => setAnswers(prev => ({ ...prev, gpa: e.target.value }))}
                placeholder="GPA (optional)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
              <Input
                value={answers.coursework}
                onChange={(e) => setAnswers(prev => ({ ...prev, coursework: e.target.value }))}
                placeholder="Relevant coursework (optional, comma-separated)"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
              />
            </div>
          )}

          {step.isLongForm && (
            <Textarea
              value={answers[step.fields[0]]}
              onChange={(e) => setAnswers(prev => ({ ...prev, [step.fields[0]]: e.target.value }))}
              placeholder={
                step.id === 'experience' ? "e.g., Summer intern at XYZ Corp — organized team meetings, managed project timelines, trained 3 new hires..." :
                step.id === 'projects' ? "e.g., Built a stock portfolio tracker in Python for my Finance class, presented to 50 students..." :
                step.id === 'extras' ? "e.g., Dean's List Fall 2024, VP of Finance Club, Google Analytics certification..." :
                "Tell me more..."
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[120px] text-sm"
              rows={5}
            />
          )}

          {step.id === 'skills' && (
            <Textarea
              value={answers.skills_text}
              onChange={(e) => setAnswers(prev => ({ ...prev, skills_text: e.target.value }))}
              placeholder="e.g., Excel, Python, SQL, Adobe Creative Suite, Bilingual (Spanish), Data analysis..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 min-h-[80px] text-sm"
              rows={3}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex gap-3">
        <button
          onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : onBack()}
          className="text-white/40 text-xs hover:text-white/60 underline flex items-center gap-1"
          style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="flex-1" />
        {!canProceed() && !isLastStep && (
          <button
            onClick={handleSkip}
            className="text-white/30 text-xs hover:text-white/50"
            style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
          >
            Skip
          </button>
        )}
        <Button
          onClick={handleNext}
          disabled={step.id === 'contact' && !answers.name.trim()}
          className="bg-[#FA4616] hover:bg-orange-600 text-white h-10 px-6 font-semibold"
          style={{ minHeight: 'auto', width: 'auto' }}
        >
          {isLastStep ? 'Build my resume' : 'Next'}
          {isLastStep ? <Sparkles className="w-4 h-4 ml-1" /> : <Send className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pt-2">
        {BUILDER_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? 'w-6 bg-[#FA4616]' : i < currentStep ? 'w-1.5 bg-green-400/50' : 'w-1.5 bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}