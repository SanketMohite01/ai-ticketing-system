import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTicketByTicketId,
  updateTicketStatus,
  listNotes,
} from "@/db/queries";

export async function GET(request, { params }) {
  const { ticketId } = await params;
  const ticket = await getTicketByTicketId(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  const notes = await listNotes(ticket.id);
  return NextResponse.json({ ticket, notes });
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId } = await params;
  const { status } = await request.json();

  const updated = await updateTicketStatus(ticketId, status);
  if (!updated) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
