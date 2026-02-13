import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, ArrowRight, Eye, MessageSquare } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function StudentHelpRequestPreview({ helpRequest }) {
  if (!helpRequest) return null;

  const title = helpRequest.role || helpRequest.title || helpRequest.description?.substring(0, 60);
  const answerCount = helpRequest.answer_count || 0;
  const viewCount = helpRequest.view_count || helpRequest.views_count || 0;

  return (
    <Card className="bg-white border-2 border-slate-200 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Your Help Request</h3>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Active
          </span>
        </div>

        <p className="text-slate-800 font-medium mb-2 line-clamp-2">{title}</p>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {viewCount} views
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => {
            const type = helpRequest.role ? 'job' : 'help';
            navigate(`QuestionDetail?id=${helpRequest.id}&type=${type}`);
          }}
        >
          View Question <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}