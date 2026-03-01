import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Map, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import _ from 'lodash';

export default function RoadmapTimelineCard({ data, profileId }) {
  const steps = data?.steps || data?.weeks || [];
  const [completedItems, setCompletedItems] = useState({});
  const [expandedWeek, setExpandedWeek] = useState(steps[0]?.week_number || 1);

  // Load saved completion state on mount
  useEffect(() => {
    if (!profileId) return;
    (async () => {
      try {
        const profiles = await base44.entities.FastTrackProProfile.filter({ id: profileId });
        const p = profiles?.[0];
        if (p?.roadmap_completed_items) {
          const parsed = JSON.parse(p.roadmap_completed_items);
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            setCompletedItems(parsed);
          } else if (Array.isArray(parsed)) {
            // Convert legacy array format to object
            const obj = {};
            parsed.forEach(k => { obj[k] = true; });
            setCompletedItems(obj);
          }
        }
      } catch (e) {
        console.log('Failed to load roadmap state:', e.message);
      }
    })();
  }, [profileId]);

  // Debounced save to profile
  const debouncedSave = useCallback(
    _.debounce(async (items) => {
      if (!profileId) return;
      try {
        await base44.entities.FastTrackProProfile.update(profileId, {
          roadmap_completed_items: JSON.stringify(items),
        });
      } catch (e) {
        console.log('Failed to save roadmap progress:', e.message);
      }
    }, 1000),
    [profileId]
  );

  const toggleItem = (key) => {
    setCompletedItems(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
        toast.success('Nice! Task completed 🎉', { duration: 1500 });
      }
      debouncedSave(next);
      return next;
    });
  };

  if (!steps.length) return null;

  // Calculate progress
  const totalItems = steps.reduce((sum, s) => sum + (s.action_items?.length || 0), 0);
  const completedCount = Object.keys(completedItems).length;
  const progressPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mt-2 mb-1 overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Map className="w-4 h-4 text-green-600" />
          <p className="font-semibold text-slate-900 text-sm">{data?.title || 'Career Roadmap'}</p>
          <Badge className="ml-auto bg-green-100 text-green-700 text-[10px] border-0">
            {steps.length} weeks
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-semibold text-green-700 flex-shrink-0">
            {completedCount}/{totalItems}
          </span>
        </div>
        {progressPct === 100 && (
          <div className="flex items-center gap-2 mt-2 bg-green-100 rounded-lg px-3 py-1.5">
            <Trophy className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-green-700">All tasks complete! You're on track 🚀</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="px-4 pb-4">
        {steps.map((step, i) => {
          const weekNum = step.week_number || i + 1;
          const isExpanded = expandedWeek === weekNum;
          const weekItems = step.action_items || [];
          const weekCompleted = weekItems.filter((_, j) => completedItems[`${weekNum}-${j}`]).length;
          const isWeekDone = weekItems.length > 0 && weekCompleted === weekItems.length;

          return (
            <div key={weekNum} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={`absolute left-[15px] top-9 w-0.5 ${isExpanded ? 'bottom-1' : 'bottom-1'} ${isWeekDone ? 'bg-green-400' : 'bg-green-200'}`} />
              )}

              {/* Week header */}
              <button
                onClick={() => setExpandedWeek(isExpanded ? null : weekNum)}
                className="flex items-center gap-3 w-full text-left py-2 hover:bg-green-100/50 rounded-lg px-1 transition-colors"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors ${
                  isWeekDone
                    ? 'bg-green-500 text-white'
                    : weekCompleted > 0
                    ? 'bg-green-300 text-white'
                    : 'bg-green-200 text-green-700'
                }`}>
                  {isWeekDone ? '✓' : weekNum}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isWeekDone ? 'text-green-700 line-through' : 'text-slate-900'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{weekCompleted}/{weekItems.length} tasks</p>
                </div>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-11 pb-3">
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed">{step.description}</p>
                      <div className="space-y-2">
                        {weekItems.map((item, j) => {
                          const key = `${weekNum}-${j}`;
                          const isDone = !!completedItems[key];
                          return (
                            <label
                              key={key}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                isDone ? 'bg-green-100/80' : 'bg-white hover:bg-green-50'
                              } border ${isDone ? 'border-green-300' : 'border-slate-200'}`}
                            >
                              <Checkbox
                                checked={isDone}
                                onCheckedChange={() => toggleItem(key)}
                                className="mt-0.5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              />
                              <span className={`text-xs leading-relaxed ${isDone ? 'text-green-700 line-through' : 'text-slate-700'}`}>
                                {item}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Card>
  );
}