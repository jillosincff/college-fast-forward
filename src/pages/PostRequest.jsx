import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { JobRequest } from '@/entities/JobRequest';
import { useToast } from '@/components/ui/use-toast';
import { navigate, useParams } from '@/components/utils/navigation';
import JobRequestForm from '@/components/jobs/JobRequestForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Zap, TrendingUp, Heart, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PostRequestPage() { // Renamed from PostRequest
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const editId = params.edit || params.editId;
  const postType = params.type; // 'parent' for parent questions
  const isParentQuestion = postType === 'parent' || user?.persona === 'parent';

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed showSuccess state as we're now navigating directly
  // Removed submittedRequest state as we're now navigating directly
  const [initialData, setInitialData] = useState(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Stats for hero section
  const [stats] = useState({
    activeHelpers: 2847,
    avgResponseTime: '< 24 hours',
    successRate: 89
  });

  useEffect(() => {
    if (editId) {
      const fetchRequest = async () => {
        setIsLoadingInitial(true);
        try {
          const requestData = await JobRequest.get(editId);
          setInitialData(requestData);
        } catch (error) {
          console.error("Failed to fetch request for editing:", error);
          toast({ title: "Error loading request", variant: "destructive" });
        } finally {
          setIsLoadingInitial(false);
        }
      };
      fetchRequest();
    } else {
      setIsLoadingInitial(false);
    }
  }, [editId, toast]);

  const handleSubmit = async (values) => { // Changed requestData param to values for clarity with outline
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Determine poster type based on user persona
      let posterType = 'student';
      if (user?.persona === 'parent' || user?.roles?.includes('parent')) {
        posterType = 'parent';
      } else if (user?.persona === 'alumni' || user?.roles?.includes('alumni')) {
        posterType = 'alumni';
      }

      // Parse user name - handle "Last, First" format from university systems
      let posterFirstName = user?.first_name || '';
      let posterLastName = user?.last_name || '';
      let posterName = user?.full_name || '';
      
      // If full_name contains a comma, it's likely "Last, First" format
      if (posterName && posterName.includes(',')) {
        const parts = posterName.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          posterLastName = parts[0]; // Last name is before comma
          posterFirstName = parts[1].split(' ')[0]; // First name is after comma (ignore middle initials)
          posterName = `${posterFirstName} ${posterLastName}`; // Normalize to "First Last"
        }
      } else if (posterName && !posterFirstName) {
        // Standard "First Last" format - extract first name
        const nameParts = posterName.trim().split(' ');
        posterFirstName = nameParts[0] || '';
        posterLastName = nameParts.slice(1).join(' ') || '';
      }

      const requestData = {
        ...values,
        status: 'active',
        poster_type: posterType,
        is_anonymous: values.is_anonymous || false,
        poster_profile_image: user?.profile_image_url || null,
        poster_name: posterName,
        poster_first_name: posterFirstName,
        poster_last_name: posterLastName,
      };

      let createdRequest;
      
      if (editId) {
        await JobRequest.update(editId, requestData);
        toast({
          title: "✅ Request Updated",
          description: "Your request has been renewed for another 30 days and is now live.",
        });
      } else {
        createdRequest = await JobRequest.create(requestData);
        toast({
          title: "✅ Request Posted!",
          description: "This request will be live for 30 days. Your help request is now visible to the community.",
        });

        // Send push notifications to matching parents/alumni (async, don't block UI)
        if (createdRequest?.id) {
          try {
            // Send push notifications to matched helpers
            base44.functions.invoke('sendStudentRequestPush', { 
              request_id: createdRequest.id,
              request_data: createdRequest
            }).catch(err => {
              console.error('Failed to send push notifications:', err);
            });
            
            // Also send email notifications (existing flow)
            base44.functions.invoke('notifyMatchingParents', { 
              request_id: createdRequest.id 
            }).catch(err => {
              console.error('Failed to notify matching parents via email:', err);
            });
          } catch (err) {
            console.error('Failed to trigger notifications:', err);
          }
        }
      }
      
      // Navigate with refresh parameter to trigger reload
      setTimeout(() => {
        navigate('Connections', { refresh: 'true' });
      }, 1500);
      
    } catch (error) {
      console.error('Failed to submit request:', error); // Changed log message
      toast({
        title: "Failed to submit", // Changed title
        description: error.message || "Please try again.", // Changed description to use error.message
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('Dashboard');
  };

  // Removed conditional rendering for showSuccess, as we now navigate away.
  // if (showSuccess && submittedRequest) {
  //   return <PostSubmissionSuccess request={submittedRequest} />;
  // }

  if (isLoadingInitial && editId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-4 text-slate-600">Loading your request for editing...</span>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .hero-section {
          background: linear-gradient(to right, #0021A5, #FA4616);
          min-height: 240px;
          padding: 48px 24px;
          color: white;
          text-align: center;
          position: relative;
          border-radius: 1.5rem;
          margin: 24px;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 32px;
          line-height: 1.5;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }

        .stat-item {
          font-size: 0.875rem;
          opacity: 0.9;
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .back-button {
          position: absolute;
          top: 24px;
          left: 24px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .main-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px 48px;
        }

        .form-container {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(229, 231, 235, 0.8);
          margin-top: -40px;
          position: relative;
          z-index: 10;
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .form-subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .tips-section {
          background: rgba(0, 33, 165, 0.05);
          border: 1px solid rgba(0, 33, 165, 0.1);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .tips-title {
          font-size: 1rem;
          font-weight: 600;
          color: #0021A5;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          color: #475569;
          font-size: 0.875rem;
          line-height: 1.6;
        }

        .tips-list li {
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .tips-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #0021A5;
          font-weight: 600;
        }

        .examples-section {
          background: rgba(250, 70, 22, 0.05);
          border: 1px solid rgba(250, 70, 22, 0.15);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .examples-title {
          font-size: 1rem;
          font-weight: 600;
          color: #FA4616;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .example-card {
          background: white;
          border: 2px solid rgba(250, 70, 22, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .example-card:last-child {
          margin-bottom: 0;
        }

        .example-label {
          display: inline-block;
          background: #FA4616;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .example-text {
          color: #334155;
          font-size: 0.875rem;
          line-height: 1.6;
          font-style: italic;
        }

        .bad-example {
          border-color: rgba(239, 68, 68, 0.2);
        }

        .bad-example .example-label {
          background: #ef4444;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-stats {
            gap: 16px;
          }

          .hero-section {
            margin: 16px;
            padding: 32px 20px;
          }

          .back-button {
            position: static;
            margin-bottom: 16px;
            align-self: flex-start;
          }

          .form-container {
            margin: 16px;
            padding: 24px;
            margin-top: -20px;
          }

          .main-content {
            padding: 0 0 24px;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <div className="hero-section">
          <button onClick={handleBackToDashboard} className="back-button">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="hero-content">
            {isParentQuestion ? (
              <>
                <div className="hero-badge">❓ Get advice from the Gator community</div>
                <h1 className="hero-title">Ask Your Question</h1>
                <p className="hero-subtitle">
                  Have a question about careers, college, or helping your student? Ask the Gator Network! Other parents and alumni can share their experience and advice.
                </p>
              </>
            ) : (
              <>
                <div className="hero-badge">🚀 Join 2,847+ students who found help</div>
                <h1 className="hero-title">Get Help From Your Gator Network</h1>
                <p className="hero-subtitle">
                  Tell us what you're looking for and let our community of parents, alumni, and fellow students connect you with the right opportunities.
                </p>
              </>
            )}
            
            <div className="hero-stats">
              <span className="stat-item">
                <Users className="w-4 h-4" />
                {stats.activeHelpers.toLocaleString()} active helpers
              </span>
              <span className="stat-item">
                <Zap className="w-4 h-4" />
                {stats.avgResponseTime} avg response
              </span>
              <span className="stat-item">
                <TrendingUp className="w-4 h-4" />
                {stats.successRate}% success rate
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">{editId ? 'Edit Your Request' : (isParentQuestion ? 'What Would You Like to Know?' : 'Share Your Career Goals')}</h2>
              <p className="form-subtitle">
                {isParentQuestion 
                  ? 'Be specific about what advice you\'re looking for - other parents and alumni love to share their experience!'
                  : 'The more specific you are, the better we can match you with the right connections.'}
              </p>
            </div>

            {/* Tips Section */}
            <div className="tips-section">
              <h3 className="tips-title">
                <Heart className="w-5 h-5" />
                {isParentQuestion ? 'Tips for Getting Great Advice' : 'Tips for a Great Request'}
              </h3>
              <ul className="tips-list">
                {isParentQuestion ? (
                  <>
                    <li>Share relevant context (your student's situation, your own experience)</li>
                    <li>Be specific about what advice would be most helpful</li>
                    <li>Mention if you're looking for other parents with similar experiences</li>
                    <li>Feel free to keep details anonymous if preferred</li>
                  </>
                ) : (
                  <>
                    <li>Be specific about your target role and industry</li>
                    <li>Mention any companies you're particularly interested in</li>
                    <li>Include your timeline (when you want to start)</li>
                    <li>Share what type of help would be most valuable (intro, advice, resume review, etc.)</li>
                    <li>Upload your resume to help connections understand your background</li>
                  </>
                )}
              </ul>
            </div>

            {/* Examples Section */}
            <div className="examples-section">
              <h3 className="examples-title">
                <Lightbulb className="w-5 h-5" />
                {isParentQuestion ? 'Example Parent Questions' : 'Examples: What Makes a Strong Request?'}
              </h3>
              
              {isParentQuestion ? (
                <>
                  <div className="example-card">
                    <span className="example-label">✅ Great Example</span>
                    <p className="example-text">
                      "My daughter is a sophomore considering switching from pre-med to business. Any parents who've navigated a major change with their student? How did you support them through it?"
                    </p>
                  </div>

                  <div className="example-card">
                    <span className="example-label">✅ Great Example</span>
                    <p className="example-text">
                      "Looking for advice on helping my son prepare for consulting recruiting. He's a junior in finance - what should he be doing now to be ready for fall recruiting?"
                    </p>
                  </div>

                  <div className="example-card">
                    <span className="example-label">✅ Great Example</span>
                    <p className="example-text">
                      "Any parents with connections to the entertainment industry? My student is interested in entertainment law but we don't know anyone in that world. Would love to connect."
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="example-card">
                    <span className="example-label">✅ Great Example</span>
                    <p className="example-text">
                      "I'm a Computer Science junior looking for a software engineering internship at a fintech company (Stripe, Square, or similar). I have experience with React and Python, and I'm particularly interested in payment systems. I'm hoping for an intro to anyone in engineering at these companies, or advice on how to break into fintech. Available for Summer 2026."
                    </p>
                  </div>

                  <div className="example-card">
                    <span className="example-label">✅ Great Example</span>
                    <p className="example-text">
                      "Marketing major seeking advice from alumni working in brand management at CPG companies like P&G, Unilever, or Coca-Cola. I'm trying to understand what the interview process looks like and what skills I should focus on during my senior year. Also open to informational interviews or resume feedback."
                    </p>
                  </div>

                  <div className="example-card bad-example">
                    <span className="example-label">❌ Too Vague</span>
                    <p className="example-text">
                      "Looking for a job in business. Need help."
                    </p>
                  </div>

                  <div className="example-card bad-example">
                    <span className="example-label">❌ Too Vague</span>
                    <p className="example-text">
                      "Need an internship somewhere. Any company is fine."
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Form */}
            <JobRequestForm 
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              user={user}
              initialData={initialData}
              isParentQuestion={isParentQuestion}
            />
          </div>
        </div>
      </div>
    </>
  );
}