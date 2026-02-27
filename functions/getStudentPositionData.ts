import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const FAMILY_KARMA_TIERS = [
  { name: 'none', threshold: 0, boost: 0 },
  { name: 'active', threshold: 100, boost: 1 },
  { name: 'engaged', threshold: 300, boost: 2 },
  { name: 'priority', threshold: 500, boost: 3 },
  { name: 'champion', threshold: 1000, boost: 5 },
];

function getTierInfo(totalKarma) {
  let current = FAMILY_KARMA_TIERS[0];
  for (const tier of FAMILY_KARMA_TIERS) {
    if (totalKarma >= tier.threshold) current = tier;
    else break;
  }
  // Next tier
  const idx = FAMILY_KARMA_TIERS.indexOf(current);
  const next = idx < FAMILY_KARMA_TIERS.length - 1 ? FAMILY_KARMA_TIERS[idx + 1] : null;
  return { current, next };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Accept optional parentUserId; default to current user
    const body = await req.json().catch(() => ({}));
    const parentUserId = body.parentUserId || user.id;

    // 1. Find linked students
    let studentEmails = [];
    let parentUser = user;
    if (parentUserId !== user.id) {
      const pu = await base44.asServiceRole.entities.User.filter({ id: parentUserId });
      if (pu.length > 0) parentUser = pu[0];
    }

    const se = parentUser.student_emails || [];
    if (parentUser.student_email && !se.includes(parentUser.student_email)) se.push(parentUser.student_email);

    // Also check family members
    const fgId = parentUser.family_group_id;
    if (fgId) {
      const members = await base44.asServiceRole.entities.User.filter({ family_group_id: fgId });
      for (const m of members) {
        if ((m.persona === 'gator' || m.persona === 'student') && m.email && !se.includes(m.email)) {
          se.push(m.email);
        }
      }
    }
    studentEmails = se;

    if (studentEmails.length === 0) {
      return Response.json({ success: true, no_linked_student: true });
    }

    // 2. Get all active requests sorted by priority_score desc, then created_date desc
    const allRequests = await base44.asServiceRole.entities.JobRequest.filter(
      { status: 'active' },
      '-priority_score',
      200
    );

    // 3. Find the linked student's best-ranked request
    let studentRequest = null;
    let currentPosition = null;
    for (let i = 0; i < allRequests.length; i++) {
      const r = allRequests[i];
      if (studentEmails.includes(r.created_by) || studentEmails.includes(r.poster_email)) {
        studentRequest = r;
        currentPosition = i + 1;
        break;
      }
    }

    if (!studentRequest) {
      return Response.json({ success: true, no_active_request: true, student_emails: studentEmails });
    }

    // 4. Calculate position WITHOUT boost
    const originalBoost = studentRequest.karma_boost || 0;
    const originalPriority = studentRequest.priority_score || 0;
    const unboostedPriority = originalPriority - (originalBoost * 100);

    // Re-sort with the student's unboosted priority
    const tempRequests = allRequests.map(r => {
      if (r.id === studentRequest.id) {
        return { ...r, _sortScore: unboostedPriority };
      }
      return { ...r, _sortScore: r.priority_score || 0 };
    });
    tempRequests.sort((a, b) => (b._sortScore || 0) - (a._sortScore || 0));

    let positionWithoutBoost = null;
    for (let i = 0; i < tempRequests.length; i++) {
      if (tempRequests[i].id === studentRequest.id) {
        positionWithoutBoost = i + 1;
        break;
      }
    }

    const slotsGained = (positionWithoutBoost || currentPosition) - currentPosition;

    // 5. Get family karma info
    let familyKarma = 0;
    let familyLevel = 'none';
    let familyBoost = 0;
    if (fgId) {
      const fkRecords = await base44.asServiceRole.entities.FamilyKarma.filter({ family_group_id: fgId });
      if (fkRecords.length > 0) {
        familyKarma = fkRecords[0].total_karma || 0;
        familyLevel = fkRecords[0].karma_level || 'none';
        familyBoost = fkRecords[0].boost_multiplier || 0;
      }
    }

    const tierInfo = getTierInfo(familyKarma);

    return Response.json({
      success: true,
      current_position: currentPosition,
      total_requests: allRequests.length,
      position_without_boost: positionWithoutBoost,
      slots_gained: slotsGained,
      current_tier: familyLevel,
      boost_multiplier: familyBoost,
      next_tier: tierInfo.next ? tierInfo.next.name : null,
      points_to_next_tier: tierInfo.next ? tierInfo.next.threshold - familyKarma : 0,
      student_request_id: studentRequest.id,
      student_request_title: studentRequest.role || studentRequest.title,
      family_karma: familyKarma,
    });
  } catch (error) {
    console.error('getStudentPositionData error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});