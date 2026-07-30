import React from 'react';
import SeoLandingLayout from '@/components/seo-landing/SeoLandingLayout';
import { Hero, Steps, FeatureGrid, CTASection, CrossLinks } from '@/components/seo-landing/SeoSections';

export default function AtsResumeChecker() {
  return (
    <SeoLandingLayout
      title="Free ATS Resume Checker | Score Your Resume Instantly | College Fast Forward"
      description="Check if your resume passes ATS screening. Get an instant ATS score, keyword match report, and fix recommendations. Free for students."
      slug="ats-resume-checker"
    >
      <Hero
        h1="Free ATS Resume Checker"
        sub="Will your resume make it past the bots? Check in 10 seconds."
        ctaLabel="Check My Resume Free"
      />
      <FeatureGrid
        title="What we check"
        items={[
          { icon: '🤖', title: 'ATS compatibility', desc: 'Make sure parsers can read every section of your resume.' },
          { icon: '🔑', title: 'Keyword density', desc: 'See which keywords are present and which are missing.' },
          { icon: '🧹', title: 'Formatting issues', desc: 'Catch tables, columns, and fonts that break parsing.' },
          { icon: '🧠', title: 'Missing skills from job description', desc: 'Spot skills the job asks for that you left out.' },
        ]}
      />
      <Steps
        title="How scoring works"
        steps={[
          { title: 'Get a 0–100 ATS score', desc: 'A clear, instant score showing how bot-friendly your resume is.' },
          { title: 'See your keyword match %', desc: 'Know exactly how closely your resume matches the job description.' },
          { title: 'Get specific recommendations to improve', desc: 'Actionable fixes to raise your score before you apply.' },
        ]}
      />
      <CTASection label="Run Your ATS Check Now" />
      <CrossLinks links={[
        { label: 'AI Resume Builder', to: '#/ai-resume-builder' },
        { label: 'Interview Prep', to: '#/interview-prep' },
      ]} />
    </SeoLandingLayout>
  );
}