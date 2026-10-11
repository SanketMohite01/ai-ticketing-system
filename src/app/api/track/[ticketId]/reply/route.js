import { NextResponse } from "next/server";
import { getTicketForCustomer, addCustomerNote } from "@/db/queries";

export async function POST(request, { params }) {
  const { ticketId } = await params;
  const { email, noteText } = await request.json();

  if (!email || !noteText?.trim()) {
    return NextResponse.json(
      { error: "Email and message are required" },
      { status: 400 },
    );
  }

  const ticket = await getTicketForCustomer(ticketId, email);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const note = await addCustomerNote(ticket.id, noteText.trim());
  return NextResponse.json(note, { status: 201 });
}
