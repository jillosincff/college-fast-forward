import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { recipientEmail, senderName, messagePreview } = await req.json();

    if (!recipientEmail) {
      return Response.json({ error: "Missing recipient email" }, { status: 400 });
    }

    // Send notification email (non-blocking)
    base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `New message from ${senderName} on College Fast Forward`,
      body: `Hi,\n\n${senderName} sent you a message on College Fast Forward:\n\n"${messagePreview}"\n\nLog in to College Fast Forward to read the full message and reply.\n\nBest,\nCollege Fast Forward Team`,
    }).catch(() => {});

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error notifying message:", error);
    // Don't fail the main send if notification fails
    return Response.json({ success: true });
  }
});