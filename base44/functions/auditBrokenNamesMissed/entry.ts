import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Old logic: only catch pure digit names at first name position
    function isOldBrokenName(fullName) {
      if (!fullName) return true; // empty is broken
      const first = fullName.split(' ')[0];
      return /^\d+$/.test(first); // only pure digits
    }

    // New logic: catch pure digits OR username-like (alphanumeric mix) OR empty
    function isNewBrokenName(fullName) {
      if (!fullName || fullName.trim() === '') return true; // empty is broken
      const first = fullName.split(' ')[0];
      // Broken if: pure digits OR looks like username (alphanumeric mix like samigreen219)
      return /^\d+$/.test(first) || /^\w+\d+\w*$/.test(first);
    }

    // Find all students
    const allStudents = allUsers.filter(u => u.persona === 'student');

    // Audit
    const nowCaught = [];
    const stillMissed = [];
    const wasAlreadyCaught = [];

    allStudents.forEach(s => {
      const oldBroken = isOldBrokenName(s.full_name);
      const newBroken = isNewBrokenName(s.full_name);

      if (oldBroken && newBroken) {
        wasAlreadyCaught.push({ email: s.email, name: s.full_name });
      } else if (!oldBroken && newBroken) {
        nowCaught.push({ email: s.email, name: s.full_name });
      } else if (oldBroken && !newBroken) {
        stillMissed.push({ email: s.email, name: s.full_name });
      }
    });

    return Response.json({
      total_students: allStudents.length,
      audit_results: {
        already_caught_by_old_logic: wasAlreadyCaught.length,
        now_caught_by_new_logic: nowCaught.length,
        still_missed: stillMissed.length,
      },
      newly_caught_examples: nowCaught.slice(0, 10),
      still_missed_examples: stillMissed.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});