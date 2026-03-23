// CFF Email Design System — Master Template Builder
// All email functions call this via base44.functions.invoke('emailBranding', { action, ... })
// Returns fully branded HTML emails matching the platform's dark nav + orange accent design.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const YEAR = new Date().getFullYear();
const DM = "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const PF = "'Playfair Display',Georgia,'Times New Roman',serif";

/* ── Wrap full email ─────────────────────────────────────────── */
function wrap({ preheader, content, showFastiqBadge, unsubscribeUrl, prefsUrl }) {
  const unsub = unsubscribeUrl || `${APP}/#ProfileEdit`;
  const prefs = prefsUrl || `${APP}/#ProfileEdit`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
${preheader ? `<span style="display:none;font-size:1px;color:#f4f2ee;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f4f2ee;font-family:${DM};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f2ee;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

<!-- HEADER -->
<tr><td style="background-color:#0d1117;border-radius:16px 16px 0 0;padding:24px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td>
  <span style="font-family:${DM};font-size:18px;font-weight:600;color:#f4f0e8;letter-spacing:-0.01em;">C<span style="color:#E85D20;">FF</span></span>
  <span style="font-family:${DM};font-size:11px;font-weight:400;color:rgba(244,240,232,0.4);letter-spacing:0.08em;text-transform:uppercase;margin-left:12px;">College Fast Forward</span>
</td>
<td align="right">
  ${showFastiqBadge ? `<span style="background:rgba(232,93,32,0.15);border:1px solid rgba(232,93,32,0.3);border-radius:100px;padding:4px 12px;font-size:11px;font-weight:500;color:#E85D20;font-family:${DM};">FASTIQ&#8482; Active</span>` : ''}
</td>
</tr></table>
</td></tr>

<!-- CONTENT -->
<tr><td style="background-color:#ffffff;padding:36px 32px;">
${content}
</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#0d1117;border-radius:0 0 16px 16px;padding:20px 32px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.3);line-height:1.6;">
  &copy; ${YEAR} College Fast Forward. All rights reserved.<br>
  <a href="${unsub}" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Unsubscribe</a>
  &nbsp;&middot;&nbsp;
  <a href="${prefs}" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Email preferences</a>
  &nbsp;&middot;&nbsp;
  <a href="${APP}" style="color:rgba(244,240,232,0.4);text-decoration:underline;">Visit CFF</a>
</td>
<td align="right" style="font-family:${DM};font-size:11px;font-weight:300;color:rgba(244,240,232,0.2);">
  University of Florida &middot; ${YEAR}
</td>
</tr></table>
</td></tr>

</table></td></tr></table>
</body></html>`;
}

/* ── Typography helpers ─────────────────────────────────────── */
function h1(text) {
  return `<h1 style="font-family:${PF};font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;">${text}</h1>`;
}
function h1Accent(white, orange) {
  return `<h1 style="font-family:${PF};font-size:28px;font-weight:700;letter-spacing:-0.02em;line-height:1.2;margin:0 0 8px;"><span style="color:#1a1a1a;">${white}</span> <span style="font-style:italic;font-weight:400;color:#E85D20;">${orange}</span></h1>`;
}
function h2(text) {
  return `<h2 style="font-family:${PF};font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:-0.01em;line-height:1.3;margin:0 0 6px;">${text}</h2>`;
}
function p(text) {
  return `<p style="font-family:${DM};font-size:15px;font-weight:300;color:#555555;line-height:1.75;margin:0 0 16px;">${text}</p>`;
}
function small(text) {
  return `<p style="font-family:${DM};font-size:12px;font-weight:300;color:#aaaaaa;line-height:1.6;margin:0;">${text}</p>`;
}

/* ── Buttons ────────────────────────────────────────────────── */
function btnPrimary(text, url) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr>
<td style="background-color:#E85D20;border-radius:100px;padding:14px 32px;">
<a href="${url}" style="font-family:${DM};font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;white-space:nowrap;">${text} &rarr;</a>
</td></tr></table>`;
}
function btnSecondary(text, url) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr>
<td style="background-color:#0d1117;border-radius:100px;padding:14px 32px;">
<a href="${url}" style="font-family:${DM};font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;white-space:nowrap;">${text} &rarr;</a>
</td></tr></table>`;
}
function btnGhost(text, url) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr>
<td style="border:1px solid rgba(232,93,32,0.4);border-radius:100px;padding:13px 32px;">
<a href="${url}" style="font-family:${DM};font-size:15px;font-weight:400;color:#E85D20;text-decoration:none;white-space:nowrap;">${text} &rarr;</a>
</td></tr></table>`;
}

/* ── Components ─────────────────────────────────────────────── */
function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0;"><tr><td style="border-top:1px solid rgba(0,0,0,0.06);font-size:0;">&nbsp;</td></tr></table>`;
}

function accentBar(content) {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr>
<td style="border-left:3px solid #E85D20;padding:12px 16px;background-color:#fff9f7;">
<p style="font-family:${DM};font-size:14px;font-weight:400;color:#555;line-height:1.65;margin:0;">${content}</p>
</td></tr></table>`;
}

function personCard({ initials, name, role, company, detail, messageUrl, firstName }) {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f2ee;border-radius:12px;margin:8px 0;"><tr><td style="padding:14px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
<td style="vertical-align:top;width:40px;">
  <div style="width:40px;height:40px;border-radius:50%;background-color:#0d1117;color:#fff;font-family:${DM};font-size:13px;font-weight:500;text-align:center;line-height:40px;display:inline-block;">${initials || 'U'}</div>
</td>
<td style="padding-left:12px;vertical-align:top;">
  <p style="font-family:${DM};font-size:14px;font-weight:500;color:#1a1a1a;margin:0 0 2px;">${name}</p>
  <p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0 0 6px;">${[role, company].filter(Boolean).join(' &middot; ')}</p>
  ${detail ? `<p style="font-family:${DM};font-size:12px;font-weight:300;color:#aaa;margin:0;">${detail}</p>` : ''}
</td>
${messageUrl ? `<td align="right" style="vertical-align:middle;padding-left:16px;">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:#0d1117;border-radius:100px;padding:7px 16px;">
<a href="${messageUrl}" style="font-family:${DM};font-size:12px;font-weight:500;color:#fff;text-decoration:none;white-space:nowrap;">Message ${firstName || 'them'}</a>
</td></tr></table></td>` : ''}
</tr></table></td></tr></table>`;
}

function statRow(stats) {
  // stats = [{value, label}, {value, label}, {value, label}]
  const cells = stats.map(s =>
    `<td width="30%" align="center" style="padding:16px;background:#f4f2ee;border-radius:12px;">
      <p style="font-family:${PF};font-size:24px;font-weight:700;color:#E85D20;margin:0 0 4px;">${s.value}</p>
      <p style="font-family:${DM};font-size:11px;font-weight:300;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0;">${s.label}</p>
    </td>`
  ).join(`<td width="5%"></td>`);
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;"><tr>${cells}</tr></table>`;
}

function questionCard({ category, questionText, studentName, year, major, questionUrl, karma }) {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left:3px solid #E85D20;background:#ffffff;border-radius:0 12px 12px 0;margin:8px 0;"><tr><td style="padding:14px 16px;">
${category ? `<p style="font-family:${DM};font-size:10px;font-weight:500;color:#E85D20;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 6px;">${category}</p>` : ''}
<p style="font-family:${PF};font-size:16px;font-weight:700;color:#1a1a1a;line-height:1.4;margin:0 0 6px;">${questionText}</p>
<p style="font-family:${DM};font-size:12px;font-weight:300;color:#888;margin:0 0 10px;">${[studentName, year, major].filter(Boolean).join(' &middot; ')}</p>
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:#E85D20;border-radius:100px;padding:6px 16px;">
<a href="${questionUrl}" style="font-family:${DM};font-size:12px;font-weight:500;color:#fff;text-decoration:none;white-space:nowrap;">Answer this${karma ? ` +${karma} karma` : ''} &rarr;</a>
</td></tr></table>
</td></tr></table>`;
}

/* ── Endpoint ───────────────────────────────────────────────── */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'buildEmail') {
      const { preheader, content, showFastiqBadge, unsubscribeUrl, prefsUrl } = body;
      return Response.json({ html: wrap({ preheader, content, showFastiqBadge, unsubscribeUrl, prefsUrl }) });
    }

    if (action === 'getComponents') {
      // Return component HTML for the caller to assemble
      const { components } = body; // array of {type, props}
      const results = {};
      for (const c of (components || [])) {
        const key = c.key || c.type;
        switch (c.type) {
          case 'h1': results[key] = h1(c.text); break;
          case 'h1Accent': results[key] = h1Accent(c.white, c.orange); break;
          case 'h2': results[key] = h2(c.text); break;
          case 'p': results[key] = p(c.text); break;
          case 'small': results[key] = small(c.text); break;
          case 'btnPrimary': results[key] = btnPrimary(c.text, c.url); break;
          case 'btnSecondary': results[key] = btnSecondary(c.text, c.url); break;
          case 'btnGhost': results[key] = btnGhost(c.text, c.url); break;
          case 'divider': results[key] = divider(); break;
          case 'accentBar': results[key] = accentBar(c.content); break;
          case 'personCard': results[key] = personCard(c.props); break;
          case 'statRow': results[key] = statRow(c.stats); break;
          case 'questionCard': results[key] = questionCard(c.props); break;
          default: results[key] = '';
        }
      }
      return Response.json({ results });
    }

    // Default: return config for admin inspection
    return Response.json({
      APP_BASE_URL: APP,
      brandColors: { bg: '#f4f2ee', dark: '#0d1117', orange: '#E85D20', white: '#ffffff' },
      fonts: { body: DM, display: PF },
      school: 'University of Florida'
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});