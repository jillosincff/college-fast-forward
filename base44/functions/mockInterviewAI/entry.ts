import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, sessionId, interviewType, difficulty, companyName, jobTitle, questionCount, questionIndex, studentResponse } = await req.json();

    // ACTION: generate — create questions for a new interview
    if (action === 'generate') {
      // Check for real questions from DB
      let dbQuestions = [];
      if (companyName) {
        dbQuestions = await base44.entities.InterviewQuestion.filter(
          { company: companyName },
          '-upvote_count',
          5
        ).catch(() => []);
      }

      const realQs = dbQuestions.map(q => q.question_text).filter(Boolean);
      const neededCount = (questionCount || 5) - realQs.length;

      const genPrompt = `Generate ${Math.max(neededCount, questionCount || 5)} realistic interview questions for a ${difficulty || 'entry'} level ${jobTitle || 'general'} role${companyName ? ` at ${companyName}` : ''}.

Interview type: ${interviewType || 'mixed'}

${interviewType === 'behavioral' ? 'ALL questions should be behavioral (STAR method).' :
  interviewType === 'technical' ? 'ALL questions should be technical/problem-solving.' :
  interviewType === 'case' ? 'ALL questions should be case/business analysis.' :
  'Include a realistic mix: 2 behavioral, 1-2 technical/situational, 1 company-specific or case.'}

${realQs.length > 0 ? `These real questions were already asked at ${companyName}. Do NOT duplicate them but generate similar caliber:\n${realQs.join('\n')}` : ''}

For each question provide:
- id: "q1", "q2", etc.
- question: the interview question text
- type: "behavioral" | "technical" | "case" | "situational"

Return as JSON with a "questions" array.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: genPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  question: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Merge DB questions with generated ones
      const allQuestions = [];
      realQs.forEach((q, i) => {
        const dbQ = dbQuestions[i];
        allQuestions.push({
          id: `db${i + 1}`,
          question: q,
          type: dbQ?.question_type || 'behavioral',
        });
      });
      (result.questions || []).forEach((q, i) => {
        if (allQuestions.length < (questionCount || 5)) {
          allQuestions.push({ ...q, id: q.id || `g${i + 1}` });
        }
      });

      // Create session
      const session = await base44.entities.MockInterviewSession.create({
        user_id: user.id,
        user_email: user.email,
        company_name: companyName || '',
        job_title: jobTitle || '',
        interview_type: interviewType || 'mixed',
        difficulty: difficulty || 'entry',
        status: 'in_progress',
        question_count: allQuestions.length,
        current_question_index: 0,
        questions: allQuestions.map(q => ({ ...q, student_response: '', skipped: false, score: 0, feedback: {} })),
        started_at: new Date().toISOString(),
      });

      return Response.json({ success: true, session, dbQuestionsFound: realQs.length });
    }

    // ACTION: score — evaluate a student's response
    if (action === 'score') {
      const sessions = await base44.entities.MockInterviewSession.filter({ id: sessionId });
      const session = sessions[0];
      if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

      const question = session.questions[questionIndex];
      if (!question) return Response.json({ error: 'Question not found' }, { status: 404 });

      const scoringPrompt = `You are FASTIQ, an expert interview coach evaluating a candidate's response.

QUESTION: ${question.question}
QUESTION TYPE: ${question.type}
STUDENT RESPONSE: ${studentResponse}
JOB CONTEXT: ${session.job_title || 'general'} at ${session.company_name || 'general company'}
DIFFICULTY: ${session.difficulty} level

Evaluate and return JSON:
1. score (0-100): 90-100 exceptional, 70-89 strong, 50-69 adequate, 30-49 weak, 0-29 poor
2. overall: 2-3 sentence honest feedback
3. strengths: array of 2-3 specific things done well
4. improvements: array of 2-3 specific actionable fixes (NOT generic — reference their actual words)
5. star_breakdown (behavioral only): { situation: {present: bool, quality: "strong"|"weak"|"missing"}, task: {...}, action: {...}, result: {...} }
6. example_answer: 150-200 word model answer showing what great looks like${question.type === 'behavioral' ? ' (use STAR structure)' : ''}

Be honest. Weak answers score below 50. Don't encourage mediocrity.`;

      const feedback = await base44.integrations.Core.InvokeLLM({
        prompt: scoringPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number" },
            overall: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            improvements: { type: "array", items: { type: "string" } },
            star_breakdown: {
              type: "object",
              properties: {
                situation: { type: "object", properties: { present: { type: "boolean" }, quality: { type: "string" } } },
                task: { type: "object", properties: { present: { type: "boolean" }, quality: { type: "string" } } },
                action: { type: "object", properties: { present: { type: "boolean" }, quality: { type: "string" } } },
                result: { type: "object", properties: { present: { type: "boolean" }, quality: { type: "string" } } }
              }
            },
            example_answer: { type: "string" }
          }
        }
      });

      // Update session
      const updatedQuestions = [...session.questions];
      updatedQuestions[questionIndex] = {
        ...question,
        student_response: studentResponse,
        score: feedback.score || 0,
        feedback,
      };

      await base44.entities.MockInterviewSession.update(sessionId, {
        questions: updatedQuestions,
        current_question_index: questionIndex + 1,
      });

      return Response.json({ success: true, feedback, score: feedback.score || 0 });
    }

    // ACTION: complete — finalize the interview
    if (action === 'complete') {
      const sessions = await base44.entities.MockInterviewSession.filter({ id: sessionId });
      const session = sessions[0];
      if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

      const answered = session.questions.filter(q => q.student_response && !q.skipped);
      const scores = answered.map(q => q.score || 0);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const summaryPrompt = `Summarize this mock interview performance.

Questions and scores:
${session.questions.map((q, i) => `Q${i + 1}: "${q.question}" — ${q.skipped ? 'Skipped' : `Score: ${q.score}/100`}`).join('\n')}

Average score: ${avgScore}/100
Interview type: ${session.interview_type}
Company: ${session.company_name || 'General'}

Return JSON with:
- overall_feedback: 2-3 sentence honest assessment (Playfair italic style)
- strengths_shown: 3 specific recurring strengths
- areas_to_improve: 3 specific recurring weaknesses`;

      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: summaryPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_feedback: { type: "string" },
            strengths_shown: { type: "array", items: { type: "string" } },
            areas_to_improve: { type: "array", items: { type: "string" } }
          }
        }
      });

      await base44.entities.MockInterviewSession.update(sessionId, {
        status: 'complete',
        overall_score: avgScore,
        overall_feedback: summary.overall_feedback || '',
        strengths_shown: summary.strengths_shown || [],
        areas_to_improve: summary.areas_to_improve || [],
        completed_at: new Date().toISOString(),
      });

      // Log activity
      try {
        await base44.entities.ActivityLog.create({
          student_email: user.email,
          type: 'interview_completed',
          company_name: session.company_name || '',
          notes: `Mock interview — ${session.interview_type} · Score: ${avgScore}/100`,
          fastiq_generated: true,
        });
      } catch (e) { console.log('Activity log failed:', e.message); }

      return Response.json({
        success: true,
        overall_score: avgScore,
        overall_feedback: summary.overall_feedback,
        strengths_shown: summary.strengths_shown,
        areas_to_improve: summary.areas_to_improve,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('mockInterviewAI error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});