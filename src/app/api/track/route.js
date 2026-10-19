import { NextResponse } from "next/server";
import { getTicketForCustomer, listNotes } from "@/db/queries";
import { trackLookupSchema, validateBody } from "@/lib/validation";
import { trackLimiter, getClientIp } from "@/lib/ratelimit";

export async function POST(request) {
  const ip = getClientIp(request);
  const { success } = await trackLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { data, error } = validateBody(trackLookupSchema, body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const ticket = await getTicketForCustomer(
    data.ticketId.trim(),
    data.email.trim(),
  );
  if (!ticket) {
    return NextResponse.json(
      { error: "No matching ticket found. Check your ticket ID and email." },
      { status: 404 },
    );
  }

  const notes = await listNotes(ticket.id);
  return NextResponse.json({ ticket, notes });
}
