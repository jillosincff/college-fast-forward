import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const mockIntros = [
    { to: "Alex R.", company: "ESPN", status: "Interview", statusColor: "bg-green-100 text-green-800" },
    { to: "Sarah J.", company: "PwC", status: "Connected", statusColor: "bg-blue-100 text-blue-800" },
];

export default function MyIntroductionsTable() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Introductions & Outcomes</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>To</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockIntros.map((intro, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{intro.to}</TableCell>
              <TableCell>{intro.company}</TableCell>
              <TableCell><Badge className={intro.statusColor}>{intro.status}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Resend</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}