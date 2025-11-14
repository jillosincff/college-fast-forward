import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/common/UserAvatar';
import { MessageSquare, Plus } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

const mockStudents = [
    // { name: "Priya S.", goal: "Equity Research", status: "Awaiting Reply", statusColor: "bg-yellow-100 text-yellow-800" },
    // { name: "Alex R.", goal: "Brand Internships NYC", status: "Scheduled", statusColor: "bg-blue-100 text-blue-800" },
    // { name: "Diego F.", goal: "Software Engineering", status: "Completed", statusColor: "bg-green-100 text-green-800" },
];

function EmptyStudentsHelped({ onBrowseRequests }) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-50 grid place-items-center text-xl">🤝</div>
      <h3 className="text-base font-semibold">No students yet—be the first</h3>
      <p className="mt-1 text-sm text-gray-600">
        Offer a quick intro, share advice, or review a resume to start your impact.
      </p>
      <div className="mt-4">
        <button onClick={onBrowseRequests} className="rounded-xl bg-[#0021A5] px-3 py-2 text-sm text-white hover:opacity-90 transition-opacity">
          Find Someone to Help
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">Tip: Short messages work best—keep it friendly and specific.</p>
    </div>
  );
}

export default function HelpedStudentsList() {
  const students = mockStudents; // Replace with real data

  const handleBrowseRequests = () => {
    navigate('Connections');
  };

  if (students.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Students You've Helped</h3>
        <EmptyStudentsHelped onBrowseRequests={handleBrowseRequests} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Students You've Helped</h3>
      <div className="space-y-3">
        {students.map((student, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <UserAvatar user={{ full_name: student.name }} className="h-10 w-10" />
              <div className="flex-grow">
                <p className="font-semibold text-sm">{student.name}</p>
                <p className="text-xs text-slate-500">{student.goal}</p>
              </div>
              <Badge className={student.statusColor}>{student.status}</Badge>
            </div>
            <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="w-full text-xs"><MessageSquare className="w-3 h-3 mr-1" /> Message</Button>
                <Button size="sm" variant="outline" className="w-full text-xs"><Plus className="w-3 h-3 mr-1" /> Add Note</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}