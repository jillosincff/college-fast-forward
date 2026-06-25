// LEGACY ENDPOINT — superseded by the /#/VerifyEmail page + verifyRegistration.
// Old verification emails / bookmarks may still hit this URL. Instead of rendering
// the old black/orange UF-branded HTML page (a dead end), forward the token to the
// modern, violet-branded VerifyEmail route which handles verification + sign-in.
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || '';
  const appBase = Deno.env.get('APP_BASE_URL') || 'https://www.collegefastforward.com';
  const dest = token
    ? `${appBase}/#/VerifyEmail?token=${encodeURIComponent(token)}`
    : `${appBase}/#/GatorAuth`;

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${dest}"><title>Redirecting…</title></head><body style="font-family:'DM Sans',system-ui,sans-serif;background:linear-gradient(135deg,#f0f4f8,#ffffff,#f0f4f8);color:#0f172a;text-align:center;padding:60px 24px;"><p style="color:#64748b;">Taking you to College Fast Forward…</p><script>window.location.replace(${JSON.stringify(dest)});</script></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
});