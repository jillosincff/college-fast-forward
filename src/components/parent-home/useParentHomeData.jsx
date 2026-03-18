import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

function hasFastIQ(student) {
  return student?.fastiq_active === true ||
    student?.subscription_status === 'active' ||
    student?.membership_tier === 'fastiq';
}

function getStudentStatus(student) {
  if (!student) return 'pending';
  if (!hasFastIQ(student) && student.onboarding_completed !== true) return 'no_fastiq';
  if (!hasFastIQ(student)) return 'no_fastiq';
  // Check inactive: 7+ days since last_active_at
  if (student.last_active_at) {
    const daysSince = Math.floor((Date.now() - new Date(student.last_active_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 7) return 'inactive';
  }
  return 'active';
}

export default function useParentHomeData(user) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [pendingMatches, setPendingMatches] = useState([]);

  const load = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    const emails = user.student_emails || [];

    // Load students and matches in parallel
    const [studentResults, matchResults] = await Promise.all([
      Promise.all(emails.map(async (email) => {
        const found = await base44.entities.User.filter({ email }).catch(() => []);
        return { email, student: found?.length ? found[0] : null };
      })),
      base44.entities.Match.filter({ parent_id: user.id, status: 'pending' }, '-created_date', 10).catch(() => []),
    ]);

    setStudents(studentResults);
    setPendingMatches(matchResults || []);
    setLoading(false);
  }, [user?.email, user?.id, (user?.student_emails || []).join(',')]);

  useEffect(() => { load(); }, [load]);

  // Compute derived data
  const studentsWithStatus = students.map(({ email, student }) => ({
    email,
    student,
    status: getStudentStatus(student),
    daysSinceActive: student?.last_active_at
      ? Math.floor((Date.now() - new Date(student.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
      : null,
    hasFastIQ: student ? hasFastIQ(student) : false,
  }));

  const studentsNeedingFastIQ = studentsWithStatus.filter(s => s.status === 'no_fastiq' && s.student);
  const inactiveStudents = studentsWithStatus.filter(s => s.status === 'inactive');

  // Profile completeness
  const profileFields = [user?.full_name, user?.current_company || user?.company, user?.industry || user?.industries?.length, user?.linkedin_url, user?.bio];
  const profileScore = profileFields.filter(Boolean).length;
  const profileTotal = 5;
  const profileComplete = profileScore >= profileTotal;

  // Missing field nudge
  let profileNudge = null;
  if (!user?.linkedin_url) profileNudge = { field: 'linkedin', text: 'Add your LinkedIn URL — parents with LinkedIn get 3x more intro requests' };
  else if (!user?.bio) profileNudge = { field: 'bio', text: 'Add a short bio — students want to know who they\'re reaching out to' };
  else if (!user?.current_company && !user?.company) profileNudge = { field: 'company', text: 'Add your company — this is your core value to the network' };
  else if (!user?.industry && !user?.industries?.length) profileNudge = { field: 'industry', text: 'Set your industry so we know how to match you' };

  const allClear = pendingMatches.length === 0 &&
    studentsNeedingFastIQ.length === 0 &&
    inactiveStudents.length === 0 &&
    profileComplete;

  return {
    loading,
    refresh: load,
    pendingMatches,
    students: studentsWithStatus,
    studentsNeedingFastIQ,
    inactiveStudents,
    profileScore,
    profileTotal,
    profileComplete,
    profileNudge,
    allClear,
  };
}