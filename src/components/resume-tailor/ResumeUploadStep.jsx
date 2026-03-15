import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

export default function ResumeUploadStep({ existingResume, resumeText, resumeFileName, userEmail, onResumeReady }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      // Extract text
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            full_text: { type: "string", description: "The complete text content of the resume" }
          }
        }
      });
      const text = extracted?.output?.full_text || '';
      // Save to Resume entity
      const resume = await base44.entities.Resume.create({
        student_email: userEmail,
        original_file_name: file.name,
        original_file_url: file_url,
        parsed_text: text.substring(0, 10000),
        is_active: true,
      });
      onResumeReady(text, file.name, resume.id);
    } catch (e) {
      console.error('Resume upload failed:', e);
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  // Already have a resume
  if (resumeText) {
    return (
      <div style={{
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <FileText style={{ width: 32, height: 32, color: orange }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
            {resumeFileName || 'Resume on file'}
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#aaa', margin: 0 }}>
            {resumeText.length > 100 ? `${Math.round(resumeText.length / 5)} words · Ready to tailor` : 'Resume loaded'}
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#888',
            background: 'rgba(0,0,0,0.04)', border: 'none', borderRadius: 100,
            padding: '6px 14px', cursor: 'pointer', minHeight: 'auto', width: 'auto',
          }}
        >
          Upload different
        </button>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    );
  }

  // Upload zone
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && fileRef.current?.click()}
      style={{
        background: dragOver ? 'rgba(232,93,32,0.02)' : '#fff',
        border: `2px dashed ${dragOver ? orange : 'rgba(232,93,32,0.25)'}`,
        borderRadius: 16, padding: '48px 32px', textAlign: 'center',
        cursor: uploading ? 'wait' : 'pointer', marginBottom: 24,
        transition: 'all 0.2s',
      }}
    >
      {uploading ? (
        <Loader2 style={{ width: 32, height: 32, color: orange, margin: '0 auto' }} className="animate-spin" />
      ) : (
        <Upload style={{ width: 32, height: 32, color: 'rgba(232,93,32,0.4)', margin: '0 auto' }} />
      )}
      <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: '#1a1a1a', marginTop: 12 }}>
        {uploading ? 'Uploading & extracting text...' : 'Drop your resume here'}
      </p>
      <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#aaa' }}>
        or click to upload · PDF only · Max 5MB
      </p>
      <input ref={fileRef} type="file" accept=".pdf" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}