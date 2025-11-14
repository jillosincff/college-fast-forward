// Bundle size optimization utilities
import { lazy } from 'react';

// Code splitting for heavy components
export const LazyComponents = {
  // Split heavy dashboard components
  ParentDashboard: lazy(() => import('@/pages/ParentDashboard')),
  AlumniDashboard: lazy(() => import('@/pages/AlumniDashboard')),
  
  // Split complex modals
  PostRequestModal: lazy(() => import('@/components/jobs/PostRequestModal')),
  RoommateModal: lazy(() => import('@/components/roommates/PostListingModal')),
  
  // Split admin components
  AdminDashboard: lazy(() => import('@/pages/AdminDashboard')),
};

// Remove unused dependencies (add to package.json scripts)
export const bundleAnalysis = {
  // Run: npm install --save-dev webpack-bundle-analyzer
  // Add to package.json: "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  
  // Identify unused dependencies
  checkUnused: () => {
    console.log('Run: npx depcheck to find unused dependencies');
  }
};