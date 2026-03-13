import React from 'react';
import { useFunnel } from './FunnelContext';
import QuizStep from './QuizStep';
import ChipSelect from './ChipSelect';

const MAJORS = [
  'Business / Finance', 'Computer Science', 'Engineering', 'Marketing / Communications',
  'Biology / Pre-Med', 'Psychology', 'Economics', 'Political Science', 'Journalism / Media',
  'Nursing / Health Sciences', 'Education', 'Accounting', 'Art / Design', 'Other',
];

const GRAD_YEARS = ['2025', '2026', '2027', '2028', '2029'];

const INTERESTS = [
  { value: 'high_pay', label: '💰 High pay' },
  { value: 'creative', label: '🎨 Creative work' },
  { value: 'tech_ai', label: '🤖 Tech / AI' },
  { value: 'helping', label: '❤️ Helping people' },
  { value: 'travel', label: '✈️ Travel / Consulting' },
  { value: 'startups', label: '🚀 Startups' },
  { value: 'not_sure', label: '🤷 Not sure yet' },
];

const INDUSTRIES = [
  { value: 'tech', label: '💻 Tech' },
  { value: 'finance', label: '📊 Finance' },
  { value: 'marketing', label: '📱 Marketing' },
  { value: 'healthcare', label: '🏥 Healthcare' },
  { value: 'media', label: '🎬 Media' },
  { value: 'consulting', label: '📋 Consulting' },
  { value: 'nonprofit', label: '🌍 Non-profit' },
  { value: 'government', label: '🏛️ Government' },
  { value: 'other', label: '✨ Other' },
];

export default function ExplorerQuiz() {
  const { answers, updateAnswer, setPhase, step, nextStep } = useFunnel();

  const steps = [
    // Q1: Major
    <QuizStep key={0} questionNumber={1} totalQuestions={4} title="What's your major or intended major?" canNext={!!answers.major} onNext={nextStep}>
      <ChipSelect options={MAJORS} selected={answers.major} onChange={(v) => updateAnswer('major', v)} />
    </QuizStep>,

    // Q2: Grad year
    <QuizStep key={1} questionNumber={2} totalQuestions={4} title="When do you graduate?" canNext={!!answers.grad_year} onNext={nextStep}>
      <ChipSelect options={GRAD_YEARS} selected={answers.grad_year} onChange={(v) => updateAnswer('grad_year', v)} />
    </QuizStep>,

    // Q3: Interests
    <QuizStep key={2} questionNumber={3} totalQuestions={4} title="What excites you most?" subtitle="Pick all that apply" canNext={(answers.interests || []).length > 0} onNext={() => { nextStep(); setPhase('teaser'); }}>
      <ChipSelect options={INTERESTS} selected={answers.interests} onChange={(v) => updateAnswer('interests', v)} multi />
    </QuizStep>,

    // Q4: Industries
    <QuizStep key={3} questionNumber={4} totalQuestions={4} title="Curious about any of these industries?" subtitle="Pick all that apply" canNext={(answers.industries || []).length > 0} onNext={() => setPhase('score')}>
      <ChipSelect options={INDUSTRIES} selected={answers.industries} onChange={(v) => updateAnswer('industries', v)} multi />
    </QuizStep>,
  ];

  return steps[step] || steps[0];
}