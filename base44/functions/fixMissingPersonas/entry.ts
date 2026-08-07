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
            const email = u.email?.toLowerCase() || '';
            // Only a school email is confident evidence of a student. Everyone else
            // is left untouched — guessing "parent" mislabels students at schools
            // we don't recognize. They pick their own persona when they finish onboarding.
            const isSchoolEmail = email.endsWith('.edu');

            if (!isSchoolEmail) {
                results.skipped.push({ id: u.id, email: u.email, name: u.full_name, reason: 'no_reliable_signal' });
                continue;
            }

            if (dryRun) {
                results.students.push({ id: u.id, email: u.email, name: u.full_name });
                continue;
            }

            try {
                await base44.asServiceRole.entities.User.update(u.id, {
                    persona: 'student',
                    roles: ['student'],
                    onboarding_completed: false // They still need to complete onboarding
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