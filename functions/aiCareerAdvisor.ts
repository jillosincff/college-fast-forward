import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const SCHOOL_NAME = "UF";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId, conversationType } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get aggregated data context
    const dataContext = await getDataContext(base44, message);
    
    // Get potential mentors
    const mentorContext = await getMentorContext(base44, message);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(dataContext, mentorContext);

    // Call LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUser question: ${message}`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string", description: "The advisor's response to the user" },
          suggested_mentor: {
            type: "object",
            properties: {
              name: { type: "string" },
              title: { type: "string" },
              reason: { type: "string" },
              user_id: { type: "string" }
            },
            description: "A mentor to suggest, if relevant"
          },
          conversation_type: {
            type: "string",
            enum: ["salary", "interview", "career", "negotiation", "general"]
          }
        },
        required: ["response", "conversation_type"]
      }
    });

    return Response.json({
      success: true,
      response: response.response,
      suggested_mentor: response.suggested_mentor || null,
      conversation_type: response.conversation_type
    });

  } catch (error) {
    console.error('AI Career Advisor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function getDataContext(base44, message) {
  const messageLower = message.toLowerCase();
  let context = [];

  try {
    // Query salary data if relevant
    if (messageLower.includes('salary') || messageLower.includes('offer') || 
        messageLower.includes('pay') || messageLower.includes('comp') ||
        messageLower.includes('negotiate') || messageLower.includes('$')) {
      
      const salaryData = await base44.asServiceRole.entities.AICareerSubmission.filter(
        { submission_type: 'salary' },
        '-created_date',
        100
      );

      if (salaryData.length > 0) {
        // Aggregate salary data
        const byRole = {};
        const byCompanyType = {};
        const byLocation = {};

        salaryData.forEach(s => {
          if (s.base_salary) {
            // By role
            const role = s.role_title?.toLowerCase() || 'unknown';
            if (!byRole[role]) byRole[role] = [];
            byRole[role].push(s.base_salary);

            // By company type
            const compType = s.company_type || 'other';
            if (!byCompanyType[compType]) byCompanyType[compType] = [];
            byCompanyType[compType].push(s.base_salary);

            // By location
            const loc = s.location_city || 'unknown';
            if (!byLocation[loc]) byLocation[loc] = [];
            byLocation[loc].push(s.base_salary);
          }
        });

        context.push(`SALARY DATA FROM ${SCHOOL_NAME} NETWORK (${salaryData.length} data points):`);
        
        // Summarize by role
        Object.entries(byRole).slice(0, 5).forEach(([role, salaries]) => {
          const min = Math.min(...salaries);
          const max = Math.max(...salaries);
          const median = salaries.sort((a,b) => a-b)[Math.floor(salaries.length/2)];
          context.push(`- ${role}: $${min.toLocaleString()}-$${max.toLocaleString()}, median $${median.toLocaleString()} (n=${salaries.length})`);
        });
      }
    }

    // Query interview data if relevant
    if (messageLower.includes('interview') || messageLower.includes('prep') ||
        messageLower.includes('question') || messageLower.includes('expect')) {
      
      const interviewData = await base44.asServiceRole.entities.AICareerSubmission.filter(
        { submission_type: 'interview' },
        '-created_date',
        50
      );

      if (interviewData.length > 0) {
        context.push(`\nINTERVIEW DATA FROM ${SCHOOL_NAME} NETWORK (${interviewData.length} submissions):`);
        
        // Group by company
        const byCompany = {};
        interviewData.forEach(i => {
          const company = i.company_name || 'Unknown';
          if (!byCompany[company]) byCompany[company] = [];
          byCompany[company].push(i);
        });

        Object.entries(byCompany).slice(0, 5).forEach(([company, interviews]) => {
          const types = [];
          if (interviews.some(i => i.had_behavioral)) types.push('behavioral');
          if (interviews.some(i => i.had_technical)) types.push('technical');
          if (interviews.some(i => i.had_case_study)) types.push('case study');
          if (interviews.some(i => i.had_product_design)) types.push('product design');
          if (interviews.some(i => i.had_estimation)) types.push('estimation');
          
          context.push(`- ${company}: Common question types: ${types.join(', ') || 'various'}`);
          
          // Include tips if available
          const tips = interviews.filter(i => i.tips_for_candidates).map(i => i.tips_for_candidates);
          if (tips.length > 0) {
            context.push(`  Tips: "${tips[0].substring(0, 100)}..."`);
          }
        });
      }
    }

    // Also pull from existing SalarySubmission and InterviewQuestion entities
    try {
      const existingSalaries = await base44.asServiceRole.entities.SalarySubmission.filter(
        { is_visible: true },
        '-created_date',
        50
      );
      
      if (existingSalaries.length > 0) {
        context.push(`\nADDITIONAL SALARY INSIGHTS (${existingSalaries.length} verified data points):`);
        const byIndustry = {};
        existingSalaries.forEach(s => {
          const ind = s.industry || 'Other';
          if (!byIndustry[ind]) byIndustry[ind] = [];
          if (s.base_salary) byIndustry[ind].push(s.base_salary);
        });
        
        Object.entries(byIndustry).slice(0, 5).forEach(([industry, salaries]) => {
          if (salaries.length > 0) {
            const median = salaries.sort((a,b) => a-b)[Math.floor(salaries.length/2)];
            context.push(`- ${industry}: median $${median.toLocaleString()} (n=${salaries.length})`);
          }
        });
      }
    } catch (e) {
      // SalarySubmission entity might not exist
    }

    try {
      const existingQuestions = await base44.asServiceRole.entities.InterviewQuestion.filter(
        { is_visible: true },
        '-created_date',
        30
      );
      
      if (existingQuestions.length > 0) {
        context.push(`\nINTERVIEW QUESTION PATTERNS (${existingQuestions.length} recent questions):`);
        const byCompany = {};
        existingQuestions.forEach(q => {
          const company = q.company || 'Unknown';
          if (!byCompany[company]) byCompany[company] = { count: 0, types: new Set() };
          byCompany[company].count++;
          if (q.question_type) byCompany[company].types.add(q.question_type);
        });
        
        Object.entries(byCompany).slice(0, 5).forEach(([company, data]) => {
          context.push(`- ${company}: ${data.count} questions reported, types: ${[...data.types].join(', ') || 'various'}`);
        });
      }
    } catch (e) {
      // InterviewQuestion entity might not exist
    }

  } catch (error) {
    console.error('Error fetching data context:', error);
  }

  return context.join('\n');
}

async function getMentorContext(base44, message) {
  try {
    // Get available parent mentors
    const parents = await base44.asServiceRole.entities.ParentExpertise.filter(
      { available: true },
      '-students_helped',
      10
    );

    if (parents.length === 0) return '';

    let mentorList = `\nAVAILABLE MENTORS FOR DEEPER HELP:\n`;
    
    parents.forEach(p => {
      mentorList += `- ${p.parent_name || 'Parent'}: ${p.current_role || 'Professional'} at ${p.current_company || 'Company'}, ${p.industry || 'Industry'}, can help with: ${(p.help_types || []).join(', ')}\n`;
      mentorList += `  User ID: ${p.parent_id}\n`;
    });

    return mentorList;
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return '';
  }
}

function buildSystemPrompt(dataContext, mentorContext) {
  return `You are a career advisor for ${SCHOOL_NAME} students and alumni. You have access to aggregated, anonymous data about salaries and interviews from the ${SCHOOL_NAME} network.

Your role:
- Help students evaluate job offers with market context
- Prepare students for interviews with relevant insights
- Provide career guidance grounded in real outcomes
- Connect students with mentors when deeper help is needed

Guidelines:
- Never reveal exact data points or identify specific submissions
- Speak in ranges and patterns ("I'm seeing...", "Typically...", "Based on the network data...")
- Always offer to connect with human mentors for deeper conversations
- Be encouraging but honest
- Acknowledge when you don't have enough data
- Keep responses conversational and helpful, not overly long
- Format with markdown for readability (bold key points, use bullet points)

${dataContext ? `\n--- DATA CONTEXT ---\n${dataContext}\n--- END DATA ---` : 'Note: Limited data available. Provide general guidance and encourage data contribution.'}

${mentorContext ? `\n${mentorContext}` : ''}

When suggesting a mentor, include their name, title, and why they'd be helpful. Only suggest ONE mentor if highly relevant.

Important: This is career coaching, not financial or legal advice. Your responses are based on aggregated anonymous data - never claim to have specific information about any individual's compensation.`;
}