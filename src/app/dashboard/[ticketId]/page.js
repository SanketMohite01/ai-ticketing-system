import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getTicketByTicketId, listNotes } from "@/db/queries";
import TicketDetailClient from "./TicketDetailClient";

export default async function TicketDetailPage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { ticketId } = await params;
  const ticket = await getTicketByTicketId(ticketId);
  if (!ticket) notFound();

  const notes = await listNotes(ticket.id);

  return <TicketDetailClient initialTicket={ticket} initialNotes={notes} />;
}
