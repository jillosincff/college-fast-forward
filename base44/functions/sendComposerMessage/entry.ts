import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, recipientEmail, messageBody, intent, editPercentage } =
      await req.json();

    if (!recipientId || !messageBody) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create message record
    const message = await base44.entities.Message.create({
      conversation_id: `${user.id}-${recipientId}`,
      sender_email: user.email,
      sender_name: user.full_name,
      recipient_email: recipientEmail,
      subject: "Message from College Fast Forward",
      body: messageBody,
      is_read: false,
      message_type: "text",
      metadata: {
        intent,
        editPercentage,
        composer_version: 1,
      },
    });

    // Send notification email to recipient (non-blocking)
    base44.functions
      .invoke("notifyNewComposerMessage", {
        recipientEmail,
        senderName: user.full_name,
        messagePreview: messageBody.substring(0, 100),
      })
      .catch(() => {});

    return Response.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
});