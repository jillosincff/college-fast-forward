import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || !user.roles?.includes('admin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { dryRun = true } = await req.json().catch(() => ({}));

        console.log('Starting fixMissingPersonas, dryRun:', dryRun);

        // Get all users without a persona - check for empty string too
        const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 500);
        console.log('Total users fetched:', allUsers.length);
        
        const usersWithoutPersona = allUsers.filter(u => {
            const hasNoPersona = !u.persona || u.persona === '' || u.persona === null;
            const isNotAdmin = !u.roles?.includes('admin');
            return hasNoPersona && isNotAdmin;
        });
        
        console.log('Users without persona:', usersWithoutPersona.length);

        const results = {
            total: usersWithoutPersona.length,
            students: [],
            skipped: [],
            errors: [],
            dryRun
        };

        for (const u of usersWithoutPersona) {
            // Only auto-tag when the user already left CLEAR student signals:
            // a school AND career goals, or a completed onboarding. An .edu email
            // alone is not evidence (staff, alumni, parents can have one). If
            // unsure, leave persona blank — QuickOnboarding asks them directly.
            const hasGoals = !!u.career_goals && Object.keys(u.career_goals).length > 0;
            const hasClearStudentSignals = (!!u.school?.trim() && hasGoals) || u.onboarding_completed === true;

            if (!hasClearStudentSignals) {
                results.skipped.push({ id: u.id, email: u.email, name: u.full_name, reason: 'no_clear_student_signal' });
                continue;
            }

            if (dryRun) {
                results.students.push({ id: u.id, email: u.email, name: u.full_name });
                continue;
            }

            try {
                // Keep onboarding_completed exactly as it is — users who never
                // onboarded resume QuickOnboarding next sign-in.
                await base44.asServiceRole.entities.User.update(u.id, {
                    persona: 'student',
                    roles: ['student']
                });
                results.students.push({ id: u.id, email: u.email, name: u.full_name, status: 'updated' });
            } catch (err) {
                console.error('Failed to update user:', u.email, err.message);
                results.errors.push({ id: u.id, email: u.email, error: err.message });
            }
        }

        return Response.json({
            success: true,
            summary: {
                total: results.total,
                students: results.students.length,
                skipped: results.skipped.length,
                errors: results.errors.length
            },
            students: results.students,
            skipped: results.skipped,
            errors: results.errors,
            dryRun: results.dryRun
        });

    } catch (error) {
        console.error('fixMissingPersonas error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});