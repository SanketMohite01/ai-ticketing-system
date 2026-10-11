import { NextResponse } from "next/server";
import { getTicketForCustomer, requestHuman } from "@/db/queries";

export async function POST(request, { params }) {
  const { ticketId } = await params;
  const { email, phone } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const ticket = await getTicketForCustomer(ticketId, email);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await requestHuman(ticketId, phone);
  return NextResponse.json(updated);
}
