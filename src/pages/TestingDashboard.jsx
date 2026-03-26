import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Play, ChevronDown, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';

// ── Test runner helpers ──────────────────────────────────────────────────────

function statusColor(status) {
  if (status === 'pass') return 'text-green-700 bg-green-50 border-green-200';
  if (status === 'fail') return 'text-red-700 bg-red-50 border-red-200';
  if (status === 'running') return 'text-blue-700 bg-blue-50 border-blue-200';
  return 'text-slate-500 bg-slate-50 border-slate-200';
}

function StatusIcon({ status }) {
  if (status === 'pass') return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
  if (status === 'fail') return <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />;
  if (status === 'running') return <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />;
  return <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0" />;
}

function TestResultRow({ result }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border p-3 text-sm ${statusColor(result.status)}`}>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => result.details && setOpen(o => !o)}>
        <StatusIcon status={result.status} />
        <span className="font-medium flex-1">{result.name}</span>
        {result.duration && <span className="text-xs opacity-60">{result.duration}ms</span>}
        {result.details && (open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
      </div>
      {result.message && <p className="mt-1 ml-6 text-xs opacity-75">{result.message}</p>}
      {open && result.details && (
        <pre className="mt-2 ml-6 text-xs bg-white/60 rounded p-2 overflow-auto max-h-48">
          {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
        </pre>
      )}
    </div>
  );
}

function TestGroup({ title, color, tests, onRunAll, running }) {
  const passed = tests.filter(t => t.status === 'pass').length;
  const failed = tests.filter(t => t.status === 'fail').length;
  const total = tests.length;

  return (
    <Card className={`border-${color}-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {title}
            {total > 0 && (
              <span className="ml-3 text-sm font-normal text-slate-500">
                {passed}/{total} passed {failed > 0 && <span className="text-red-500">· {failed} failed</span>}
              </span>
            )}
          </CardTitle>
          <Button size="sm" onClick={onRunAll} disabled={running} className={`bg-${color}-600 hover:bg-${color}-700 text-white`}>
            {running ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            Run
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tests.length === 0 && <p className="text-sm text-slate-400 italic">Press Run to execute tests</p>}
        {tests.map((t, i) => <TestResultRow key={i} result={t} />)}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function TestingDashboard() {
  const { user } = useAuth();

  const [careerGoalsTests, setCareerGoalsTests] = useState([]);
  const [leadsTests, setLeadsTests] = useState([]);
  const [alumniTests, setAlumniTests] = useState([]);
  const [companyIntelTests, setCompanyIntelTests] = useState([]);
  const [outreachTests, setOutreachTests] = useState([]);
  const [emailTests, setEmailTests] = useState([]);
  const [authTests, setAuthTests] = useState([]);

  const [running, setRunning] = useState({});

  const run = (key, fn) => async () => {
    setRunning(r => ({ ...r, [key]: true }));
    await fn();
    setRunning(r => ({ ...r, [key]: false }));
  };

  const timed = async (fn) => {
    const start = Date.now();
    const result = await fn();
    return { ...result, duration: Date.now() - start };
  };

  // ── Career Goals Tests ──────────────────────────────────────────────────

  const runCareerGoalsTests = async () => {
    const results = [];

    // Test: user has career_goals field accessible
    results.push({ name: 'User career_goals field exists', status: 'running', message: '' });
    setCareerGoalsTests([...results]);
    await new Promise(r => setTimeout(r, 200));
    try {
      const me = await base44.auth.me();
      const hasGoals = me && 'career_goals' in me;
      results[results.length - 1] = {
        name: 'User career_goals field exists',
        status: hasGoals ? 'pass' : 'fail',
        message: hasGoals ? `Goals: ${JSON.stringify(me.career_goals)?.slice(0, 80) || 'null'}` : 'Field missing from user object',
        details: me?.career_goals,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'User career_goals field exists', status: 'fail', message: e.message };
    }
    setCareerGoalsTests([...results]);

    // Test: career_goals_conversation field
    results.push({ name: 'Career goals conversation persisted', status: 'running' });
    setCareerGoalsTests([...results]);
    await new Promise(r => setTimeout(r, 200));
    try {
      const me = await base44.auth.me();
      const conv = me?.career_goals_conversation;
      results[results.length - 1] = {
        name: 'Career goals conversation persisted',
        status: conv?.length > 0 ? 'pass' : 'fail',
        message: conv?.length > 0 ? `${conv.length} messages saved` : 'No conversation saved yet',
        details: conv?.slice(-2),
      };
    } catch (e) {
      results[results.length - 1] = { name: 'Career goals conversation persisted', status: 'fail', message: e.message };
    }
    setCareerGoalsTests([...results]);

    // Test: target_industries and target_functions are normalized
    results.push({ name: 'Goals normalization (industries/functions)', status: 'running' });
    setCareerGoalsTests([...results]);
    await new Promise(r => setTimeout(r, 200));
    try {
      const me = await base44.auth.me();
      const goals = me?.career_goals;
      const hasIndustries = Array.isArray(goals?.target_industries);
      const hasFunctions = Array.isArray(goals?.target_functions);
      results[results.length - 1] = {
        name: 'Goals normalization (industries/functions)',
        status: hasIndustries && hasFunctions ? 'pass' : 'fail',
        message: goals
          ? `industries: [${(goals.target_industries || []).join(', ')}] | functions: [${(goals.target_functions || []).join(', ')}]`
          : 'No goals saved yet',
        details: { target_industries: goals?.target_industries, target_functions: goals?.target_functions },
      };
    } catch (e) {
      results[results.length - 1] = { name: 'Goals normalization (industries/functions)', status: 'fail', message: e.message };
    }
    setCareerGoalsTests([...results]);

    // Test: InvokeLLM reachable
    results.push({ name: 'LLM endpoint reachable (quick ping)', status: 'running' });
    setCareerGoalsTests([...results]);
    try {
      const res = await timed(() => base44.integrations.Core.InvokeLLM({
        prompt: 'Reply with exactly: {"ok":true}',
        response_json_schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
      }));
      results[results.length - 1] = {
        name: 'LLM endpoint reachable (quick ping)',
        status: res?.ok === true ? 'pass' : 'fail',
        message: `Response: ${JSON.stringify(res)}`,
        duration: res.duration,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'LLM endpoint reachable (quick ping)', status: 'fail', message: e.message };
    }
    setCareerGoalsTests([...results]);
  };

  // ── Leads Tests ──────────────────────────────────────────────────────────

  const runLeadsTests = async () => {
    const results = [];

    results.push({ name: 'getLeadsForStudent function responds', status: 'running' });
    setLeadsTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('getLeadsForStudent', { student_id: user?.id });
      const data = res?.data || res;
      results[results.length - 1] = {
        name: 'getLeadsForStudent function responds',
        status: data && !data.error ? 'pass' : 'fail',
        message: data?.error || `warmLeads: ${data?.warmLeads?.length ?? '?'}, type: ${data?.warmSearchType}`,
        duration: Date.now() - start,
        details: { warmLeads: data?.warmLeads?.length, searchType: data?.warmSearchType, exploreChips: data?.exploreChips },
      };
    } catch (e) {
      results[results.length - 1] = { name: 'getLeadsForStudent function responds', status: 'fail', message: e.message };
    }
    setLeadsTests([...results]);

    results.push({ name: 'getDirectoryUsers returns members', status: 'running' });
    setLeadsTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('getDirectoryUsers', {});
      const data = res?.data?.data || res?.data || [];
      results[results.length - 1] = {
        name: 'getDirectoryUsers returns members',
        status: Array.isArray(data) && data.length > 0 ? 'pass' : 'fail',
        message: `${data.length} members returned`,
        duration: Date.now() - start,
        details: { count: data.length, sample: data?.[0]?.full_name },
      };
    } catch (e) {
      results[results.length - 1] = { name: 'getDirectoryUsers returns members', status: 'fail', message: e.message };
    }
    setLeadsTests([...results]);

    results.push({ name: 'saved_leads field on user', status: 'running' });
    setLeadsTests([...results]);
    try {
      const me = await base44.auth.me();
      const savedLeads = me?.saved_leads;
      results[results.length - 1] = {
        name: 'saved_leads field on user',
        status: Array.isArray(savedLeads) ? 'pass' : 'fail',
        message: Array.isArray(savedLeads) ? `${savedLeads.length} saved leads` : 'Field missing or not an array',
      };
    } catch (e) {
      results[results.length - 1] = { name: 'saved_leads field on user', status: 'fail', message: e.message };
    }
    setLeadsTests([...results]);
  };

  // ── Alumni Explorer Tests ────────────────────────────────────────────────

  const runAlumniTests = async () => {
    const results = [];

    results.push({ name: 'getAlumniByRole function responds', status: 'running' });
    setAlumniTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('getAlumniByRole', {
        functions: ['Finance & Accounting'],
        roles: ['Financial Analyst'],
        location: '',
      });
      const data = res?.data || res;
      results[results.length - 1] = {
        name: 'getAlumniByRole function responds',
        status: data && !data.error ? 'pass' : 'fail',
        message: data?.error || `${Array.isArray(data) ? data.length : '?'} clusters returned`,
        duration: Date.now() - start,
        details: data,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'getAlumniByRole function responds', status: 'fail', message: e.message };
    }
    setAlumniTests([...results]);

    results.push({ name: 'alumni_explorer_cache persisted on user', status: 'running' });
    setAlumniTests([...results]);
    try {
      const me = await base44.auth.me();
      const cache = me?.alumni_explorer_cache;
      results[results.length - 1] = {
        name: 'alumni_explorer_cache persisted on user',
        status: Array.isArray(cache) ? 'pass' : 'fail',
        message: Array.isArray(cache) ? `${cache.length} cached clusters` : 'No cache — will fetch fresh on load',
      };
    } catch (e) {
      results[results.length - 1] = { name: 'alumni_explorer_cache persisted on user', status: 'fail', message: e.message };
    }
    setAlumniTests([...results]);

    results.push({ name: 'generateOutreachDraft function responds', status: 'running' });
    setAlumniTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('generateOutreachDraft', {
        studentName: user?.full_name || 'Test Student',
        major: 'Finance',
        targetRole: 'Financial Analyst',
        graduationYear: '2026',
        alumniName: 'Jane Smith',
        alumniTitle: 'Senior Analyst',
        alumniCompany: 'Goldman Sachs',
      });
      const data = res?.data || res;
      results[results.length - 1] = {
        name: 'generateOutreachDraft function responds',
        status: data?.message ? 'pass' : 'fail',
        message: data?.message ? `Draft: "${data.message.slice(0, 80)}..."` : (data?.error || 'No message returned'),
        duration: Date.now() - start,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'generateOutreachDraft function responds', status: 'fail', message: e.message };
    }
    setAlumniTests([...results]);
  };

  // ── Company Intel Tests ──────────────────────────────────────────────────

  const runCompanyIntelTests = async () => {
    const results = [];

    results.push({ name: 'getCompanyIntel function responds', status: 'running' });
    setCompanyIntelTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('getCompanyIntel', {
        company_name: 'Google',
        user_id: user?.id,
      });
      const data = res?.data || res;
      results[results.length - 1] = {
        name: 'getCompanyIntel function responds',
        status: data && !data.error ? 'pass' : 'fail',
        message: data?.error || `Intel keys: ${Object.keys(data || {}).join(', ')}`,
        duration: Date.now() - start,
        details: data,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'getCompanyIntel function responds', status: 'fail', message: e.message };
    }
    setCompanyIntelTests([...results]);

    results.push({ name: 'CompanyIntelCache entity readable', status: 'running' });
    setCompanyIntelTests([...results]);
    try {
      const cache = await base44.entities.CompanyIntelCache.list('-created_date', 1);
      results[results.length - 1] = {
        name: 'CompanyIntelCache entity readable',
        status: Array.isArray(cache) ? 'pass' : 'fail',
        message: `${cache?.length ?? 0} cached entries`,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'CompanyIntelCache entity readable', status: 'fail', message: e.message };
    }
    setCompanyIntelTests([...results]);
  };

  // ── Outreach / Messaging Tests ───────────────────────────────────────────

  const runOutreachTests = async () => {
    const results = [];

    results.push({ name: 'Message entity writable', status: 'running' });
    setOutreachTests([...results]);
    try {
      const msg = await base44.entities.Message.create({
        sender_email: user?.email || 'test@cff.dev',
        recipient_email: user?.email || 'test@cff.dev',
        subject: '[TEST] Outreach test message',
        body: 'This is a test message created by the Testing Dashboard.',
        message_type: 'text',
        is_read: false,
      });
      await base44.entities.Message.delete(msg.id);
      results[results.length - 1] = {
        name: 'Message entity writable',
        status: msg?.id ? 'pass' : 'fail',
        message: msg?.id ? `Created and deleted message ${msg.id}` : 'Failed to create message',
      };
    } catch (e) {
      results[results.length - 1] = { name: 'Message entity writable', status: 'fail', message: e.message };
    }
    setOutreachTests([...results]);

    results.push({ name: 'NotebookEntry entity writable', status: 'running' });
    setOutreachTests([...results]);
    try {
      const entry = await base44.entities.NotebookEntry.create({
        user_email: user?.email || 'test@cff.dev',
        content: '[TEST] Notebook entry from Testing Dashboard',
        source_page: 'testing_dashboard',
        source_label: 'Test',
        tags: ['test'],
        saved_at: new Date().toISOString(),
      });
      await base44.entities.NotebookEntry.delete(entry.id);
      results[results.length - 1] = {
        name: 'NotebookEntry entity writable',
        status: entry?.id ? 'pass' : 'fail',
        message: entry?.id ? `Created and deleted entry ${entry.id}` : 'Failed',
      };
    } catch (e) {
      results[results.length - 1] = { name: 'NotebookEntry entity writable', status: 'fail', message: e.message };
    }
    setOutreachTests([...results]);
  };

  // ── Email Tests ──────────────────────────────────────────────────────────

  const runEmailTests = async () => {
    const results = [];

    results.push({ name: 'sendTestEmail function responds', status: 'running' });
    setEmailTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('sendTestEmail', { recipient: user?.email });
      const data = res?.data || res;
      results[results.length - 1] = {
        name: 'sendTestEmail function responds',
        status: data?.success ? 'pass' : 'fail',
        message: data?.success ? `Email sent to ${user?.email}` : (data?.error || 'Failed'),
        duration: Date.now() - start,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'sendTestEmail function responds', status: 'fail', message: e.message };
    }
    setEmailTests([...results]);

    results.push({ name: 'sendMessageNotification function responds', status: 'running' });
    setEmailTests([...results]);
    try {
      const start = Date.now();
      const res = await base44.functions.invoke('sendMessageNotification', {
        recipient_email: user?.email,
        sender_name: 'Testing Dashboard',
        message_preview: 'This is a test notification from the Testing Dashboard.',
      });
      const data = res?.data || res;
      results[results.length - 1] = {
        name: 'sendMessageNotification function responds',
        status: !data?.error ? 'pass' : 'fail',
        message: data?.error || 'Notification dispatched',
        duration: Date.now() - start,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'sendMessageNotification function responds', status: 'fail', message: e.message };
    }
    setEmailTests([...results]);
  };

  // ── Auth / Access Tests ──────────────────────────────────────────────────

  const runAuthTests = async () => {
    const results = [];

    results.push({ name: 'Current user authenticated', status: 'running' });
    setAuthTests([...results]);
    try {
      const me = await base44.auth.me();
      results[results.length - 1] = {
        name: 'Current user authenticated',
        status: me?.email ? 'pass' : 'fail',
        message: me?.email ? `${me.full_name} (${me.email}) — persona: ${me.persona || 'none'}` : 'Not authenticated',
        details: { id: me?.id, persona: me?.persona, roles: me?.roles },
      };
    } catch (e) {
      results[results.length - 1] = { name: 'Current user authenticated', status: 'fail', message: e.message };
    }
    setAuthTests([...results]);

    results.push({ name: 'User entity readable', status: 'running' });
    setAuthTests([...results]);
    try {
      const users = await base44.entities.User.list('-created_date', 1);
      results[results.length - 1] = {
        name: 'User entity readable',
        status: Array.isArray(users) ? 'pass' : 'fail',
        message: `${users?.length ?? 0} users returned`,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'User entity readable', status: 'fail', message: e.message };
    }
    setAuthTests([...results]);

    results.push({ name: 'FastIQ status on user', status: 'running' });
    setAuthTests([...results]);
    try {
      const me = await base44.auth.me();
      const isFastIQ = !!(me?.fastiq_setup_complete || me?.subscription_status === 'active' || me?.membership_tier === 'fastiq' || me?.is_fastiq);
      results[results.length - 1] = {
        name: 'FastIQ status on user',
        status: 'pass',
        message: `FastIQ active: ${isFastIQ} | subscription: ${me?.subscription_status || 'none'} | tier: ${me?.membership_tier || 'none'}`,
      };
    } catch (e) {
      results[results.length - 1] = { name: 'FastIQ status on user', status: 'fail', message: e.message };
    }
    setAuthTests([...results]);
  };

  const allGroups = [
    { key: 'auth', title: '🔐 Auth & User State', color: 'slate', tests: authTests, fn: runAuthTests },
    { key: 'careerGoals', title: '🎯 Career Goals & LLM', color: 'orange', tests: careerGoalsTests, fn: runCareerGoalsTests },
    { key: 'leads', title: '🔴 Leads (Red Hot & Warm)', color: 'red', tests: leadsTests, fn: runLeadsTests },
    { key: 'alumni', title: '🎓 Alumni Explorer & Outreach Drafts', color: 'blue', tests: alumniTests, fn: runAlumniTests },
    { key: 'companyIntel', title: '🏢 Company Intel', color: 'purple', tests: companyIntelTests, fn: runCompanyIntelTests },
    { key: 'outreach', title: '✉️ Messaging & Notebook', color: 'green', tests: outreachTests, fn: runOutreachTests },
    { key: 'email', title: '📧 Email Delivery', color: 'teal', tests: emailTests, fn: runEmailTests },
  ];

  const runAll = async () => {
    for (const g of allGroups) {
      setRunning(r => ({ ...r, [g.key]: true }));
      await g.fn();
      setRunning(r => ({ ...r, [g.key]: false }));
    }
  };

  const totalPass = allGroups.flatMap(g => g.tests).filter(t => t.status === 'pass').length;
  const totalFail = allGroups.flatMap(g => g.tests).filter(t => t.status === 'fail').length;
  const totalRun = allGroups.flatMap(g => g.tests).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">🧪 FastIQ Testing Dashboard</h1>
            <p className="text-slate-500 text-sm">Tests for current live features — career goals, leads, alumni explorer, company intel, messaging.</p>
            {totalRun > 0 && (
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-700 font-medium">{totalPass} passed</span>
                <span className="text-red-600 font-medium">{totalFail} failed</span>
                <span className="text-slate-400">{totalRun} total</span>
              </div>
            )}
          </div>
          <Button onClick={runAll} disabled={Object.values(running).some(Boolean)} className="bg-slate-800 hover:bg-slate-900 text-white">
            <Play className="w-4 h-4 mr-2" /> Run All Tests
          </Button>
        </div>

        <div className="space-y-6">
          {allGroups.map(g => (
            <TestGroup
              key={g.key}
              title={g.title}
              color={g.color}
              tests={g.tests}
              running={!!running[g.key]}
              onRunAll={run(g.key, g.fn)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}