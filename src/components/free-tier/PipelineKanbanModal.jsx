import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Clock, Plus, Send, CheckCircle, Target, Trash2, CheckCircle2, AlertCircle, ArrowLeft, ExternalLink, User } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getColumnForStatus, COLUMN_TO_STATUS } from '@/components/pipeline/pipelineStatusMap';

const COLUMNS = [
  { 
    id: 'opportunities', 
    title: 'Opportunities', 
    status: 'identified',
    color: '#6b7280',
    bg: '#f3f4f6',
    border: '#e5e7eb',
    icon: Target,
    description: 'Leads to pursue'
  },
  { 
    id: 'reached_out', 
    title: 'Reached Out', 
    status: 'reached_out',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: Send,
    description: 'Awaiting response'
  },
  { 
    id: 'interviews', 
    title: 'Interviews', 
    status: 'interview',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: CheckCircle,
    description: 'In the conversation'
  },
  { 
    id: 'offers', 
    title: 'Offers', 
    status: 'offer',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: CheckCircle,
    description: 'Offer received'
  },
];

function PipelineCard({ job, index, onOpenDetail, onDelete }) {
  const company = job.company || 'Unknown Company';
  const jobTitle = job.job_title || job.alumni_role || 'Position';
  const statusDate = job.status_date ? new Date(job.status_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  
  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white border rounded-xl p-3 mb-2 shadow-sm hover:shadow-md transition-all ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <div {...provided.dragHandleProps} className="mt-1 text-gray-300 hover:text-gray-500">
              <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0" onClick={() => onOpenDetail(job)}>
              <p className="font-bold text-gray-900 text-sm truncate">{company}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{jobTitle}</p>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto bg-purple-50 text-purple-700 border-purple-200">
                  🎓 Network
                </Badge>
                
                {statusDate && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{statusDate}</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(job);
              }}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
              title="Delete opportunity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function EmptyColumnState({ column }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
      <column.icon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
      <p className="text-xs font-semibold text-gray-500 mb-1">No {column.title.toLowerCase()} yet</p>
      <p className="text-[10px] text-gray-400">Drop a lead here to start tracking!</p>
    </div>
  );
}

export default function PipelineKanbanModal({ isOpen, onClose, user }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [foundAlumni, setFoundAlumni] = useState([]);

  const loadPipeline = () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    
    base44.entities.NetworkingPipeline.list('-created_date', 200)
      .then(records => {
        const mapped = (records || []).map(r => ({
          id: r.id,
          company: r.company || 'Unknown',
          job_title: r.job_title || '',
          job_description: r.job_description || '',
          job_url: r.job_url || '',
          salary_range: r.salary_range || '',
          location: r.location || '',
          posted_date: r.posted_date,
          status: r.status || 'identified',
          status_date: r.status_date,
          alumni_name: r.alumni_name,
          alumni_role: r.alumni_role,
          alumni_email: r.alumni_email || '',
          alumni_linkedin: r.alumni_linkedin || '',
          alumni_source: r.alumni_source,
          notes: r.notes,
          identified_date: r.identified_date || r.created_date,
          reached_out_date: r.reached_out_date,
          replied_date: r.replied_date,
          interview_date: r.interview_date,
          offer_date: r.offer_date,
          follow_up_count: r.follow_up_count || 0,
          follow_up_date: r.follow_up_date,
        }));
        setJobs(mapped);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadPipeline();
    }
  }, [isOpen, user?.email]);

  useEffect(() => {
    const handler = () => loadPipeline();
    window.addEventListener('cliff:pipeline-refresh', handler);
    window.addEventListener('cff:pipeline-changed', handler);
    return () => {
      window.removeEventListener('cliff:pipeline-refresh', handler);
      window.removeEventListener('cff:pipeline-changed', handler);
    };
  }, [user?.email]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    const sourceColumnId = result.source.droppableId;
    const destColumnId = result.destination.droppableId;
    
    if (sourceColumnId === destColumnId) return;
    
    const jobId = result.draggableId;
    const newStatus = COLUMN_TO_STATUS[destColumnId];
    
    if (!newStatus) return;
    
    // Optimistic update
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: newStatus, status_date: new Date().toISOString() } : j
    ));
    
    // Backend update
    try {
      await base44.entities.NetworkingPipeline.update(jobId, {
        status: newStatus,
        status_date: new Date().toISOString(),
      });
      
      window.dispatchEvent(new CustomEvent('cliff:pipeline-refresh'));
    } catch (error) {
      console.error('Failed to update pipeline status:', error);
      loadPipeline(); // Revert on error
    }
  };

  const getColumnJobs = (columnId) => {
    return jobs.filter(job => getColumnForStatus(job.status) === columnId);
  };

  const handleOpenDetail = (job) => {
    setSelectedJob(job);
  };

  const handleCloseDetail = () => {
    setSelectedJob(null);
  };

  const handleDelete = async (job) => {
    if (!confirm(`Are you sure you want to delete "${job.company}" from your pipeline?`)) {
      return;
    }
    
    try {
      await base44.entities.NetworkingPipeline.delete(job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      window.dispatchEvent(new CustomEvent('cliff:pipeline-refresh'));
      window.dispatchEvent(new CustomEvent('cff:pipeline-changed'));
      // Show success toast
      setDeleteStatus('success');
      setTimeout(() => setDeleteStatus(null), 3000);
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
      setDeleteStatus('error');
      setTimeout(() => setDeleteStatus(null), 3000);
    }
  };

  const handleDeployAlumniAgent = async (companyName) => {
    try {
      // Call the backend function directly via base44.functions.invoke
      const result = await base44.functions.invoke('scoutCompanyBackdoor', { 
        jobId: companyName, 
        companyName: companyName 
      });
      
      const data = result?.data?.alumni || result?.alumni || [];
      
      if (data && data.length > 0) {
        // Store all found alumni in state for display
        setFoundAlumni(data);
      } else {
        alert(`🔍 No alumni found at ${companyName}. The agent will continue searching.`);
      }
    } catch (error) {
      console.error('Failed to deploy alumni agent:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
      alert(`⚠️ Failed to search for alumni: ${errorMsg}`);
    }
  };

  const handleSelectAlumni = async (alumni) => {
    try {
      // Update the pipeline record with the selected alumni
      await base44.entities.NetworkingPipeline.update(selectedJob.id, {
        alumni_name: alumni.name || '',
        alumni_role: alumni.role_title || '',
        alumni_linkedin: alumni.linkedin_url || '',
        alumni_source: 'fastiq',
      });
      
      // Refresh the pipeline data
      loadPipeline();
      
      // Close the modal
      onClose();
      
      // Navigate directly to compose phase, skipping intermediate page
      // Add skipForm=1 flag to bypass the intermediate AutomatedAlumniActionPanel
      setTimeout(() => {
        window.location.hash = `#OutreachDrafts?context=alumni_search&company=${encodeURIComponent(selectedJob.company)}&jobTitle=${encodeURIComponent(selectedJob.job_title || '')}&alumniName=${encodeURIComponent(alumni.name || '')}&alumniRole=${encodeURIComponent(alumni.role_title || '')}&alumniLinkedin=${encodeURIComponent(alumni.linkedin_url || '')}&skipForm=1`;
      }, 100);
    } catch (error) {
      console.error('Failed to select alumni:', error);
      alert(`⚠️ Failed to select alumni: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Success/Error Toast */}
      {deleteStatus && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
          deleteStatus === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {deleteStatus === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-semibold text-sm">
            {deleteStatus === 'success' ? 'Opportunity deleted!' : 'Failed to delete'}
          </span>
        </div>
      )}
      
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md" 
        onClick={onClose}
      />
      
      {/* Modal container with slide-up animation */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300" style={{ position: 'relative' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📊 Application Pipeline
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Drag cards between columns to track your progress
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alumni search results banner */}
        {selectedJob && selectedJob.foundAlumniCount > 0 && (
          <div className="bg-green-50 border-b border-green-200 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-green-800 text-sm">
                Found {selectedJob.foundAlumniCount} alumni at {selectedJob.company}
              </p>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b">
          {COLUMNS.map(col => {
            const count = getColumnJobs(col.id).length;
            return (
              <div key={col.id} className="text-center">
                <p className="text-2xl font-bold" style={{ color: col.color }}>{count}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{col.title}</p>
              </div>
            );
          })}
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 p-6 h-full min-w-max">
              {COLUMNS.map((column) => {
                const columnJobs = getColumnJobs(column.id);
                const Icon = column.icon;
                
                return (
                  <div
                    key={column.id}
                    className="w-72 flex-shrink-0 flex flex-col"
                  >
                    {/* Column header */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b" style={{ borderColor: column.border }}>
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: column.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: column.color }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: column.color }}>{column.title}</p>
                        <p className="text-[10px] text-gray-400">{column.description}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-xs" style={{ background: column.bg, color: column.color }}>
                        {columnJobs.length}
                      </Badge>
                    </div>

                    {/* Droppable area */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 overflow-y-auto pr-2 min-h-[200px] rounded-xl transition-colors ${
                            snapshot.isDraggingOver ? 'bg-blue-50/50' : 'bg-transparent'
                          }`}
                        >
                          {columnJobs.length === 0 ? (
                            <EmptyColumnState column={column} />
                          ) : (
                            columnJobs.map((job, index) => (
                              <PipelineCard
                                key={job.id}
                                job={job}
                                index={index}
                                onOpenDetail={handleOpenDetail}
                                onDelete={handleDelete}
                              />
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>

        {/* Footer hint */}
        {!selectedJob && (
          <div className="p-4 border-t bg-gray-50 text-center">
            <p className="text-xs text-gray-500">
              💡 Click any card to see details. Drag cards between columns to track progress.
            </p>
          </div>
        )}

        {/* Detail panel — overlays the modal when a card is clicked */}
         {selectedJob && (
           <div className="absolute inset-0 bg-white rounded-2xl flex flex-col z-10 animate-in slide-in-from-right-4 duration-200">
             {/* Detail header with company name and view posting button */}
             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 border-b flex items-center justify-between">
               <button
                 onClick={handleCloseDetail}
                 className="text-white hover:bg-blue-800 rounded-full p-1.5 transition-colors"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="font-bold text-white text-lg flex-1 text-center">{selectedJob.company}</h3>
               <button onClick={onClose} className="text-white hover:bg-blue-800 rounded-full p-1.5">
                 <X className="w-5 h-5" />
               </button>
             </div>

             {/* Detail body */}
             <div className="flex-1 overflow-y-auto p-6 space-y-5">
               {/* Company & Job Title Section */}
               <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                 <div className="space-y-4">
                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company</p>
                     <p className="font-bold text-gray-900 text-2xl">{selectedJob.company}</p>
                   </div>

                   <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Position</p>
                     <p className="text-lg font-semibold text-gray-800">{selectedJob.job_title || 'Not specified'}</p>
                   </div>

                   {selectedJob.job_url && (
                     <a
                       href={selectedJob.job_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm mt-2"
                     >
                       <ExternalLink className="w-4 h-4" />
                       View Original Posting →
                     </a>
                   )}
                 </div>
               </div>

               {/* Job Description Section */}
               {selectedJob.job_description && (
                 <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Job Details</p>
                   <div className="max-h-48 overflow-y-auto pr-2 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                     {selectedJob.job_description}
                   </div>
                 </div>
               )}

               {/* Verified Alumni Contact Section */}
               {selectedJob.alumni_name && (
                 <div className="bg-orange-50 rounded-xl p-5 border-2 border-orange-200">
                   <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-3">🔥 Primary Contact</p>
                   <div className="space-y-3">
                     <div>
                       <p className="text-xs text-orange-600 font-semibold mb-1">Contact Name</p>
                       <p className="text-sm font-bold text-gray-900">{selectedJob.alumni_name}</p>
                       {selectedJob.alumni_role && (
                         <p className="text-xs text-gray-600 mt-1">{selectedJob.alumni_role}</p>
                       )}
                     </div>

                     {selectedJob.alumni_linkedin && (
                       <a
                         href={selectedJob.alumni_linkedin}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-xs mt-2"
                       >
                         🔗 View LinkedIn Profile
                       </a>
                     )}

                     {selectedJob.alumni_email && (
                       <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-orange-100 mt-2">
                         <input
                           type="text"
                           value={selectedJob.alumni_email}
                           readOnly
                           className="flex-1 text-xs text-gray-600 bg-transparent border-none outline-none"
                         />
                         <button
                           onClick={() => {
                             navigator.clipboard.writeText(selectedJob.alumni_email);
                             alert('Email copied!');
                           }}
                           className="text-orange-600 hover:text-orange-700 font-bold text-xs whitespace-nowrap"
                         >
                           📋 Copy
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
               )}

               {/* All Found Alumni Section */}
               {foundAlumni.length > 0 && (
                 <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                   <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
                     🎓 All {foundAlumni.length} Alumni at {selectedJob.company}
                   </p>
                   <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                     {foundAlumni.map((alumni, idx) => (
                       <div key={idx} className="bg-white rounded-lg p-3 border border-blue-100">
                         <div className="flex items-start justify-between gap-2">
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-gray-900 truncate">{alumni.name || 'Unknown'}</p>
                             {alumni.role_title && (
                               <p className="text-xs text-gray-600 mt-0.5">{alumni.role_title}</p>
                             )}
                             {alumni.description && (
                               <p className="text-xs text-gray-500 mt-1 line-clamp-2">{alumni.description}</p>
                             )}
                           </div>
                           <div className="flex items-center gap-2 flex-shrink-0">
                             {alumni.linkedin_url && (
                               <a
                                 href={alumni.linkedin_url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-700"
                                 title="View LinkedIn"
                               >
                                 🔗
                               </a>
                             )}
                             <button
                               onClick={() => handleSelectAlumni(alumni)}
                               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                             >
                               Select
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* Deploy Agent Button (only if no alumni found yet) */}
               {!selectedJob.alumni_name && foundAlumni.length === 0 && (
                 <button
                   onClick={() => handleDeployAlumniAgent(selectedJob.company)}
                   className="w-full border-2 border-dashed border-gray-300 rounded-xl p-5 hover:border-blue-400 hover:bg-blue-50 transition-colors text-center cursor-pointer"
                 >
                   <p className="text-sm font-semibold text-gray-600">🔍 Deploy Agent to Find {selectedJob.company} Alumni</p>
                   <p className="text-xs text-gray-500 mt-1">No verified insiders yet</p>
                 </button>
               )}

               {/* Additional Metadata */}
               <div className="flex items-center gap-2 flex-wrap pt-2">
                 <Badge variant="secondary" className="text-xs px-2 py-1 h-auto bg-purple-50 text-purple-700 border-purple-200">
                   🎓 Network
                 </Badge>
                 <span className="inline-flex items-center gap-1.5 bg-white text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm">
                   {selectedJob.status?.replace(/_/g, ' ')}
                 </span>
                 {selectedJob.follow_up_count > 0 && (
                   <span className="inline-flex items-center gap-1 bg-white text-orange-600 border border-orange-200 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                     🔁 {selectedJob.follow_up_count} follow-up{selectedJob.follow_up_count > 1 ? 's' : ''}
                   </span>
                 )}
               </div>

               {selectedJob.status_date && (
                 <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
                   <Clock className="w-4 h-4" />
                   <span>Updated {new Date(selectedJob.status_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                 </div>
               )}

               {selectedJob.notes && selectedJob.notes.trim() !== '' && (
                 <div className="pt-4 border-t">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</p>
                   <p className="text-sm text-gray-700 leading-relaxed">{selectedJob.notes}</p>
                 </div>
               )}
             </div>

             {/* Detail actions */}
             <div className="p-5 border-t bg-gray-50 flex gap-3">
               <button
                 onClick={() => {
                   handleCloseDetail();
                   window.location.hash = `#OutreachDrafts?contact=${encodeURIComponent(selectedJob.alumni_name || '')}&company=${encodeURIComponent(selectedJob.company)}&role=${encodeURIComponent(selectedJob.job_title || '')}`;
                 }}
                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl py-2.5 px-4 transition-colors"
               >
                 ✉️ Draft Outreach Message
               </button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}