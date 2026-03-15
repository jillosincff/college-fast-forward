import React from 'react';
import { Search, X, LayoutGrid, List } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";

const HELP_TYPE_OPTIONS = [
  'Career Advice',
  'Job Referrals',
  'Resume Review',
  'Intros',
  'Industry Insights',
  'Interview Prep',
];

export default function DirectorySearchBar({
  searchTerm, onSearchChange,
  filters, onFilterChange,
  viewMode, onViewModeChange,
  industries,
  resultCount,
}) {
  const selectStyle = {
    fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#333',
    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8, height: 40,
    padding: '0 12px', background: '#fff', cursor: 'pointer',
    minWidth: 130, appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
    paddingRight: 30,
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 24px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            width: 18, height: 18, color: '#aaa',
          }} />
          <input
            type="text"
            placeholder="Search by name, company, or industry..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              fontFamily: dmSans, fontSize: 14, width: '100%', height: 44,
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10,
              padding: '0 40px 0 44px', outline: 'none', background: '#fafafa',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#E85D20'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          />
          {searchTerm && (
            <button onClick={() => onSearchChange('')} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              minHeight: 'auto', width: 'auto',
            }}>
              <X style={{ width: 16, height: 16, color: '#aaa' }} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={filters.persona}
            onChange={(e) => onFilterChange({ ...filters, persona: e.target.value })}
            style={selectStyle}
          >
            <option value="all">All Roles</option>
            <option value="parent">Parent</option>
            <option value="alumni">Alumni</option>
            <option value="student">Student</option>
          </select>

          <select
            value={filters.industry}
            onChange={(e) => onFilterChange({ ...filters, industry: e.target.value })}
            style={selectStyle}
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <select
            value={filters.helpType}
            onChange={(e) => onFilterChange({ ...filters, helpType: e.target.value })}
            style={selectStyle}
          >
            <option value="all">All Help Types</option>
            {HELP_TYPE_OPTIONS.map(ht => (
              <option key={ht} value={ht}>{ht}</option>
            ))}
          </select>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* View toggle */}
          <div style={{
            display: 'flex', gap: 2, background: 'rgba(0,0,0,0.04)',
            borderRadius: 8, padding: 3,
          }}>
            <button onClick={() => onViewModeChange('grid')} style={{
              background: viewMode === 'grid' ? '#fff' : 'transparent',
              border: viewMode === 'grid' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
              borderRadius: 6, padding: 6, cursor: 'pointer',
              minHeight: 'auto', width: 'auto',
            }}>
              <LayoutGrid style={{ width: 16, height: 16, color: viewMode === 'grid' ? '#E85D20' : '#aaa' }} />
            </button>
            <button onClick={() => onViewModeChange('list')} style={{
              background: viewMode === 'list' ? '#fff' : 'transparent',
              border: viewMode === 'list' ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
              borderRadius: 6, padding: 6, cursor: 'pointer',
              minHeight: 'auto', width: 'auto',
            }}>
              <List style={{ width: 16, height: 16, color: viewMode === 'list' ? '#E85D20' : '#aaa' }} />
            </button>
          </div>
        </div>

        {/* Results count */}
        <p style={{
          fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: '#999',
          marginTop: 10, marginBottom: 0,
        }}>
          Showing {resultCount} member{resultCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}