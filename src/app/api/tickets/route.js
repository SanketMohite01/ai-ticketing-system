import { NextResponse } from "next/server";
import { createTicket, updateTicketAiFields, listTickets } from "@/db/queries";
import { analyzeTicket } from "@/lib/ai";
import { createTicketSchema, validateBody } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = validateBody(createTicketSchema, body);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    const { customerName, customerEmail, customerPhone, subject, description } =
      data;

    // 1. Save the ticket immediately so we never lose a complaint, even if AI analysis fails
    const ticket = await createTicket({
      customerName,
      customerEmail,
      customerPhone,
      subject,
      description,
    });
    // ... rest of the function stays exactly the same
    // 2. Ask Gemini to analyze it
    const analysis = await analyzeTicket({ subject, description });

    // 3. Update the ticket with the AI's analysis
    const updated = await updateTicketAiFields(ticket.ticketId, {
      priority: analysis.priority,
      aiCategory: analysis.category,
      aiSentiment: analysis.sentiment,
      aiSummary: analysis.summary,
      aiSuggestedResponse: analysis.suggestedResponse,
      needsHuman: analysis.needsHuman,
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    console.error("Ticket creation failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const tickets = await listTickets({ status, search });
  return NextResponse.json(tickets);
}
