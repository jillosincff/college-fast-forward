import React from 'react';

/**
 * Generate dynamic message templates based on student and recipient data
 */
export function generateMessageTemplates(student, recipient) {
  const studentFirstName = parseFirstName(student?.full_name);
  const recipientFirstName = parseFirstName(recipient?.full_name);
  const studentYear = formatStudentYear(student?.graduation_year || student?.year);
  const studentMajor = student?.major || '';
  const recipientTitle = recipient?.job_title || '';
  const recipientCompany = recipient?.current_company || '';
  const recipientHelpTypes = recipient?.help_types || [];
  
  const templates = [];
  
  // Template 1: Introduction
  templates.push({
    id: 'introduction',
    icon: '👋',
    title: 'Introduction',
    message: generateIntroMessage(recipientFirstName, studentYear, studentMajor, recipientTitle, recipientCompany)
  });
  
  // Template 2: Ask for Advice
  templates.push({
    id: 'advice',
    icon: '❓',
    title: 'Ask for Advice',
    message: generateAdviceMessage(recipientFirstName, studentYear, studentMajor, recipientTitle, recipientCompany, recipientHelpTypes)
  });
  
  // Template 3: Context-specific (resume, interview, etc.)
  const specificTemplate = generateSpecificTemplate(recipientFirstName, studentYear, studentMajor, recipientHelpTypes);
  templates.push(specificTemplate);
  
  return templates;
}

function generateIntroMessage(recipientName, studentYear, studentMajor, title, company) {
  let message = `Hi ${recipientName}!`;
  
  if (studentYear && studentMajor) {
    message += ` I'm a ${studentYear} ${studentMajor} major at UF.`;
  } else if (studentYear) {
    message += ` I'm a ${studentYear} at UF.`;
  } else {
    message += ` I'm a UF student.`;
  }
  
  if (title && company) {
    message += ` I saw you're a ${title} at ${company} and would love to connect.`;
  } else if (company) {
    message += ` I saw you work at ${company} and would love to connect.`;
  } else if (title) {
    message += ` I saw your background as a ${title} and would love to connect.`;
  } else {
    message += ` I'd love to connect and learn from your experience.`;
  }
  
  message += ` Would you be open to sharing some advice about your career journey?`;
  
  return message;
}

function generateAdviceMessage(recipientName, studentYear, studentMajor, title, company, helpTypes) {
  let message = `Hi ${recipientName}!`;
  
  if (company) {
    const industry = getIndustryFromTitle(title) || 'your field';
    message += ` I'm exploring careers in ${industry} and saw your background at ${company}.`;
  } else if (title) {
    if (studentYear && studentMajor) {
      message += ` I'm a ${studentYear} ${studentMajor} major interested in becoming a ${title}.`;
    } else {
      message += ` I'm a UF student interested in becoming a ${title}.`;
    }
  } else {
    if (studentYear && studentMajor) {
      message += ` I'm a ${studentYear} ${studentMajor} major exploring my career options.`;
    } else {
      message += ` I'm a UF student exploring my career options.`;
    }
  }
  
  // Ask based on help types
  if (helpTypes.includes('internship_leads') || helpTypes.includes('finding_jobs')) {
    message += ` What advice would you give someone trying to land their first role in the industry?`;
  } else if (helpTypes.includes('career_advice')) {
    message += ` What advice would you give someone just starting out?`;
  } else {
    message += ` I'd really appreciate any advice you have for someone early in their career.`;
  }
  
  return message;
}

function generateSpecificTemplate(recipientName, studentYear, studentMajor, helpTypes) {
  const yearMajorIntro = studentYear && studentMajor 
    ? `${studentYear} ${studentMajor} major`
    : studentYear || 'UF student';
  
  // Resume Review
  if (helpTypes.includes('resume_review') || helpTypes.includes('resume_help')) {
    return {
      id: 'resume',
      icon: '📄',
      title: 'Resume Review Request',
      message: `Hi ${recipientName}! I'm a ${yearMajorIntro} looking for internships. I saw you're open to helping with resume reviews — would you be willing to take a look at mine? I'd really appreciate any feedback!`
    };
  }
  
  // Interview Prep
  if (helpTypes.includes('interview_prep')) {
    return {
      id: 'interview',
      icon: '🎤',
      title: 'Interview Prep Help',
      message: `Hi ${recipientName}! I have some interviews coming up and saw you're open to helping with interview prep. Would you be willing to share any tips or do a practice session? I'd be so grateful!`
    };
  }
  
  // Networking
  if (helpTypes.includes('networking_intros') || helpTypes.includes('networking')) {
    return {
      id: 'networking',
      icon: '🤝',
      title: 'Networking Request',
      message: `Hi ${recipientName}! I'm a ${yearMajorIntro} trying to build my network in the industry. I'd love to hear about your career path and any connections you might suggest I reach out to.`
    };
  }
  
  // Industry Insights
  if (helpTypes.includes('industry_insights')) {
    return {
      id: 'insights',
      icon: '💡',
      title: 'Industry Questions',
      message: `Hi ${recipientName}! I'm researching careers in your industry and would love to hear your perspective. What do you wish you'd known when you were starting out?`
    };
  }
  
  // Internship leads
  if (helpTypes.includes('internship_leads')) {
    return {
      id: 'internship',
      icon: '🎯',
      title: 'Internship Search Help',
      message: `Hi ${recipientName}! I'm a ${yearMajorIntro} actively searching for internships. I saw you're open to helping with internship leads — I'd love to hear about any opportunities in your network!`
    };
  }
  
  // Default: Coffee chat
  return {
    id: 'coffee',
    icon: '☕',
    title: 'Quick Chat Request',
    message: `Hi ${recipientName}! I'm a ${yearMajorIntro} and would love to learn more about your career journey. Would you have 15 minutes for a quick call sometime?`
  };
}

function formatStudentYear(year) {
  if (!year) return '';
  
  // If it's a string like "Junior", "Senior", return as-is
  if (typeof year === 'string' && isNaN(parseInt(year))) {
    return year.toLowerCase();
  }
  
  // If it's a graduation year
  const gradYear = parseInt(year);
  if (isNaN(gradYear)) return '';
  
  const currentYear = new Date().getFullYear();
  const yearsUntilGrad = gradYear - currentYear;
  
  if (yearsUntilGrad <= 0) return 'recent grad';
  if (yearsUntilGrad === 1) return 'senior';
  if (yearsUntilGrad === 2) return 'junior';
  if (yearsUntilGrad === 3) return 'sophomore';
  if (yearsUntilGrad >= 4) return 'freshman';
  return 'student';
}

function parseFirstName(fullName) {
  if (!fullName) return 'there';
  // Handle "Last, First" format
  if (fullName.includes(',')) {
    return fullName.split(',')[1]?.trim().split(' ')[0] || 'there';
  }
  return fullName.split(' ')[0] || 'there';
}

function getIndustryFromTitle(title) {
  if (!title) return null;
  const lower = title.toLowerCase();
  if (lower.includes('sales') || lower.includes('account')) return 'sales';
  if (lower.includes('marketing')) return 'marketing';
  if (lower.includes('engineer')) return 'engineering';
  if (lower.includes('finance') || lower.includes('analyst')) return 'finance';
  if (lower.includes('product')) return 'product management';
  if (lower.includes('design')) return 'design';
  if (lower.includes('consult')) return 'consulting';
  return null;
}

/**
 * Message Templates Selection Component
 */
export default function MessageTemplatesSelector({ templates, onSelect, selectedId }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 flex items-center gap-2">
        <span>💡</span>
        Not sure what to say? Try one of these:
      </p>
      
      {templates.map(template => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
            selectedId === template.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{template.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{template.title}</p>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                "{template.message}"
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}