
export default function PriorityRequest({ request }) {
  return (
    <>
      <style jsx>{`
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }
        
        .priority-badge {
          background: rgba(243, 112, 33, 0.1);
          color: #F37021;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .featured-request {
          background: linear-gradient(135deg, rgba(0, 84, 150, 0.05) 0%, rgba(243, 112, 33, 0.05) 100%);
          border-radius: 12px;
          padding: 24px;
          border-left: 4px solid #F37021;
          margin-bottom: 32px;
          border: 1px solid rgba(243, 112, 33, 0.2);
        }
        
        .featured-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #005496;
          margin-bottom: 4px;
        }
        
        .featured-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 12px;
        }
        
        .featured-content {
          color: #374151;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        
        .featured-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .btn-featured {
          background: #F37021;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        .btn-featured:hover {
          background: #e85d0a;
          transform: translateY(-1px);
        }
      `}</style>
      
      <div>
        <div className="section-header">
          <h2 className="section-title">Perfect Matches for You</h2>
          <span className="priority-badge">AI Recommended</span>
        </div>
        
        <div className="featured-request">
          <h3 className="featured-title">{request.title}</h3>
          <p className="featured-subtitle">{request.author}</p>
          <p className="featured-content">"{request.content}"</p>
          <div className="featured-meta">
            <span className="meta-item">⏱️ {request.time}</span>
            <span className="meta-item">📍 {request.location}</span>
            <span className="meta-item">🎯 {request.match}% match</span>
          </div>
          <button className="btn-featured">Offer to Help {request.author.split(' ')[0]}</button>
        </div>
      </div>
    </>
  );
}