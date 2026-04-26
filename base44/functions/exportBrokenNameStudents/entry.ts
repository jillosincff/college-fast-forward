/**
 * Exports all students with "broken" names (email-prefix fallbacks, digits, underscores, etc.)
 * Returns a CSV-formatted string and a structured JSON list for use in product roadmap.
 *
 * Name is considered "broken" if:
 *   - Name contains digits
 *   - Name contains underscores
 *   - Name contains a period followed by a letter (e.g. desimone.ava)
 *   - Name matches the email prefix exactly (case-insensitive)
 *   - Name is missing entirely
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function emailPrefix(email) {
  return (email || '').split('@')[0].toLowerCase();
}

function nameIsBroken(name, email) {
  if (!name || !name.trim()) return true;
  const nameLower = name.toLowerCase().trim();
  const prefix = emailPrefix(email);
  if (nameLower === prefix) return true;
  if (/\d/.test(name)) return true;
  if (name.includes('_')) return true;
  if (/\.[a-z]/i.test(name)) return true;
  return false;
}

function escapeCsv(val) {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    const students = allUsers.filter(u =>
      ['student', 'gator'].includes(u.persona) ||
      (Array.isArray(u.roles) && (u.roles.includes('student') || u.roles.includes('gator')))
    );

    const broken = students
      .filter(u => nameIsBroken(u.first_name || u.full_name?.split(' ')[0], u.email))
      .map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name || '',
        first_name: u.first_name || '',
        school: u.school_name || u.school || u.school_code || '',
        persona: u.persona || '',
        joined: u.created_date ? u.created_date.slice(0, 10) : '',
        reason: (() => {
          const name = u.first_name || u.full_name?.split(' ')[0] || '';
          if (!name) return 'missing_name';
          if (name.toLowerCase() === emailPrefix(u.email)) return 'email_prefix_match';
          if (/\d/.test(name)) return 'contains_digits';
          if (name.includes('_')) return 'contains_underscore';
          if (/\.[a-z]/i.test(name)) return 'contains_period';
          return 'unknown';
        })(),
      }));

    // Build CSV
    const headers = ['id', 'email', 'full_name', 'first_name', 'school', 'persona', 'joined', 'reason'];
    const csvRows = [
      headers.join(','),
      ...broken.map(row => headers.map(h => escapeCsv(row[h])).join(',')),
    ];
    const csv = csvRows.join('\n');

    // Reason breakdown
    const reasonCounts = {};
    broken.forEach(b => { reasonCounts[b.reason] = (reasonCounts[b.reason] || 0) + 1; });

    return Response.json({
      success: true,
      total_students: students.length,
      broken_count: broken.length,
      broken_pct: Math.round((broken.length / students.length) * 100),
      reason_breakdown: reasonCounts,
      csv,
      records: broken,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});