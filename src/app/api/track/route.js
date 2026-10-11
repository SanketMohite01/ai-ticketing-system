import { NextResponse } from "next/server";
import { getTicketForCustomer, listNotes } from "@/db/queries";

export async function POST(request) {
  const { ticketId, email } = await request.json();
  if (!ticketId || !email) {
    return NextResponse.json(
      { error: "Ticket ID and email are required" },
      { status: 400 },
    );
  }

  const ticket = await getTicketForCustomer(ticketId.trim(), email.trim());
  if (!ticket) {
    return NextResponse.json(
      { error: "No matching ticket found. Check your ticket ID and email." },
      { status: 404 },
    );
  }

  const notes = await listNotes(ticket.id);
  // Customers shouldn't see internal agent-only notes in a real system —
  // for now we show agent + AI + customer notes together, since there's no "internal" flag yet
  return NextResponse.json({ ticket, notes });
}
