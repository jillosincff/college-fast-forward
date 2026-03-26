import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CriticalPathTester from '@/components/testing/CriticalPathTester';
import FastTrackTestRunner from '@/components/testing/FastTrackTestRunner';
import SecurityTester from '@/components/testing/SecurityTester';
import MobileTestSuite from '@/components/testing/MobileTestSuite';
import PerformanceTestSuite from '@/components/testing/PerformanceTestSuite';

export default function TestingDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🧪 Testing Dashboard</h1>
          <p className="text-slate-600">Automated test suites for College Fast Forward — FastIQ, critical paths, security, and performance.</p>
        </div>

        <Tabs defaultValue="critical">
          <TabsList className="flex w-full gap-2 h-auto p-2 bg-white border border-slate-200 flex-wrap mb-6">
            <TabsTrigger value="critical" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🔴 Critical Paths
            </TabsTrigger>
            <TabsTrigger value="fastiq" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              ⚡ FastIQ / FastTrack
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              🔒 Security
            </TabsTrigger>
            <TabsTrigger value="mobile" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              📱 Mobile
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              🚀 Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="critical">
            <CriticalPathTester />
          </TabsContent>

          <TabsContent value="fastiq">
            <FastTrackTestRunner />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTester />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileTestSuite />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTestSuite />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}