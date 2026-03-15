import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    // Get followed companies needing a check (alerts enabled, not recently checked)
    const allFollowed = await base44.asServiceRole.entities.FollowedCompany.filter(
      { alerts_enabled: true }, '-added_at', 200
    );
    const needsCheck = allFollowed.filter(f => !f.last_checked_at || f.last_checked_at < sixHoursAgo);
    const batch = needsCheck.slice(0, 20);

    console.log(`[Monitor] ${allFollowed.length} total followed, ${needsCheck.length} due, processing ${batch.length}`);

    const results = [];

    for (const company of batch) {
      try {
        // Get fresh intel from cache or generate
        let intel = null;
        const cached = await base44.asServiceRole.entities.CompanyIntelCache.filter(
          { company_name: company.company_name }, '-created_date', 1
        );
        if (cached?.[0] && new Date(cached[0].expires_at) > new Date()) {
          intel = cached[0];
        } else {
          // Generate fresh brief via LLM
          const webRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Research ${company.company_name} hiring activity as of March 2026. Find entry-level and internship roles, hiring signals, layoffs, hiring freezes, financial issues.`,
            add_context_from_internet: true,
          });
          const parsed = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Synthesize research about ${company.company_name}. Return hiring_score 0-100, hiring_signal hot/warm/cool, overall_signal green/yellow/red, recommendation_text (one sentence), entry_level_roles_count, intern_roles_count, warning_signals array.\n\nRESEARCH:\n${String(typeof webRes === 'string' ? webRes : JSON.stringify(webRes)).substring(0, 3000)}`,
            response_json_schema: {
              type: 'object',
              properties: {
                hiring_score: { type: 'integer' }, hiring_signal: { type: 'string' },
                overall_signal: { type: 'string', enum: ['green','yellow','red'] },
                recommendation_text: { type: 'string' },
                entry_level_roles_count: { type: 'integer' }, intern_roles_count: { type: 'integer' },
                warning_signals: { type: 'array', items: { type: 'object', properties: { type: { type: 'string' }, text: { type: 'string' } } } },
              },
              required: ['hiring_score', 'overall_signal', 'recommendation_text'],
            },
          });
          // Save to cache
          const intelRecord = await base44.asServiceRole.entities.CompanyIntelCache.create({
            company_name: company.company_name, school_code: 'UF',
            hiring_score: parsed.hiring_score || 0, hiring_signal: parsed.hiring_signal || 'cool',
            overall_signal: parsed.overall_signal || 'yellow',
            recommendation: parsed.overall_signal === 'green' ? 'pursue' : parsed.overall_signal === 'red' ? 'deprioritize' : 'cautious',
            recommendation_text: parsed.recommendation_text || '',
            warning_signals: parsed.warning_signals || [],
            entry_level_roles_count: parsed.entry_level_roles_count || 0,
            intern_roles_count: parsed.intern_roles_count || 0,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          });
          intel = { ...intelRecord, ...parsed };
        }

        const newSignal = intel.overall_signal || 'yellow';
        const signalChanged = company.last_signal && newSignal !== company.last_signal;
        const entryLevel = intel.entry_level_roles_count || 0;
        const internships = intel.intern_roles_count || 0;
        const hasNewRoles = entryLevel > 0 || internships > 0;
        const hasWarnings = (intel.warning_signals || []).length > 0;

        // Update followed company record
        await base44.asServiceRole.entities.FollowedCompany.update(company.id, {
          previous_signal: company.last_signal,
          last_signal: newSignal,
          last_checked_at: new Date().toISOString(),
          latest_brief_id: intel.id || '',
          latest_recommendation: intel.recommendation_text || '',
          entry_level_count: entryLevel,
          intern_count: internships,
        });

        // Create alerts
        if (signalChanged) {
          const direction = newSignal === 'red' ? 'worsened' : newSignal === 'green' ? 'improved' : 'changed';
          await base44.asServiceRole.entities.CompanyAlert.create({
            student_email: company.student_email,
            company_name: company.company_name,
            alert_type: 'signal_change',
            is_read: false,
            summary: `${company.company_name}'s hiring signal ${direction} from ${company.last_signal} to ${newSignal}.`,
            data: { previous_signal: company.last_signal, new_signal: newSignal, recommendation: intel.recommendation_text || '' },
          });
        }

        if (hasNewRoles) {
          await base44.asServiceRole.entities.CompanyAlert.create({
            student_email: company.student_email,
            company_name: company.company_name,
            alert_type: 'new_roles',
            is_read: false,
            summary: `${company.company_name} posted ${entryLevel} entry-level and ${internships} internship roles.`,
            data: { entry_level: entryLevel, internships },
          });
        }

        if (hasWarnings && signalChanged) {
          await base44.asServiceRole.entities.CompanyAlert.create({
            student_email: company.student_email,
            company_name: company.company_name,
            alert_type: 'warning',
            is_read: false,
            summary: (intel.warning_signals || [])[0]?.text || 'New warning detected.',
            data: { warnings: intel.warning_signals },
          });
        }

        results.push({ company: company.company_name, signal: newSignal, changed: signalChanged });
      } catch (err) {
        console.error(`[Monitor] Error processing ${company.company_name}:`, err.message);
        results.push({ company: company.company_name, error: err.message });
      }
    }

    return Response.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error('monitorFollowedCompanies error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});