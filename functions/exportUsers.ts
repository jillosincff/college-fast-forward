import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can export user data
        if (!user.roles?.includes('admin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { persona } = await req.json().catch(() => ({}));

        // Build filter based on persona
        let filter = {};
        if (persona && persona !== 'all') {
            filter = { persona };
        }

        // Get all users matching the filter
        const users = await base44.asServiceRole.entities.User.filter(filter, '-created_date', 1000);

        // Filter to only parents and alumni if no specific persona requested
        let filteredUsers = users;
        if (!persona || persona === 'all') {
            filteredUsers = users.filter(u => u.persona === 'parent' || u.persona === 'alumni');
        }

        // Create CSV content
        const headers = ['Full Name', 'Email', 'Persona', 'Created Date'];
        const rows = filteredUsers.map(u => [
            u.full_name || '',
            u.email || '',
            u.persona || '',
            u.created_date ? new Date(u.created_date).toLocaleDateString() : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.csv`
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});