import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || !user.roles?.includes('admin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { dryRun = true } = await req.json().catch(() => ({}));

        // Get all users without a persona
        const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 500);
        const usersWithoutPersona = allUsers.filter(u => !u.persona && !u.roles?.includes('admin'));

        const results = {
            total: usersWithoutPersona.length,
            students: [],
            parents: [],
            errors: [],
            dryRun
        };

        for (const u of usersWithoutPersona) {
            const email = u.email?.toLowerCase() || '';
            const isUFLEmail = email.endsWith('@ufl.edu');
            
            const assignedPersona = isUFLEmail ? 'gator' : 'parent';
            const assignedRoles = isUFLEmail ? ['gator'] : ['parent'];

            if (dryRun) {
                // Just categorize, don't update
                if (isUFLEmail) {
                    results.students.push({ id: u.id, email: u.email, name: u.full_name });
                } else {
                    results.parents.push({ id: u.id, email: u.email, name: u.full_name });
                }
            } else {
                // Actually update the user
                try {
                    await base44.asServiceRole.entities.User.update(u.id, {
                        persona: assignedPersona,
                        roles: assignedRoles,
                        onboarding_completed: false // They still need to complete onboarding
                    });

                    if (isUFLEmail) {
                        results.students.push({ id: u.id, email: u.email, name: u.full_name, status: 'updated' });
                    } else {
                        results.parents.push({ id: u.id, email: u.email, name: u.full_name, status: 'updated' });
                    }
                } catch (err) {
                    console.error('Failed to update user:', u.email, err.message);
                    results.errors.push({ id: u.id, email: u.email, error: err.message });
                }
            }
        }

        return Response.json({
            success: true,
            summary: {
                total: results.total,
                students: results.students.length,
                parents: results.parents.length,
                errors: results.errors.length
            },
            students: results.students,
            parents: results.parents,
            errors: results.errors,
            dryRun: results.dryRun
        });

    } catch (error) {
        console.error('fixMissingPersonas error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});