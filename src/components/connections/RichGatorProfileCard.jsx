import { useState } from 'react';
import { motion } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';
import MessageUserModal from '@/components/directory/MessageUserModal';

export default function RichGatorProfileCard({ 
  gator, 
  request = null, 
  onHelp = null, 
  currentUser,
  viewMode = 'enhanced'
}) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!gator) return null;

  const isSeekingHelp = !!request;
  const fullName = gator.full_name || gator.email?.split('@')[0] || 'Gator';

  const getCareerPitch = () => {
    if (request?.description) return request.description;
    if (gator.bio) return gator.bio;
    return 'Passionate Gator looking to connect and grow professionally.';
  };

  const getSkillsFromBio = () => {
    const skills = [];
    const bio = (gator.bio || '').toLowerCase();
    
    const skillMap = {
      'react': 'expert',
      'python': 'expert',
      'javascript': 'intermediate',
      'node': 'intermediate',
      'java': 'intermediate',
      'sql': 'intermediate',
      'aws': 'beginner',
      'marketing': 'expert',
      'analytics': 'intermediate',
      'seo': 'beginner',
      'design': 'expert'
    };
    
    Object.entries(skillMap).forEach(([skill, level]) => {
      if (bio.includes(skill)) {
        skills.push({ name: skill.charAt(0).toUpperCase() + skill.slice(1), level });
      }
    });
    
    return skills.slice(0, 4);
  };

  const getExperienceItems = () => {
    const items = [];
    if (gator.current_company && gator.current_position) {
      items.push({
        company: gator.current_company,
        role: gator.current_position
      });
    }
    return items;
  };

  const getAchievements = () => {
    const achievements = [];
    const bio = (gator.bio || '').toLowerCase();
    
    if (bio.includes('dean')) achievements.push("Dean's List");
    if (bio.includes('research')) achievements.push('Research Assistant');
    if (bio.includes('hackathon')) achievements.push('Hackathon Winner');
    if (bio.includes('volunteer')) achievements.push('Community Service');
    
    return achievements.slice(0, 3);
  };

  const getSeekingBadge = () => {
    if (!request) return null;
    
    if (request.job_type === 'internship' || request.role_type === 'internship') {
      return { text: `Seeking ${request.role || 'Internship'}`, class: 'internship' };
    }
    if (request.job_type === 'full_time' || request.role_type === 'full_time') {
      return { text: `Seeking ${request.role || 'Full-time Role'}`, class: 'full-time' };
    }
    return { text: 'Seeking Career Advice', class: 'advice' };
  };

  const getStatusDotClass = () => {
    if (!request) return 'seeking-advice';
    if (request.job_type === 'internship' || request.role_type === 'internship') return 'seeking-internship';
    if (request.job_type === 'full_time' || request.role_type === 'full_time') return 'seeking-job';
    return 'seeking-advice';
  };

  const getLocationPreference = () => {
    if (request?.location_city && request?.location_state) {
      return `${request.location_city}, ${request.location_state}`;
    }
    if (request?.location_preference) return request.location_preference;
    if (gator.location) return gator.location;
    return 'Flexible';
  };

  const careerPitch = getCareerPitch();
  const shouldTruncate = careerPitch.length > 150;
  const displayText = shouldTruncate && !isExpanded 
    ? careerPitch.substring(0, 150) + '...' 
    : careerPitch;

  const skills = getSkillsFromBio();
  const experienceItems = getExperienceItems();
  const achievements = getAchievements();
  const seekingBadge = getSeekingBadge();
  const statusDotClass = getStatusDotClass();
  const locationPref = getLocationPreference();

  const handleMessage = () => {
    if (onHelp) {
      onHelp();
    } else {
      setShowMessageModal(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="student-card enhanced"
      >
        {/* Card Main */}
        <div className="card-main">
          {/* Profile Section */}
          <div className="profile-section">
            <UserAvatar 
              user={gator} 
              className="profile-photo"
              showFallback={true}
            />
            <div className="status-indicators">
              <div className={`availability-dot ${statusDotClass}`} title={seekingBadge?.text || 'Active'}></div>
              <div className="response-badge">{isSeekingHelp ? '98% response' : 'New member'}</div>
            </div>
          </div>

          {/* Student Details */}
          <div className="student-details">
            <div className="name-academic">
              <h3 className="student-name">{fullName}</h3>
              <div className="academic-info">
                <span className="graduation">
                  {gator.graduation_year ? `Graduating ${gator.graduation_year}` : 'UF Student'}
                </span>
                <span className="major-gpa">
                  {gator.major || 'Undeclared'}{gator.gpa ? ` • ${gator.gpa} GPA` : ''}
                </span>
              </div>
            </div>

            {seekingBadge && (
              <div className="seeking-info">
                <span className={`seeking-badge ${seekingBadge.class}`}>{seekingBadge.text}</span>
                <span className="location-pref">{locationPref}</span>
              </div>
            )}

            <div className="career-pitch">
              {displayText}
              {shouldTruncate && (
                <button 
                  className="read-more-btn"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'less' : 'more'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card Highlights */}
        {(experienceItems.length > 0 || skills.length > 0 || achievements.length > 0) && (
          <div className="card-highlights">
            {/* Experience Row */}
            {experienceItems.length > 0 && (
              <div className="experience-row">
                {experienceItems.map((item, idx) => (
                  <div key={idx} className="experience-item">
                    <span className="exp-company">{item.company}</span>
                    <span className="exp-role">{item.role}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Row */}
            {skills.length > 0 && (
              <div className="skills-row">
                <div className="skills-list">
                  {skills.map((skill, idx) => (
                    <span key={idx} className={`skill-tag ${skill.level}`}>
                      {skill.name}
                    </span>
                  ))}
                  {skills.length >= 4 && <span className="skills-more">+{Math.floor(Math.random() * 3) + 2} more</span>}
                </div>
              </div>
            )}

            {/* Achievements Row */}
            {achievements.length > 0 && (
              <div className="achievements-row">
                {achievements.map((achievement, idx) => (
                  <span key={idx} className="achievement-badge">{achievement}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Card Actions */}
        <div className="card-actions">
          <div className="social-links">
            {gator.linkedin_url && (
              <a href={gator.linkedin_url} className="social-btn linkedin" target="_blank" rel="noopener noreferrer">
                in
              </a>
            )}
            {gator.github_url && (
              <a href={gator.github_url} className="social-btn github" target="_blank" rel="noopener noreferrer">
                gh
              </a>
            )}
            {gator.portfolio_url && (
              <a href={gator.portfolio_url} className="social-btn portfolio" target="_blank" rel="noopener noreferrer">
                web
              </a>
            )}
            {gator.email && (
              <a href={`mailto:${gator.email}`} className="social-btn email">
                @
              </a>
            )}
          </div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleMessage}>
              {isSeekingHelp ? 'Offer Help' : 'Message'}
            </button>
            {gator.portfolio_url ? (
              <a href={gator.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                View Portfolio
              </a>
            ) : (
              <button className="btn-secondary" onClick={() => setShowMessageModal(true)}>
                Connect
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <MessageUserModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        recipientUser={gator}
      />

      <style jsx>{`
        /* Enhanced Student Card */
        .student-card.enhanced {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: start;
        }

        .student-card.enhanced:hover {
          border-color: #3b82f6;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-main {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          flex: 1;
          grid-column: 1 / -1;
        }

        /* Profile Section */
        .profile-section {
          position: relative;
          flex-shrink: 0;
        }

        .profile-photo {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          border: 3px solid #f8fafc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .status-indicators {
          position: absolute;
          top: -8px;
          right: -8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }

        .availability-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .seeking-internship { background: #3b82f6; }
        .seeking-job { background: #10b981; }
        .seeking-advice { background: #f59e0b; }

        .response-badge {
          background: #ecfdf5;
          color: #065f46;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* Student Details */
        .student-details {
          flex: 1;
          min-width: 0;
        }

        .name-academic {
          margin-bottom: 8px;
        }

        .student-name {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .academic-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .graduation {
          font-size: 15px;
          color: #374151;
          font-weight: 600;
        }

        .major-gpa {
          font-size: 14px;
          color: #059669;
          font-weight: 600;
        }

        .seeking-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .seeking-badge {
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .seeking-badge.internship {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .seeking-badge.full-time {
          background: #d1fae5;
          color: #065f46;
        }

        .seeking-badge.advice {
          background: #fef3c7;
          color: #92400e;
        }

        .location-pref {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .career-pitch {
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
          margin-bottom: 16px;
        }

        .read-more-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
          padding: 0;
        }

        .read-more-btn:hover {
          text-decoration: underline;
        }

        /* Card Highlights */
        .card-highlights {
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          grid-column: 1 / -1;
        }

        /* Experience Row */
        .experience-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .experience-item {
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 3px solid #10b981;
        }

        .exp-company {
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          display: block;
        }

        .exp-role {
          font-size: 11px;
          color: #6b7280;
        }

        /* Skills Row */
        .skills-row {
          margin-bottom: 0;
        }

        .skills-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }

        .skill-tag {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .skill-tag.expert {
          background: #dcfce7;
          color: #166534;
        }

        .skill-tag.intermediate {
          background: #fef3c7;
          color: #92400e;
        }

        .skill-tag.beginner {
          background: #e0e7ff;
          color: #3730a3;
        }

        .skills-more {
          font-size: 10px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Achievements Row */
        .achievements-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .achievement-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }

        /* Card Actions */
        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
          grid-column: 2;
          grid-row: 1;
        }

        .social-links {
          display: flex;
          gap: 6px;
        }

        .social-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: white;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .social-btn:hover {
          transform: scale(1.1);
        }

        .social-btn.linkedin { background: #0077b5; }
        .social-btn.github { background: #333; }
        .social-btn.email { background: #6b7280; }
        .social-btn.portfolio { background: #8b5cf6; }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-direction: column;
          width: 100%;
        }

        .btn-primary,
        .btn-secondary {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          white-space: nowrap;
          text-align: center;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .student-card.enhanced {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card-main {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .card-actions {
            grid-column: 1;
            grid-row: auto;
            align-items: center;
            width: 100%;
          }

          .action-buttons {
            flex-direction: row;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}