import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

console.log('🧹 cleanupExpiredOpportunities loaded');

Deno.serve(async (req) => {
    console.log('📨 Cleanup expired opportunities request received');
    
    try {
        const base44 = createClientFromRequest(req);
        
        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString();
        
        console.log('Cutoff date (30 days ago):', cutoffDate);
        
        // Get all active opportunities
        const opportunities = await base44.asServiceRole.entities.Opportunity.filter({
            status: 'active'
        });
        
        console.log('Total active opportunities:', opportunities.length);
        
        // Find expired ones (created more than 30 days ago)
        const expiredOpportunities = opportunities.filter(opp => {
            return opp.created_date < cutoffDate;
        });
        
        console.log('Expired opportunities (older than 30 days):', expiredOpportunities.length);
        
        // Mark them as expired
        let expiredCount = 0;
        for (const opp of expiredOpportunities) {
            try {
                await base44.asServiceRole.entities.Opportunity.update(opp.id, {
                    status: 'expired'
                });
                expiredCount++;
                console.log(`✅ Expired opportunity: ${opp.id} - ${opp.title}`);
            } catch (err) {
                console.error(`❌ Failed to expire ${opp.id}:`, err.message);
            }
        }
        
        return new Response(JSON.stringify({
            success: true,
            totalActive: opportunities.length,
            expiredCount,
            cutoffDate
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        return new Response(JSON.stringify({ 
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});