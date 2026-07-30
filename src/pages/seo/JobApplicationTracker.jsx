import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Hero, FeatureGrid, CTASection, CrossLinks } from '@/components/seo-landing/SeoSections';

export default function JobApplicationTracker() {
  return (
    <SeoLandingLayout
      title="Job Application Tracker for Students | Stay Organized | College Fast Forward"
      description="Track every job application, deadline, and follow-up in one place. Better than a Google Sheet. Free for college students."
      slug="job-application-tracker"
    >
      <Hero
        h1="Job Application Tracker for Students"
        sub="Stop losing track of applications in a spreadsheet."
        ctaLabel="Track My Applications Free"
      />
      <FeatureGrid
        title="What it tracks"
        items={[
          { icon: '📋', title: 'Application status', desc: 'Know exactly where each application stands.' },
          { icon: '⏰', title: 'Deadlines and follow-up reminders', desc: 'Never miss a deadline or a follow-up again.' },
          { icon: '📄', title: 'Resume version used per application', desc: 'Remember which resume you sent to each role.' },
          { icon: '🤝', title: 'Networking contacts per company', desc: 'Keep your contacts organized by company.' },
          { icon: '📅', title: 'Interview dates', desc: 'Track every interview and your prep time.' },
        ]}
      />
      <FeatureGrid
        title="Why it beats a spreadsheet"
        items={[
          { icon: '🔔', title: 'Automatic reminders', desc: 'CLIFF nudges you when a follow-up is due.' },
          { icon: '🤖', title: 'AI suggests next action', desc: 'Always know your best next move per application.' },
          { icon: '📈', title: 'See which applications are moving vs stalled', desc: 'Spot progress and stuck applications at a glance.' },
          { icon: '🗂️', title: 'All in one dashboard', desc: 'Your whole search in a single view.' },
        ]}
      />
      <CTASection label="Get Started Free" />
      <CrossLinks links={[
        { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
        { label: 'Interview Prep', to: '#/interview-prep' },
      ]} />
    </SeoLandingLayout>
  );
}