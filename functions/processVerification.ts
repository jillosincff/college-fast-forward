import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);
        const { token } = await req.json();
        
        if (!token) {
            return new Response(JSON.stringify({ 
                error: "Verification token is required." 
            }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        console.log('Processing verification for token:', token);

        // Find the registration attempt
        const registrationAttempts = await base44.asServiceRole.entities.RegistrationAttempt.filter({ 
            token: token, 
            status: 'pending' 
        });

        if (!registrationAttempts || registrationAttempts.length === 0) {
            return new Response(JSON.stringify({ 
                error: "Invalid or expired verification token." 
            }), { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        const attempt = registrationAttempts[0];
        console.log('Found registration attempt for:', attempt.email);

        // Check if user already exists
        const existingUsers = await base44.asServiceRole.entities.User.filter({ email: attempt.email });
        if (existingUsers && existingUsers.length > 0) {
            // Mark attempt as processed
            await base44.asServiceRole.entities.RegistrationAttempt.update(attempt.id, { status: 'processed' });
            
            return new Response(JSON.stringify({ 
                success: true,
                message: "Email verified! You can now sign in.",
                user: existingUsers[0]
            }), { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        // Create the actual user
        const userData = {
            email: attempt.email,
            full_name: attempt.full_name,
            password_hash: attempt.password_hash,
            email_verified: true,
            onboarding_completed: false,
            profile_completion_score: 25,
            persona: attempt.persona
        };

        const newUser = await base44.asServiceRole.entities.User.create(userData);
        console.log('User created:', newUser.id);

        // Mark registration attempt as processed
        await base44.asServiceRole.entities.RegistrationAttempt.update(attempt.id, { status: 'processed' });

        return new Response(JSON.stringify({ 
            success: true,
            message: "Email verified and account created! You can now sign in.",
            user: newUser
        }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (e) {
        console.error('Verification error:', e);
        return new Response(JSON.stringify({ 
            error: "Verification failed. Please try again.",
            details: e.message
        }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
});