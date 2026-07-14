import { useState } from 'react';
import { Pin, Trash2, Check } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

export default function MemoryRow({ memory, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(memory.value);
  const active = memory.active !== false;

  const saveEdit = () => {
    const v = val.trim().toLowerCase();
    if (v && v !== memory.value) onChange(memory.id, { value: v });
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: active ? '#fff' : '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', opacity: active ? 1 : 0.6 }}>
      <button onClick={() => onChange(memory.id, { pinned: !memory.pinned })} aria-label="Pin"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, minHeight: 'auto', minWidth: 'auto', lineHeight: 1, flexShrink: 0 }}>
        <Pin size={14} color={memory.pinned ? '#7c3aed' : '#d1d5db'} fill={memory.pinned ? '#7c3aed' : 'none'} />
      </button>

      {editing ? (
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus
          style={{ flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', background: '#f8f9ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '6px 10px', outline: 'none', minWidth: 0 }} />
      ) : (
        <button onClick={() => setEditing(true)} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, minHeight: 'auto', minWidth: 0 }}>
          <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>{memory.value}</span>
        </button>
      )}

      <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: memory.source === 'explicit' ? '#6d28d9' : '#6b7280', background: memory.source === 'explicit' ? '#f5f3ff' : '#f3f4f6', borderRadius: 100, padding: '3px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {memory.source === 'explicit' ? 'You told me' : 'I noticed'}
      </span>
      <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{memory.confidence ?? 0}%</span>

      {editing ? (
        <button onClick={saveEdit} aria-label="Save" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, minHeight: 'auto', minWidth: 'auto', lineHeight: 1, flexShrink: 0 }}>
          <Check size={15} color="#059669" />
        </button>
      ) : (
        <button onClick={() => onChange(memory.id, { active: !active })}
          style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: active ? '#059669' : '#9ca3af', background: active ? '#ecfdf5' : '#f3f4f6', border: 'none', borderRadius: 100, padding: '4px 10px', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {active ? 'On' : 'Off'}
        </button>
      )}

      <button onClick={() => onDelete(memory.id)} aria-label="Delete"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, minHeight: 'auto', minWidth: 'auto', lineHeight: 1, flexShrink: 0 }}>
        <Trash2 size={14} color="#d1d5db" />
      </button>
    </div>
  );
}