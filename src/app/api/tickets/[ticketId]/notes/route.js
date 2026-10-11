import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTicketByTicketId, addNote } from "@/db/queries";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId } = await params;
  const ticket = await getTicketByTicketId(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const { noteText } = await request.json();
  if (!noteText?.trim()) {
    return NextResponse.json({ error: "Note text required" }, { status: 400 });
  }

  const note = await addNote(ticket.id, {
    noteText: noteText.trim(),
    authorType: "agent",
    authorId: session.user.id,
  });

  return NextResponse.json(note, { status: 201 });
}
