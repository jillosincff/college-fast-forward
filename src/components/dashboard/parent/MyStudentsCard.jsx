import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Zap, GraduationCap, Mail } from 'lucide-react';
import UserAvatar from '@/components/common/UserAvatar';

/**
 * Card showing all linked students for a parent with boost status
 * Supports multiple students with "Link Another Student" action
 */
export default function MyStudentsCard({ 
  user, 
  linkedStudents = [], 
  boostLevel = 0,
  boostExpiresAt = null,
  onLinkStudent,
  onInviteStudent,
  compact = false
}) {
  // Calculate boost status
  const now = new Date();
  const expiresAt = boostExpiresAt ? new Date(boostExpiresAt) : null;
  const isBoostActive = boostLevel > 0 && (!expiresAt || expiresAt > now);
  
  const levelName = boostLevel >= 3 ? 'Platinum' : boostLevel >= 2 ? 'Gold' : boostLevel >= 1 ? 'Silver' : null;
  const levelColors = {
    1: { bg: '#E8E8E8', text: '#4A4A4A', border: '#C0C0C0' },  // Silver
    2: { bg: '#FFF3CD', text: '#6B4D00', border: '#FFD700' },  // Gold
    3: { bg: '#F5F5F5', text: '#4A4A4A', border: '#E5E4E2' }   // Platinum
  };
  
  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            My Students ({linkedStudents.length})
          </h3>
          {isBoostActive && (
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{
                background: levelColors[boostLevel]?.bg || '#E8E8E8',
                color: levelColors[boostLevel]?.text || '#4A4A4A',
                border: `1px solid ${levelColors[boostLevel]?.border || '#C0C0C0'}`
              }}
            >
              <Zap className="w-3 h-3" />
              {levelName} Boost
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {linkedStudents.map((student, idx) => (
            <div key={student.id || idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
              <UserAvatar user={student} className="h-8 w-8" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-800 truncate">{student.name}</p>
                {student.major && (
                  <p className="text-xs text-slate-500 truncate">{student.major}</p>
                )}
              </div>
              {isBoostActive && (
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
          onClick={onLinkStudent}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Link Another Student
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-2 border-slate-200 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-600" />
            My Students
          </CardTitle>
          {isBoostActive && (
            <div 
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold shadow-sm"
              style={{
                background: levelColors[boostLevel]?.bg || '#E8E8E8',
                color: levelColors[boostLevel]?.text || '#4A4A4A',
                border: `2px solid ${levelColors[boostLevel]?.border || '#C0C0C0'}`
              }}
            >
              <Zap className="w-4 h-4" />
              {levelName} Boost Active
            </div>
          )}
        </div>
        
        {isBoostActive && linkedStudents.length > 0 && (
          <p className="text-sm text-blue-700 mt-2 font-medium">
            ⚡ Family Karma Active — boosting {linkedStudents.length === 1 
              ? linkedStudents[0].first_name || linkedStudents[0].name
              : linkedStudents.length === 2 
                ? `${linkedStudents[0].first_name || linkedStudents[0].name} and ${linkedStudents[1].first_name || linkedStudents[1].name}`
                : linkedStudents.length === 3
                  ? `${linkedStudents[0].first_name}, ${linkedStudents[1].first_name}, and ${linkedStudents[2].first_name}`
                  : `your ${linkedStudents.length} students`
            }'s requests!
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        {linkedStudents.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-semibold text-slate-700 mb-2">No Students Linked Yet</h4>
            <p className="text-sm text-slate-500 mb-4">
              Link your student to boost their requests when you earn karma!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={onLinkStudent} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Search & Link Student
              </Button>
              <Button variant="outline" onClick={onInviteStudent}>
                <Mail className="w-4 h-4 mr-2" />
                Invite via Email
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {linkedStudents.map((student, idx) => (
                <div 
                  key={student.id || idx} 
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                    isBoostActive 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <UserAvatar 
                    user={student} 
                    className="h-12 w-12 ring-2 ring-white shadow-md" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{student.name}</p>
                    {student.major && (
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {student.major}
                      </p>
                    )}
                  </div>
                  {isBoostActive && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                      <Zap className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700">Boosted</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
              onClick={onLinkStudent}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Link Another Student
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}