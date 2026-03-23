import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get all active student questions missing poster_email
        const allRequests = await base44.asServiceRole.entities.JobRequest.filter(
            { poster_type: 'student', status: 'active' },
            'created_date',
            500
        );

        const missingEmail = allRequests.filter(r => !r.poster_email);
        console.log(`Found ${missingEmail.length} student questions missing poster_email out of ${allRequests.length} total`);

        if (missingEmail.length === 0) {
            return Response.json({ success: true, message: 'No questions need backfill', updated: 0 });
        }

        // Get all users to match against
        const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
        console.log(`Loaded ${allUsers.length} users for matching`);

        // Build lookup maps
        // 1. By full_name (exact match)
        const usersByName = {};
        // 2. By normalized name parts (fuzzy match for "Last, First" vs "First Last")
        const usersByNormalizedName = {};

        for (const u of allUsers) {
            if (!u.email) continue;
            
            const name = (u.full_name || '').trim();
            if (name) {
                usersByName[name.toLowerCase()] = u.email;
                
                // Handle "Last, First M." format -> normalize to "first last"
                if (name.includes(',')) {
                    const parts = name.split(',').map(p => p.trim());
                    if (parts.length >= 2) {
                        const last = parts[0].toLowerCase();
                        const first = parts[1].split(' ')[0].toLowerCase();
                        usersByNormalizedName[`${first} ${last}`] = u.email;
                        usersByNormalizedName[`${last}, ${first}`] = u.email;
                    }
                } else {
                    const parts = name.toLowerCase().split(/\s+/);
                    if (parts.length >= 2) {
                        const first = parts[0];
                        const last = parts[parts.length - 1];
                        usersByNormalizedName[`${first} ${last}`] = u.email;
                        usersByNormalizedName[`${last}, ${first}`] = u.email;
                    }
                }
            }
        }

        console.log('Name lookup entries:', Object.keys(usersByName).length);
        console.log('Normalized lookup entries:', Object.keys(usersByNormalizedName).length);

        let updated = 0;
        let notFound = [];

        for (const request of missingEmail) {
            const posterName = (request.poster_name || '').trim();
            if (!posterName) {
                notFound.push({ id: request.id, reason: 'no poster_name' });
                continue;
            }

            let matchedEmail = null;

            // Try exact name match
            matchedEmail = usersByName[posterName.toLowerCase()];

            // Try normalized match
            if (!matchedEmail) {
                const normalized = posterName.toLowerCase().replace(/\s+[a-z]\.?$/i, '').trim();
                matchedEmail = usersByNormalizedName[normalized];
            }

            // Try with middle initial stripped: "Rotbart, Grant D." -> "grant rotbart"
            if (!matchedEmail && posterName.includes(',')) {
                const parts = posterName.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    const last = parts[0].toLowerCase();
                    const firstName = parts[1].split(' ')[0].toLowerCase();
                    matchedEmail = usersByNormalizedName[`${firstName} ${last}`];
                    
                    // Also try partial first name match against all users
                    if (!matchedEmail) {
                        for (const u of allUsers) {
                            if (!u.email) continue;
                            const uName = (u.full_name || '').toLowerCase();
                            if (uName.includes(firstName) && uName.includes(last)) {
                                matchedEmail = u.email;
                                break;
                            }
                        }
                    }
                }
            }

            if (matchedEmail) {
                await base44.asServiceRole.entities.JobRequest.update(request.id, {
                    poster_email: matchedEmail
                });
                updated++;
                console.log(`✅ Updated "${posterName}" -> ${matchedEmail}`);
            } else {
                notFound.push({ id: request.id, name: posterName });
                console.log(`❌ No match for "${posterName}"`);
            }
        }

        return Response.json({
            success: true,
            total_missing: missingEmail.length,
            updated,
            not_found: notFound.length,
            not_found_details: notFound
        });

    } catch (error) {
        console.error('Backfill error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});