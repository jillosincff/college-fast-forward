import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, messageBody, intent } = await req.json();

    if (!recipientId || !messageBody) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Save draft
    const draft = await base44.entities.OutreachDraft.create({
      recipient_name: "Draft",
      recipient_company: "",
      context: "composer_draft",
      message: messageBody,
      status: "draft",
      metadata: {
        intent,
        recipientId,
      },
    });

    return Response.json({ success: true, draftId: draft.id });
  } catch (error) {
    console.error("Error saving draft:", error);
    return Response.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
});