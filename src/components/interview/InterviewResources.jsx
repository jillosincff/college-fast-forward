import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const resources = {
  beforeInterview: [
    {
      title: "Research the Company",
      description: "Spend at least 2-3 hours researching the company's mission, values, recent news, and culture.",
      tips: [
        "Read the company's About Us page and mission statement",
        "Check recent press releases and news articles",
        "Review their social media presence",
        "Look at employee reviews on Glassdoor"
      ],
      importance: "critical"
    },
    {
      title: "Understand the Role",
      description: "Read the job description thoroughly and identify key skills and qualifications.",
      tips: [
        "Make a list of required skills you possess",
        "Prepare examples that demonstrate these skills",
        "Understand the team structure",
        "Know who you'll be working with"
      ],
      importance: "critical"
    },
    {
      title: "Prepare Your Documents",
      description: "Have multiple copies of your resume, portfolio, and references ready.",
      tips: [
        "Bring 3-5 printed copies of your resume",
        "Prepare a portfolio if relevant",
        "Have a list of references ready",
        "Bring a notepad and pen"
      ],
      importance: "important"
    }
  ],
  duringInterview: [
    {
      title: "First Impressions Matter",
      description: "Arrive 10-15 minutes early, dress professionally, and greet everyone warmly.",
      tips: [
        "Dress one level above the company dress code",
        "Make eye contact and smile",
        "Offer a firm handshake",
        "Turn off your phone completely"
      ],
      importance: "critical"
    },
    {
      title: "Use the STAR Method",
      description: "Structure your answers using Situation, Task, Action, Result framework.",
      tips: [
        "Situation: Set the context for your story",
        "Task: Describe what your responsibility was",
        "Action: Explain what steps you took",
        "Result: Share the outcomes and what you learned"
      ],
      importance: "critical"
    },
    {
      title: "Active Listening",
      description: "Pay close attention to questions and take a moment to think before answering.",
      tips: [
        "Don't interrupt the interviewer",
        "Take notes if needed",
        "Ask for clarification if you don't understand",
        "Pause briefly before answering to collect your thoughts"
      ],
      importance: "important"
    },
    {
      title: "Ask Thoughtful Questions",
      description: "Always have 3-5 questions prepared to ask the interviewer.",
      tips: [
        "Ask about team dynamics and culture",
        "Inquire about growth opportunities",
        "Ask what success looks like in the role",
        "Never ask about salary in the first interview"
      ],
      importance: "important"
    }
  ],
  afterInterview: [
    {
      title: "Send a Thank You Email",
      description: "Within 24 hours, send a personalized thank you email to everyone you met.",
      tips: [
        "Reference specific topics discussed",
        "Reiterate your interest in the role",
        "Keep it brief (3-4 paragraphs)",
        "Proofread carefully"
      ],
      importance: "critical"
    },
    {
      title: "Follow Up Appropriately",
      description: "If you haven't heard back by the timeline they gave, it's okay to follow up once.",
      tips: [
        "Wait until the timeline they mentioned has passed",
        "Keep the follow-up brief and professional",
        "Express continued interest",
        "Only follow up once, then wait"
      ],
      importance: "important"
    },
    {
      title: "Reflect and Learn",
      description: "After each interview, take notes on what went well and what to improve.",
      tips: [
        "Write down questions you struggled with",
        "Note topics you want to research more",
        "Identify areas for improvement",
        "Track your progress over time"
      ],
      importance: "helpful"
    }
  ],
  commonMistakes: [
    {
      mistake: "Arriving Late",
      fix: "Plan to arrive 10-15 minutes early. Do a trial run the day before if it's in person."
    },
    {
      mistake: "Speaking Negatively About Past Employers",
      fix: "Frame past experiences positively and focus on what you learned."
    },
    {
      mistake: "Not Asking Questions",
      fix: "Always prepare 5-7 questions. It shows interest and helps you evaluate the company."
    },
    {
      mistake: "Being Too Modest or Too Arrogant",
      fix: "Strike a balance. Share accomplishments confidently but give credit to team members."
    },
    {
      mistake: "Not Knowing Your Resume",
      fix: "Review your resume before every interview. Be ready to elaborate on every point."
    },
    {
      mistake: "Rambling or Being Too Brief",
      fix: "Aim for 1-2 minute answers. Use the STAR method to stay structured."
    }
  ]
};

export default function InterviewResources() {
  const importanceColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    important: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    helpful: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Interview Mastery Guide
          </CardTitle>
          <CardDescription className="text-base">
            Everything you need to know to ace your next interview, from preparation to follow-up.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Before Interview Section */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Before the Interview
        </h3>
        <div className="grid gap-6">
          {resources.beforeInterview.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <Badge className={importanceColors[resource.importance]}>
                      {resource.importance}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resource.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* During Interview Section */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" />
          During the Interview
        </h3>
        <div className="grid gap-6">
          {resources.duringInterview.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <Badge className={importanceColors[resource.importance]}>
                      {resource.importance}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resource.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* After Interview Section */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          After the Interview
        </h3>
        <div className="grid gap-6">
          {resources.afterInterview.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <Badge className={importanceColors[resource.importance]}>
                      {resource.importance}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {resource.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Common Mistakes Section */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          Common Mistakes to Avoid
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {resources.commonMistakes.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">
                        ❌ {item.mistake}
                      </h4>
                      <p className="text-slate-700">
                        <span className="font-medium text-green-700">✅ Fix:</span> {item.fix}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STAR Method Deep Dive */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl">Master the STAR Method</CardTitle>
          <CardDescription className="text-base">
            The most effective way to answer behavioral interview questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-800 mb-2 text-lg">S - Situation</h4>
                <p className="text-slate-700">
                  Set the context by briefly describing the challenge or situation you faced.
                </p>
                <p className="text-sm text-slate-600 mt-2 italic">
                  Example: "In my last internship, our team was behind schedule on a critical project..."
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-800 mb-2 text-lg">T - Task</h4>
                <p className="text-slate-700">
                  Explain what your specific responsibility or goal was in that situation.
                </p>
                <p className="text-sm text-slate-600 mt-2 italic">
                  Example: "As the lead developer, it was my responsibility to identify bottlenecks..."
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-800 mb-2 text-lg">A - Action</h4>
                <p className="text-slate-700">
                  Describe the specific steps you took to address the situation. Be detailed!
                </p>
                <p className="text-sm text-slate-600 mt-2 italic">
                  Example: "I organized daily stand-ups, implemented code reviews, and..."
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                <h4 className="font-bold text-green-800 mb-2 text-lg">R - Result</h4>
                <p className="text-slate-700">
                  Share the outcome and what you learned. Use numbers when possible!
                </p>
                <p className="text-sm text-slate-600 mt-2 italic">
                  Example: "We delivered the project 2 weeks early and I learned the importance of..."
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}