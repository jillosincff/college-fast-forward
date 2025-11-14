import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Linkedin, 
  ExternalLink, 
  Award, 
  Briefcase,
  Video,
  Star,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import UserAvatar from '@/components/common/UserAvatar';

export default function TalentSpotlightCard({ student, onReachOut, currentUser }) {
  const getGradStatus = () => {
    const year = student.graduation_year;
    const currentYear = new Date().getFullYear();
    
    if (year === currentYear) return 'Graduating Soon';
    if (year < currentYear) return 'Recent Grad';
    return `Class of ${year}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="h-full border-2 border-slate-200 hover:border-[#0021A5] hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Header with Avatar and Name */}
        <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] p-6 text-white">
          <div className="flex items-start gap-4">
            <UserAvatar 
              user={student} 
              className="w-20 h-20 border-4 border-white shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-1 truncate">{student.full_name}</h3>
              <p className="text-sm text-white/90 mb-2">{student.major || 'Student'}</p>
              <div className="flex items-center gap-2 text-xs">
                <GraduationCap className="w-3 h-3" />
                <span>{getGradStatus()}</span>
              </div>
            </div>
          </div>

          {/* Looking For Tags */}
          {student.looking_for && student.looking_for.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {student.looking_for.slice(0, 3).map((item, idx) => (
                <Badge key={idx} className="bg-white/20 text-white border-white/40">
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Bio */}
          {student.bio && (
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
              {student.bio}
            </p>
          )}

          {/* Location */}
          {student.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{student.location}</span>
            </div>
          )}

          {/* Skills Showcase */}
          {student.skills_showcase && student.skills_showcase.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                <Star className="w-4 h-4 text-[#FA4616]" />
                Top Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {student.skills_showcase.slice(0, 6).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* GPA if available */}
          {student.gpa && (
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-[#FA4616]" />
              <span className="font-semibold">GPA: {student.gpa}</span>
            </div>
          )}

          {/* Honors/Awards */}
          {student.honors_awards && student.honors_awards.length > 0 && (
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Honors: </span>
              <span className="text-gray-600">{student.honors_awards[0]}</span>
              {student.honors_awards.length > 1 && (
                <span className="text-gray-500"> +{student.honors_awards.length - 1} more</span>
              )}
            </div>
          )}

          {/* Projects Count */}
          {student.projects && student.projects.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="w-4 h-4" />
              <span>{student.projects.length} Project{student.projects.length !== 1 ? 's' : ''} Showcased</span>
            </div>
          )}

          {/* Quick Links */}
          <div className="flex gap-2 pt-2">
            {student.linkedin_url && (
              <a 
                href={student.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {student.portfolio_url && (
              <a 
                href={student.portfolio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Portfolio"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {student.video_intro_url && (
              <a 
                href={student.video_intro_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Video Introduction"
              >
                <Video className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* CTA Button */}
          <Button 
            onClick={onReachOut}
            className="w-full bg-[#FA4616] hover:bg-[#E03D00] text-white font-semibold"
          >
            <Mail className="w-4 h-4 mr-2" />
            Reach Out with an Opportunity
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}