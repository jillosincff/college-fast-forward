// Shared UF email branding utilities
// This function serves as a utility endpoint AND is imported pattern reference for other email functions

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const FROM_NAME = "College Fast Forward";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

function wrapEmailHtml({ title, preheader, bodyContent, footerExtra, unsubscribeUrl }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header with UF gradient -->
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
      ${title ? `<h1 style="color: white; margin: 8px 0 0 0; font-size: 22px; font-weight: 700;">${title}</h1>` : ''}
    </div>
    
    <!-- Body -->
    <div style="background: #ffffff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      ${bodyContent}
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Go Gators! 🐊🧡💙</p>
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward — Where Gators Help Gators</p>
      ${footerExtra || ''}
      ${unsubscribeUrl ? `<p style="font-size: 11px; color: #9ca3af; margin: 12px 0 0 0;"><a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Manage email preferences</a></p>` : `<p style="font-size: 11px; color: #9ca3af; margin: 12px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af; text-decoration: underline;">Manage email preferences</a></p>`}
    </div>
  </div>
</body>
</html>`;
}

function ctaButton(text, url, color = '#0021A5') {
  return `<div style="text-align: center; margin: 24px 0;">
    <a href="${url}" style="display: inline-block; background: ${color}; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${text}</a>
  </div>`;
}

function questionCard(q) {
  const name = q.posterName || q.poster_name || 'A Gator';
  const firstName = name.split(' ')[0];
  const preview = (q.description || q.preview || '').substring(0, 150);
  const industry = q.industry || q.target_industry || '';
  const url = q.url || `${APP_BASE_URL}/#QuestionDetail?id=${q.id}&type=${q.type || 'help'}`;
  
  return `<div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; background: #fafafa;">
    <div style="margin-bottom: 8px;">
      <strong style="color: #111827;">${firstName}</strong>
      ${industry ? `<span style="color: #6b7280; font-size: 13px;"> · ${industry}</span>` : ''}
    </div>
    <p style="color: #374151; font-style: italic; margin: 0 0 12px 0; font-size: 15px;">"${preview}${preview.length >= 150 ? '...' : ''}"</p>
    <a href="${url}" style="display: inline-block; background: #0021A5; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Help ${firstName} →</a>
  </div>`;
}

// Utility endpoint — returns branding config for admin inspection
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    
    return Response.json({
      APP_BASE_URL,
      FROM_NAME,
      LOGO_URL,
      brandColors: { primary: '#0021A5', accent: '#FA4616' },
      schoolName: 'University of Florida',
      schoolShort: 'UF',
      language: { family: 'Gator family', network: 'Gator Network', fellow: 'fellow Gator' }
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});