import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const userMakingRequest = await base44.auth.me();
        if (!userMakingRequest) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        const { userId, email } = await req.json();

        if (!userId && !email) {
            return Response.json({ error: 'userId or email parameter is required' }, { status: 400 });
        }

        console.log('Looking up user with:', { userId, email });

        let userToDisplay;
        
        if (userId) {
            // Use filter with id for efficient lookup
            const users = await base44.asServiceRole.entities.User.filter({ id: userId });
            userToDisplay = users?.[0];
        }
        
        if (!userToDisplay && email) {
            const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
            userToDisplay = users?.[0];
        }

        if (!userToDisplay) {
            console.log('User not found');
            return Response.json({ error: 'User not found' }, { status: 404 });
        }
        
        console.log('Found user:', userToDisplay.email);

        // Fetch activity stats for parents/alumni helpers
        let activityStats = { students_helped: 0, answers_given: 0, intros_made: 0 };
        const isHelper = userToDisplay.persona === 'parent' || 
          (userToDisplay.persona === 'alumni' && userToDisplay.alumni_intent === 'help_students') ||
          (userToDisplay.ways_to_help && userToDisplay.ways_to_help.length > 0);

        if (isHelper) {
          try {
            const [answers, jobAnswers, intros] = await Promise.all([
              base44.asServiceRole.entities.Answer.filter({ answerer_email: userToDisplay.email }, undefined, 500).catch(() => []),
              base44.asServiceRole.entities.JobAnswer.filter({ responder_email: userToDisplay.email }, undefined, 500).catch(() => []),
              base44.asServiceRole.entities.Intro.filter({ helper_user_id: userToDisplay.id }, undefined, 200).catch(() => []),
            ]);
            const uniqueStudents = new Set([
              ...(answers || []).map(a => a.question_id),
              ...(jobAnswers || []).map(a => a.job_request_id),
              ...(intros || []).map(i => i.student_id),
            ]);
            activityStats = {
              students_helped: uniqueStudents.size,
              answers_given: (answers || []).length + (jobAnswers || []).length,
              intros_made: (intros || []).length,
            };
          } catch (e) {
            console.log('Could not fetch activity stats:', e.message);
          }
        }

        // Fetch karma data if applicable
        let karmaLevel = null;
        let karmaPoints = null;
        if (userToDisplay.family_group_id) {
          try {
            const karmaRecords = await base44.asServiceRole.entities.FamilyKarma.filter(
              { family_group_id: userToDisplay.family_group_id }, undefined, 1
            );
            if (karmaRecords && karmaRecords[0]) {
              karmaLevel = karmaRecords[0].current_level || karmaRecords[0].level;
              karmaPoints = karmaRecords[0].total_karma || karmaRecords[0].this_month_karma || 0;
            }
          } catch (e) {
            console.log('Could not fetch karma:', e.message);
          }
        }

        const userData = {
            id: userToDisplay.id,
            first_name: userToDisplay.first_name,
            last_name: userToDisplay.last_name,
            full_name: userToDisplay.full_name,
            bio: userToDisplay.bio,
            persona: userToDisplay.persona,
            alumni_intent: userToDisplay.alumni_intent,
            major: userToDisplay.major,
            graduation_year: userToDisplay.graduation_year,
            company: userToDisplay.company || userToDisplay.current_company,
            job_title: userToDisplay.job_title || userToDisplay.current_position,
            industry: userToDisplay.industry,
            linkedin_url: userToDisplay.linkedin_url,
            expertise_areas: userToDisplay.expertise_areas || [],
            mentorship_topics: userToDisplay.mentorship_topics || [],
            ways_to_help: userToDisplay.ways_to_help || [],
            can_provide_referrals: userToDisplay.can_provide_referrals || false,
            is_founding_member: userToDisplay.is_founding_member || false,
            created_date: userToDisplay.created_date,
            karma_level: karmaLevel,
            karma_points: karmaPoints,
            students_helped: activityStats.students_helped,
            answers_given: activityStats.answers_given,
            intros_made: activityStats.intros_made,
        };

        return Response.json(userData);

    } catch (error) {
        console.error('Error in getPublicUserInfo function:', error);
        return Response.json({ error: error.message || 'An internal error occurred' }, { status: 500 });
    }
});