import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || !user.roles?.includes('admin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get all users without a persona
        const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 500);
        const usersWithoutPersona = allUsers.filter(u => !u.persona && !u.roles?.includes('admin'));

        const students = [];
        const parents = [];

        for (const u of usersWithoutPersona) {
            const email = u.email?.toLowerCase() || '';
            const isUFLEmail = email.endsWith('@ufl.edu');
            
            const userInfo = {
                id: u.id,
                email: u.email,
                name: u.full_name || 'No name',
                suggestedPersona: isUFLEmail ? 'gator (student)' : 'parent'
            };

            if (isUFLEmail) {
                students.push(userInfo);
            } else {
                parents.push(userInfo);
            }
        }

        return Response.json({
            total: usersWithoutPersona.length,
            breakdown: {
                ufl_students: students.length,
                parents: parents.length
            },
            ufl_students: students,
            parents: parents
        });

    } catch (error) {
        console.error('listUsersWithoutPersona error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});