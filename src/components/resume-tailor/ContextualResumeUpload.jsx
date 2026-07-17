import { useRef } from 'react';

const dm = "'DM Sans', sans-serif";

// Shown when a student starts an application but has no resume on file.
// Keeps the job context front-and-center — after upload they return
// automatically to this exact opportunity.
export default function ContextualResumeUpload({ company, role, onFile, onCancel }) {
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleSelect} />
      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>📄</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', lineHeight: 1.3 }}>
        One quick thing before {company ? `${company}` : 'this application'}.
      </h1>
      <p style={{ fontFamily: dm, fontSize: 15, color: '#666', margin: '0 0 28px', lineHeight: 1.6 }}>
        To tailor your application{role ? ` for ${role}` : ''}{company ? ` at ${company}` : ''}, I need your resume first.
        Add it once and I'll bring you right back to this opportunity.
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
        style={{ background: '#f5f3ff', border: '2px dashed #7c3aed', borderRadius: 16, padding: '32px 20px', marginBottom: 8, cursor: 'pointer', fontFamily: dm, fontSize: 14, fontWeight: 600, color: '#7c3aed' }}
      >
        Drop your resume here or click to upload
      </div>
      <p style={{ fontFamily: dm, fontSize: 11.5, color: '#AAA', margin: '0 0 24px' }}>PDF or Word (.doc / .docx) · up to 10 MB</p>
      <button
        onClick={onCancel}
        style={{ background: 'none', border: 'none', fontFamily: dm, fontSize: 13, color: '#888', cursor: 'pointer', padding: 0, minHeight: 'auto', textDecoration: 'underline' }}
      >
        ← Not now — back to dashboard
      </button>
    </div>
  );
}