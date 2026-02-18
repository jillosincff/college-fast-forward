import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns";
import { MoreVertical, Edit, Trash2, Plus, Eye, Briefcase, ClipboardList, AlertCircle } from "lucide-react";
import { navigate } from "@/components/utils/navigation";
import { JobRequest } from "@/entities/JobRequest";
import { useToast } from "@/components/ui/use-toast";

// A dedicated component for each row type for clarity
const RequestRow = ({ request, onDelete }) => {
  const { toast } = useToast();

  const statusConfig = {
    active: { text: 'Active', className: 'bg-green-100 text-green-800' },
    closed: { text: 'Closed', className: 'bg-gray-100 text-gray-800' },
    fulfilled: { text: 'Fulfilled', className: 'bg-blue-100 text-blue-800' },
  };
  const config = statusConfig[request.status] || statusConfig.active;

  // Calculate expiration
  const getDaysUntilExpiration = (createdDate) => {
    const expirationDate = addDays(new Date(createdDate), 30);
    const daysLeft = differenceInDays(expirationDate, new Date());
    return daysLeft;
  };

  const getExpirationBadge = (daysLeft) => {
    if (daysLeft < 0) return { text: 'Expired', className: 'bg-red-100 text-red-800' };
    if (daysLeft === 0) return { text: 'Expires today', className: 'bg-red-100 text-red-800' };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, className: 'bg-orange-100 text-orange-800' };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, className: 'bg-yellow-100 text-yellow-800' };
    return { text: `${daysLeft}d left`, className: 'bg-slate-100 text-slate-600' };
  };

  const daysLeft = getDaysUntilExpiration(request.created_date);
  const expirationBadge = getExpirationBadge(daysLeft);
  const isExpiringSoon = daysLeft <= 7;

  return (
    <TableRow className={isExpiringSoon ? 'bg-orange-50/30' : ''}>
      <TableCell>
        <div className="font-medium">{request.role}</div>
        {isExpiringSoon && (
          <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft} days`}
          </div>
        )}
      </TableCell>
      <TableCell>{request.target_industry}</TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          <Badge className={`${config.className} text-xs`}>{config.text}</Badge>
          <Badge className={`${expirationBadge.className} text-xs`}>{expirationBadge.text}</Badge>
        </div>
      </TableCell>
      <TableCell>{formatDistanceToNow(new Date(request.created_date))} ago</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('Connections', { requestId: request.id })}>
              <Eye className="w-4 h-4 mr-2" /> View Request
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('PostRequest', { edit: request.id })}>
              <Edit className="w-4 h-4 mr-2" /> {isExpiringSoon ? 'Renew' : 'Edit'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(request.id)} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const ApplicationRow = ({ application }) => {
  const statusConfig = {
    applied: { text: 'Applied', className: 'bg-blue-100 text-blue-800' },
    in_review: { text: 'In Review', className: 'bg-yellow-100 text-yellow-800' },
    replied: { text: 'Replied', className: 'bg-green-100 text-green-800' },
    interview: { text: 'Interviewing', className: 'bg-purple-100 text-purple-800' },
    closed: { text: 'Closed', className: 'bg-gray-100 text-gray-800' }
  };
  const config = statusConfig[application.status] || statusConfig.applied;

  return (
    <TableRow>
      <TableCell className="font-medium">{application.opportunity?.title || 'Opportunity'}</TableCell>
      <TableCell>{application.opportunity?.company_name || 'N/A'}</TableCell>
      <TableCell>
        <Badge className={`${config.className} text-xs`}>{config.text}</Badge>
      </TableCell>
      <TableCell>{formatDistanceToNow(new Date(application.created_date))} ago</TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={() => navigate('Opportunities', { viewId: application.opportunity_id })}>
          View Opportunity
        </Button>
      </TableCell>
    </TableRow>
  );
};


export default function MyListings({ type, requests, applications, loading, onUpdate }) {
  const { toast } = useToast();

  const isRequests = type === 'requests';
  const data = isRequests ? requests : applications;

  const handleDelete = async (requestId) => {
    try {
      await JobRequest.delete(requestId);
      toast({
        title: "🗑️ Request Deleted",
        description: "Your job request has been successfully removed.",
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Failed to delete request",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const config = {
    requests: {
      title: "My Requests",
      description: "Manage all the job, internship, and advice requests you've posted.",
      icon: Briefcase,
      emptyText: "You haven't posted any help requests yet.",
      emptyButtonText: "Post Your First Request",
      emptyAction: () => navigate('PostRequest'),
      head: ["Role", "Industry", "Status", "Posted", ""],
      RowComponent: (props) => <RequestRow {...props} onDelete={handleDelete} />,
    },
    applications: {
      title: "My Applications",
      description: "Track the status of all the opportunities you've applied for.",
      icon: ClipboardList,
      emptyText: "You haven't applied to any opportunities yet.",
      emptyButtonText: "Browse Opportunities",
      emptyAction: () => navigate('Opportunities'),
      head: ["Opportunity", "Company", "Status", "Applied", ""],
      RowComponent: ApplicationRow,
    }
  };

  const currentConfig = config[type];

  // Calculate if there are any expiring items
  const expiringItemsCount = isRequests ? requests.filter(req => {
    const daysLeft = differenceInDays(addDays(new Date(req.created_date), 30), new Date());
    return daysLeft <= 7 && daysLeft >= 0;
  }).length : 0;

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <currentConfig.icon className="w-6 h-6 text-gator-blue" />
            <div>
              <CardTitle>{currentConfig.title}</CardTitle>
              <CardDescription>{currentConfig.description}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={currentConfig.emptyAction}>
            <Plus className="w-4 h-4 mr-2" />
            {currentConfig.emptyButtonText}
          </Button>
        </div>
        {expiringItemsCount > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              <strong>{expiringItemsCount} {expiringItemsCount === 1 ? 'request' : 'requests'}</strong> expiring soon. Edit to renew for another 30 days.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {currentConfig.head.map(h => <TableHead key={h}>{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <currentConfig.RowComponent
                  key={item.id}
                  {...{[type.slice(0, -1)]: item}}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <currentConfig.icon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">{currentConfig.emptyText}</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Let's get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}