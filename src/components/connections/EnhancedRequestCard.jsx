
export default function EnhancedRequestCard({ request }) {
  return (
    <>
      <style jsx>{`
        .request-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
          position: relative;
        }
        
        .request-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        
        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }
        
        .request-type {
          background: rgba(0, 84, 150, 0.1);
          color: #005496;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .request-new {
          background: #dcfce7;
          color: #166534;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .request-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        
        .request-content {
          color: #64748b;
          margin-bottom: 16px;
          line-height: 1.5;
          font-size: 0.9rem;
        }
        
        .request-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .tag {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
        }
        
        .tag.highlight {
          background: rgba(243, 112, 33, 0.1);
          color: #F37021;
        }
        
        .request-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .help-count {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn-offer-help {
          width: 100%;
          background: #F37021;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .btn-offer-help:hover {
          background: #e85d0a;
          transform: translateY(-1px);
        }
        
        .match-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #005496;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }
      `}</style>
      
      <div className="request-card">
        {request.match && <div className="match-indicator">{request.match}% Match</div>}
        <div className="request-header">
          <span className="request-type">{request.type}</span>
          {request.isNew && <span className="request-new">New</span>}
        </div>
        <h3 className="request-title">{request.title}</h3>
        <p className="request-content">"{request.content}"</p>
        <div className="request-tags">
          {request.tags?.map((tag, index) => (
            <span key={index} className={`tag ${tag.highlight ? 'highlight' : ''}`}>
              {tag.name || tag}
            </span>
          ))}
        </div>
        <div className="request-meta">
          <span className="help-count">👥 {request.helpers} people ready to help</span>
          <span>Posted {request.posted}</span>
        </div>
        <button className="btn-offer-help">Offer Help</button>
      </div>
    </>
  );
}