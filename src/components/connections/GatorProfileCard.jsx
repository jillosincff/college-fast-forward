import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Linkedin, Github, Mail, MapPin, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import UserAvatar from '@/components/common/UserAvatar';
import MessageUserModal from '@/components/directory/MessageUserModal';

export default function GatorProfileCard({ 
  gator, 
  request = null, 
  onHelp = null, 
  isFeatured = false,
  currentUser 
}) {
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!gator) return null;

  const isSeekingHelp = !!request;
  const fullName = gator.full_name || gator.email?.split('@')[0] || 'Gator';

  const getCareerObjective = () => {
    if (request?.description) return request.description;
    if (gator.bio) return gator.bio;
    return null;
  };

  const getSkillsFromBio = () => {
    const skills = [];
    const bio = gator.bio?.toLowerCase() || '';
    
    if (bio.includes('react')) skills.push({ name: 'React', level: 'expert' });
    if (bio.includes('python')) skills.push({ name: 'Python', level: 'expert' });
    if (bio.includes('javascript') || bio.includes('js')) skills.push({ name: 'JavaScript', level: 'intermediate' });
    if (bio.includes('java')) skills.push({ name: 'Java', level: 'intermediate' });
    if (bio.includes('sql') || bio.includes('database')) skills.push({ name: 'SQL', level: 'intermediate' });
    if (bio.includes('aws') || bio.includes('cloud')) skills.push({ name: 'AWS', level: 'beginner' });
    if (bio.includes('node')) skills.push({ name: 'Node.js', level: 'intermediate' });
    if (bio.includes('design')) skills.push({ name: 'Design', level: 'expert' });
    if (bio.includes('marketing')) skills.push({ name: 'Marketing', level: 'expert' });
    
    return skills.slice(0, 6);
  };

  const getExperienceHighlights = () => {
    const highlights = [];
    const bio = gator.bio || '';
    const position = gator.current_position || '';
    const company = gator.current_company || '';
    
    if (position && company) {
      highlights.push({
        title: position,
        company: company,
        highlight: '📍 Current Role'
      });
    }
    
    if (bio.includes('research')) {
      highlights.push({
        title: 'Research Experience',
        company: 'UF Research Lab',
        highlight: '🔬 Academic Research'
      });
    }
    
    if (bio.includes('intern')) {
      highlights.push({
        title: 'Internship Experience',
        company: 'Previous Company',
        highlight: '💼 Industry Experience'
      });
    }
    
    return highlights.slice(0, 2);
  };

  const getAchievements = () => {
    const achievements = [];
    const bio = gator.bio?.toLowerCase() || '';
    
    if (bio.includes('hackathon')) achievements.push('🏆 Hackathon Winner');
    if (bio.includes('dean')) achievements.push('📚 Dean\'s List');
    if (bio.includes('research')) achievements.push('🔬 Research Published');
    if (bio.includes('volunteer')) achievements.push('🤝 Community Service');
    
    return achievements.slice(0, 3);
  };

  const getAvailabilityBadge = () => {
    if (request) {
      if (request.job_type === 'internship' || request.role_type === 'internship') {
        return { text: 'Seeking Internship', class: 'seeking-internship' };
      }
      if (request.job_type === 'full_time' || request.role_type === 'full_time') {
        return { text: 'Seeking Full-time', class: 'seeking-job' };
      }
      return { text: 'Seeking Advice', class: 'seeking-advice' };
    }
    return null;
  };

  const careerObjective = getCareerObjective();
  const skills = getSkillsFromBio();
  const experienceHighlights = getExperienceHighlights();
  const achievements = getAchievements();
  const availabilityBadge = getAvailabilityBadge();

  const shouldTruncate = careerObjective && careerObjective.length > 200;
  const displayText = shouldTruncate && !isExpanded 
    ? careerObjective.substring(0, 200) + '...' 
    : careerObjective;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className={`student-card ${isFeatured ? 'featured' : ''} ${isSeekingHelp ? 'seeking-help' : ''}`}
      >
        {/* Card Header */}
        <div className="card-header">
          <div className="profile-section">
            <UserAvatar 
              user={gator} 
              className="profile-image"
              showFallback={true}
            />
            {availabilityBadge && (
              <div className={`availability-badge ${availabilityBadge.class}`}>
                {availabilityBadge.text}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h3 className="student-name">{fullName}</h3>
            <div className="academic-details">
              {gator.graduation_year && gator.major && (
                <div className="graduation-info">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  {gator.major} • Class of '{String(gator.graduation_year).slice(-2)}
                </div>
              )}
              {gator.location && (
                <div className="location-pref">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {gator.location}
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="social-links">
            {gator.linkedin_url && (
              <a 
                href={gator.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="linkedin-btn"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {gator.github_url && (
              <a 
                href={gator.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="github-btn"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {gator.email && (
              <a 
                href={`mailto:${gator.email}`}
                className="email-btn"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Career Statement */}
        {careerObjective && (
          <div className="career-statement">
            <p className={`statement-text ${!isExpanded && shouldTruncate ? 'collapsed' : ''}`}>
              "{displayText}"
            </p>
            {shouldTruncate && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="read-more-btn"
              >
                {isExpanded ? (
                  <>Read less <ChevronUp className="w-3 h-3 inline" /></>
                ) : (
                  <>Read more <ChevronDown className="w-3 h-3 inline" /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Experience Section */}
        {experienceHighlights.length > 0 && (
          <div className="experience-section">
            <h4>Experience</h4>
            <div className="experience-items">
              {experienceHighlights.map((exp, i) => (
                <div key={i} className="experience-item">
                  <div className="exp-title">{exp.title}</div>
                  <div className="exp-company">{exp.company}</div>
                  <div className="exp-highlight">{exp.highlight}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills and Achievements */}
        {(skills.length > 0 || achievements.length > 0) && (
          <div className="skills-achievements">
            {skills.length > 0 && (
              <div className="skills-list">
                {skills.map((skill, i) => (
                  <span key={i} className={`skill-tag ${skill.level}`}>
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
            
            {achievements.length > 0 && (
              <div className="achievements-list">
                {achievements.map((achievement, i) => (
                  <span key={i} className="achievement">
                    {achievement}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Card Actions */}
        <div className="card-actions">
          {isSeekingHelp ? (
            <>
              <Button 
                onClick={onHelp}
                className="btn-primary"
              >
                Offer Help
              </Button>
              <Button 
                onClick={() => navigate('Profile', { userId: gator.id })}
                variant="outline"
                className="btn-secondary"
              >
                View Profile
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => navigate('Profile', { userId: gator.id })}
                className="btn-primary"
              >
                View Full Profile
              </Button>
              {currentUser && currentUser.id !== gator.id && (
                <Button 
                  onClick={() => setShowMessageModal(true)}
                  variant="outline"
                  className="btn-secondary"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Send Message
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Message Modal */}
      {currentUser && currentUser.id !== gator.id && (
        <MessageUserModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipientUser={gator}
        />
      )}

      <style jsx>{`
        .student-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 2px solid transparent;
          transition: all 0.3s ease;
          margin-bottom: 24px;
        }

        .student-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
          border-color: #3b82f6;
        }

        .student-card.featured {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 2%, white 2%);
          border-color: #f59e0b;
          border-width: 3px;
        }

        .student-card.seeking-help {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 2%, white 2%);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 16px;
        }

        .profile-section {
          position: relative;
          flex-shrink: 0;
        }

        .profile-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          border: 3px solid #f1f5f9;
        }

        .availability-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          white-space: nowrap;
        }

        .seeking-internship {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #3b82f6;
        }

        .seeking-job {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #10b981;
        }

        .seeking-advice {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        }

        .profile-info {
          flex: 1;
          min-width: 0;
        }

        .student-name {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .academic-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .graduation-info {
          font-size: 15px;
          color: #374151;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .location-pref {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .social-links {
          display: flex;
          gap: 8px;
          flex-direction: column;
        }

        .linkedin-btn,
        .github-btn,
        .email-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-decoration: none;
          transition: all 0.2s;
        }

        .linkedin-btn {
          background: #0077b5;
        }

        .github-btn {
          background: #333;
        }

        .email-btn {
          background: #6b7280;
        }

        .linkedin-btn:hover,
        .github-btn:hover,
        .email-btn:hover {
          transform: scale(1.1);
        }

        .career-statement {
          background: #f8fafc;
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 20px;
          border-left: 4px solid #3b82f6;
        }

        .statement-text {
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
          margin-bottom: 8px;
        }

        .read-more-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .read-more-btn:hover {
          color: #2563eb;
        }

        .experience-section {
          margin-bottom: 20px;
        }

        .experience-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .experience-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .experience-item {
          background: #fafbfc;
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #10b981;
        }

        .exp-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2px;
        }

        .exp-company {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 4px;
        }

        .exp-highlight {
          font-size: 12px;
          color: #059669;
          font-weight: 600;
        }

        .skills-achievements {
          margin-bottom: 20px;
        }

        .skills-list,
        .achievements-list {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .skill-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .skill-tag.expert {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #10b981;
        }

        .skill-tag.intermediate {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        }

        .skill-tag.beginner {
          background: #e0e7ff;
          color: #3730a3;
          border: 1px solid #6366f1;
        }

        .achievement {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 16px;
          border-top: 2px solid #f1f5f9;
        }

        .btn-primary,
        .btn-secondary {
          flex: 1;
          min-width: 120px;
        }

        @media (max-width: 768px) {
          .card-header {
            flex-direction: column;
          }
          
          .social-links {
            flex-direction: row;
            justify-content: center;
          }

          .card-actions {
            flex-direction: column;
          }

          .btn-primary,
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}