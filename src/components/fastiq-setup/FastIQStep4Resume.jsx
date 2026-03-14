import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

export default function FastIQStep4Resume({ existingResumeUrl, onFinish, saving }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingResumeUrl || null);
  const inputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum 5MB.');
      return;
    }
    setFile(f);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setUploadedUrl(file_url);
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    setUploadedUrl(existingResumeUrl || null);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        Add your resume so FASTIQ can tailor it.
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.6, marginBottom: 28 }}>
        Optional — but FASTIQ uses it to match your experience to specific job listings and tailor outreach messages.
      </p>

      {/* Upload zone */}
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
          style={{
            border: '2px dashed rgba(232,93,32,0.3)', borderRadius: 16,
            padding: 40, textAlign: 'center', cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} className="hidden" />
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(244,240,232,0.3)' }} />
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)', margin: '0 0 4px' }}>
            Drop your resume here or click to upload
          </p>
          <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.25)', margin: 0 }}>
            PDF only, max 5MB
          </p>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 14, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <FileText className="w-6 h-6 flex-shrink-0" style={{ color: orange }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#f4f0e8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.4)', margin: 0 }}>
              {uploading ? 'Uploading...' : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
            </p>
          </div>
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: orange }} />
          ) : (
            <button onClick={handleRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244,240,232,0.3)', padding: 0, minHeight: 'auto', width: 'auto' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Existing resume note */}
      {existingResumeUrl && !file && (
        <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.35)', marginTop: 12, textAlign: 'center' }}>
          You already have a resume on file. Upload a new one to replace it.
        </p>
      )}

      {/* Finish button */}
      <button
        onClick={() => onFinish(uploadedUrl)}
        disabled={saving || uploading}
        style={{
          width: '100%', padding: '16px 0', borderRadius: 100, border: 'none', marginTop: 28,
          background: (saving || uploading) ? 'rgba(255,255,255,0.06)' : orange,
          color: (saving || uploading) ? 'rgba(255,255,255,0.3)' : '#fff',
          fontFamily: dmSans, fontSize: 15, fontWeight: 500,
          cursor: (saving || uploading) ? 'not-allowed' : 'pointer', minHeight: 48,
        }}
      >
        {saving ? 'Setting up FASTIQ...' : file ? 'Finish setup →' : 'Finish without resume →'}
      </button>

      {/* Skip link */}
      {!file && (
        <button
          onClick={() => onFinish(null)}
          disabled={saving}
          style={{
            display: 'block', margin: '12px auto 0', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.3)',
            minHeight: 44, width: 'auto',
          }}
        >
          Skip for now — I can add this later
        </button>
      )}
    </div>
  );
}