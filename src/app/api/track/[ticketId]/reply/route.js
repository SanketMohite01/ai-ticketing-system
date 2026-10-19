import { NextResponse } from "next/server";
import { getTicketForCustomer, addCustomerNote } from "@/db/queries";
import { replySchema, validateBody } from "@/lib/validation";

export async function POST(request, { params }) {
  const { ticketId } = await params;
  const body = await request.json();
  const { data, error } = validateBody(replySchema, body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const ticket = await getTicketForCustomer(ticketId, data.email);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const note = await addCustomerNote(ticket.id, data.noteText);
  return NextResponse.json(note, { status: 201 });
}
