import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ExternalLink, Briefcase, DollarSign, Building2, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/components/utils/analytics';

const JOB_MARKET_INSIGHTS = [
  {
    id: 1,
    category: 'Tech',
    icon: Briefcase,
    title: 'Tech Companies Accelerate Campus Recruiting for 2025',
    summary: 'Major tech firms including Google, Microsoft, and Amazon are ramping up early recruiting for internships and full-time roles. Application deadlines starting in August.',
    trend: 'hot',
    date: '2 days ago',
    url: 'https://www.linkedin.com/pulse/tech-recruiting-trends-2025/',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600'
  },
  {
    id: 2,
    category: 'Finance',
    icon: DollarSign,
    title: 'Investment Banking Sees 15% Salary Increase for New Analysts',
    summary: 'Major investment banks raise first-year analyst salaries to $110-120K amid competitive talent market. Signing bonuses also up across the board.',
    trend: 'rising',
    date: '4 days ago',
    url: 'https://www.wsj.com/finance',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600'
  },
  {
    id: 3,
    category: 'Healthcare',
    icon: Building2,
    title: 'Healthcare & Biotech Lead Job Growth in Florida',
    summary: 'Florida healthcare sector adds 12,000+ new positions. UF Health and major Tampa/Orlando hospitals actively recruiting for summer internships.',
    trend: 'growing',
    date: '5 days ago',
    url: 'https://www.indeed.com/career-advice/finding-a-job/healthcare-jobs-in-florida',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600'
  },
  {
    id: 4,
    category: 'Consulting',
    icon: Target,
    title: 'Consulting Firms Expand Remote Internship Programs',
    summary: 'McKinsey, BCG, and Bain announce hybrid/remote options for summer 2025 internships, making opportunities accessible to students nationwide.',
    trend: 'new',
    date: '1 week ago',
    url: 'https://www.vault.com/blogs/consulting-news',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600'
  }
];

const TREND_BADGES = {
  hot: { label: '🔥 Hot', className: 'bg-red-100 text-red-800' },
  rising: { label: '📈 Rising', className: 'bg-green-100 text-green-800' },
  growing: { label: '⭐ Growing', className: 'bg-blue-100 text-blue-800' },
  new: { label: '✨ New', className: 'bg-purple-100 text-purple-800' }
};

export default function JobMarketInsightsWidget() {
  const handleArticleClick = (insight) => {
    try {
      trackEvent('job_market_article_clicked', {
        articleId: insight.id,
        category: insight.category,
        title: insight.title
      });
      window.open(insight.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening article:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Job Market News & Insights</CardTitle>
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-xs">
            Updated Daily
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Latest trends and opportunities for college students
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {JOB_MARKET_INSIGHTS.map((insight) => {
            const Icon = insight.icon;
            const trendBadge = TREND_BADGES[insight.trend];
            
            return (
              <div
                key={insight.id}
                onClick={() => handleArticleClick(insight)}
                className={`p-4 rounded-lg border-2 ${insight.color} hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 ${insight.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs ${trendBadge.className}`}>
                            {trendBadge.label}
                          </Badge>
                          <span className="text-xs text-gray-500">{insight.date}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {insight.title}
                        </h4>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {insight.summary}
                    </p>
                    
                    <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 font-medium text-xs">
                      <ExternalLink className="w-3 h-3" />
                      <span>Read Full Article</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 Stay informed about trends affecting your student's job search
        </p>
      </CardContent>
    </Card>
  );
}