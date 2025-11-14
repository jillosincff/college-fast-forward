
export default function EnhancedFilters({ activeFiltersCount, onFilterChange }) {
  return (
    <>
      <style jsx>{`
        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
          border: 1px solid #e2e8f0;
        }
        
        .filters-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .filters-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .active-filters {
          background: rgba(0, 84, 150, 0.1);
          color: #005496;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 6px;
        }
        
        .filter-select, .search-box {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
        }
        
        .filter-select:focus, .search-box:focus {
          outline: none;
          border-color: #005496;
          box-shadow: 0 0 0 3px rgba(0, 84, 150, 0.1);
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <div className="filters-section">
        <div className="filters-header">
          <span className="filters-title">Find Your Perfect Match</span>
          {activeFiltersCount > 0 && (
            <span className="active-filters">{activeFiltersCount} filters active</span>
          )}
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Industry</label>
            <select className="filter-select" onChange={(e) => onFilterChange('industry', e.target.value)}>
              <option>All Industries</option>
              <option>Marketing</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Experience Level</label>
            <select className="filter-select" onChange={(e) => onFilterChange('experience', e.target.value)}>
              <option>All Levels</option>
              <option>Entry Level</option>
              <option>Mid-Level</option>
              <option>Senior</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Time Commitment</label>
            <select className="filter-select" onChange={(e) => onFilterChange('time', e.target.value)}>
              <option>Any</option>
              <option>Quick Chat (15-30 min)</option>
              <option>Coffee Meeting (1 hour)</option>
              <option>Ongoing Mentorship</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search by keywords, company, role..."
              onChange={(e) => onFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}