import { NextResponse } from "next/server";
import { getTicketForCustomer, requestHuman } from "@/db/queries";
import { requestHumanSchema, validateBody } from "@/lib/validation";

export async function POST(request, { params }) {
  const { ticketId } = await params;
  const body = await request.json();
  const { data, error } = validateBody(requestHumanSchema, body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const ticket = await getTicketForCustomer(ticketId, data.email);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await requestHuman(ticketId, data.phone);
  return NextResponse.json(updated);
}
