import { useState, useEffect } from 'react';
import { Users, MessageCircle, Award, TrendingUp, Clock, MapPin, Building } from 'lucide-react';

const EnhancedImpactTimeline = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const timelineData = [
    {
      date: '2025-08-28',
      type: 'help',
      title: 'Helped Maya connect with Microsoft',
      description: 'Introduced Maya Rodriguez \'24 to Sarah Chen at Microsoft for a Software Engineering role',
      outcome: 'Interview scheduled',
      student: 'Maya Rodriguez \'24',
      company: 'Microsoft',
      role: 'Software Engineering',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-green-500'
    },
    {
      date: '2025-08-25',
      type: 'opportunity',
      title: 'Posted internship opportunity',
      description: 'Shared Marketing Intern position at your company',
      outcome: '8 applications received',
      company: 'Your Company',
      role: 'Marketing Intern',
      icon: <Building className="w-4 h-4" />,
      color: 'bg-blue-500'
    },
    {
      date: '2025-08-22',
      type: 'advice',
      title: 'Provided career guidance',
      description: 'Mentored Alex Thompson \'25 on consulting career path',
      outcome: 'Resume reviewed & improved',
      student: 'Alex Thompson \'25',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-purple-500'
    },
    {
      date: '2025-08-20',
      type: 'introduction',
      title: 'Connected two Gators',
      description: 'Introduced Jordan Davis \'23 to Lisa Park \'19 for networking in Atlanta',
      outcome: 'Coffee meeting scheduled',
      location: 'Atlanta',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-orange-500'
    },
    {
      date: '2025-08-18',
      type: 'help',
      title: 'Interview prep assistance',
      description: 'Conducted mock interview with David Kim \'24 for Goldman Sachs',
      outcome: 'Confidence improved',
      student: 'David Kim \'24',
      company: 'Goldman Sachs',
      icon: <Award className="w-4 h-4" />,
      color: 'bg-indigo-500'
    },
    {
      date: '2025-08-15',
      type: 'opportunity',
      title: 'Shared job lead',
      description: 'Forwarded Data Analyst opening at startup to 3 students',
      outcome: '1 interview secured',
      role: 'Data Analyst',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-teal-500'
    },
    {
      date: '2025-08-12',
      type: 'help',
      title: 'Resume feedback provided',
      description: 'Reviewed and provided detailed feedback on Emily Chen\'s resume',
      outcome: 'Resume strengthened',
      student: 'Emily Chen \'25',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-pink-500'
    },
    {
      date: '2025-08-10',
      type: 'milestone',
      title: 'Reached 10 students helped!',
      description: 'Congratulations on helping your 10th student this month',
      outcome: 'Top 10% Helper badge earned',
      icon: <Award className="w-4 h-4" />,
      color: 'bg-yellow-500'
    }
  ];

  const impactStats = [
    {
      label: 'Students Helped',
      value: 12,
      change: '+3',
      period: 'this month',
      icon: <Users className="w-6 h-6" />,
      color: 'text-green-600'
    },
    {
      label: 'Introductions Made',
      value: 7,
      change: '+2',
      period: 'this month',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'text-blue-600'
    },
    {
      label: 'Job Opportunities Shared',
      value: 3,
      change: '+1',
      period: 'this month',
      icon: <Building className="w-6 h-6" />,
      color: 'text-purple-600'
    },
    {
      label: 'Success Rate',
      value: '78%',
      change: '+5%',
      period: 'vs last month',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-orange-600'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'help': return <Users className="w-4 h-4" />;
      case 'opportunity': return <Building className="w-4 h-4" />;
      case 'advice': return <MessageCircle className="w-4 h-4" />;
      case 'introduction': return <Users className="w-4 h-4" />;
      case 'milestone': return <Award className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Impact Timeline</h1>
            <p className="text-gray-600">See how you're helping fellow Gators succeed</p>
          </div>
          <div className="flex gap-2">
            {['1M', '3M', '6M', 'All'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {impactStats.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`p-4 rounded-lg bg-gray-50 border border-gray-100 transition-all duration-500 ${
                animateStats ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={stat.color}>
                  {stat.icon}
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.period}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {timelineData.map((item, index) => (
              <div 
                key={index} 
                className={`relative flex items-start mb-8 transition-all duration-500 ${
                  animateStats ? 'transform translate-x-0 opacity-100' : 'transform translate-x-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Timeline dot */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white z-10 mr-4`}>
                  {getTypeIcon(item.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        ✓ {item.outcome}
                      </span>
                      
                      {item.student && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          👤 {item.student}
                        </span>
                      )}
                      
                      {item.company && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                          🏢 {item.company}
                        </span>
                      )}
                      
                      {item.role && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                          💼 {item.role}
                        </span>
                      )}
                      
                      {item.location && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back to Dashboard Button - Handled by MyImpact page */}
    </div>
  );
};

export default EnhancedImpactTimeline;