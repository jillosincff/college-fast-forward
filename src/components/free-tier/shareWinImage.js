import html2canvas from 'html2canvas';

// Renders a branded "I got a win" card offscreen, converts it to a PNG,
// and shares it via the native share sheet (or downloads it as a fallback).
export async function shareWinImage({ type, company, shareUrl }) {
  const headline = type === 'interview' ? 'INTERVIEW LANDED' : 'GOT A REPLY';
  const sub = type === 'interview'
    ? `I just landed an interview at ${company}`
    : `${company} just replied to my outreach`;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;';
  wrapper.innerHTML = `
    <div style="width:600px;height:600px;box-sizing:border-box;padding:56px;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(145deg,#1e1b4b 0%,#4c1d95 55%,#7c3aed 100%);font-family:'DM Sans',system-ui,sans-serif;border-radius:0;">
      <div>
        <p style="margin:0 0 10px;font-size:15px;font-weight:700;letter-spacing:0.14em;color:#c4b5fd;">COLLEGE FAST FORWARD</p>
        <p style="margin:0;font-size:56px;line-height:1.05;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">${headline} &#127881;</p>
      </div>
      <div>
        <p style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ede9fe;line-height:1.35;">${sub}</p>
        <p style="margin:0;font-size:17px;color:#a5b4fc;line-height:1.5;">Warm intros beat cold applications. My school's network made the difference.</p>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.2);padding-top:22px;">
        <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">collegefastforward.com</p>
        <p style="margin:0;font-size:14px;font-weight:600;color:#c4b5fd;">Powered by CLiFF AI</p>
      </div>
    </div>`;
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(wrapper.firstElementChild, { scale: 2, useCORS: true });
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    const file = new File([blob], 'cff-win.png', { type: 'image/png' });
    const shareText = `${sub} — thanks to my school's alumni network on CFF. ${shareUrl}`;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: shareText });
        return true;
      } catch (e) {
        if (e?.name === 'AbortError') return true; // user closed the sheet — not an error
      }
    }
    // Fallback: download the image
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cff-win.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    return true;
  } finally {
    wrapper.remove();
  }
}