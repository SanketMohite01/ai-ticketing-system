import { db } from "./index";
import { tickets, notes, agents } from "./schema";
import { eq, desc, or, ilike } from "drizzle-orm";

// Generates the next ticket ID, e.g. TKT-001, TKT-002...
async function nextTicketId() {
  const [latest] = await db
    .select({ ticketId: tickets.ticketId })
    .from(tickets)
    .orderBy(desc(tickets.createdAt))
    .limit(1);

  if (!latest) return "TKT-001";
  const num = parseInt(latest.ticketId.split("-")[1], 10) + 1;
  return `TKT-${String(num).padStart(3, "0")}`;
}

export async function createTicket({
  customerName,
  customerEmail,
  customerPhone,
  subject,
  description,
}) {
  const ticketId = await nextTicketId();
  const [ticket] = await db
    .insert(tickets)
    .values({
      ticketId,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      description,
    })
    .returning();
  return ticket;
}

export async function listTickets({ status, search } = {}) {
  let query = db.select().from(tickets);

  if (status) {
    query = query.where(eq(tickets.status, status));
  }
  if (search) {
    const term = `%${search}%`;
    query = query.where(
      or(
        ilike(tickets.ticketId, term),
        ilike(tickets.customerName, term),
        ilike(tickets.customerEmail, term),
        ilike(tickets.subject, term),
        ilike(tickets.description, term),
      ),
    );
  }

  return query.orderBy(desc(tickets.createdAt));
}

export async function getTicketByTicketId(ticketId) {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.ticketId, ticketId));
  return ticket ?? null;
}

export async function updateTicketAiFields(ticketId, aiFields) {
  const [ticket] = await db
    .update(tickets)
    .set({ ...aiFields, updatedAt: new Date() })
    .where(eq(tickets.ticketId, ticketId))
    .returning();
  return ticket;
}

export async function updateTicketStatus(ticketId, status) {
  const [ticket] = await db
    .update(tickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(tickets.ticketId, ticketId))
    .returning();
  return ticket;
}

export async function addNote(ticketDbId, { noteText, authorType, authorId }) {
  const [note] = await db
    .insert(notes)
    .values({ ticketId: ticketDbId, noteText, authorType, authorId })
    .returning();
  return note;
}

export async function listNotes(ticketDbId) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.ticketId, ticketDbId))
    .orderBy(desc(notes.createdAt));
}

export async function getTicketForCustomer(ticketId, email) {
  const ticket = await getTicketByTicketId(ticketId);
  if (!ticket) return null;
  if (ticket.customerEmail.toLowerCase() !== email.toLowerCase()) return null;
  return ticket;
}

export async function addCustomerNote(ticketDbId, noteText) {
  return addNote(ticketDbId, {
    noteText,
    authorType: "customer",
    authorId: null,
  });
}

export async function requestHuman(ticketId, phone) {
  const updates = { needsHuman: true, updatedAt: new Date() };
  if (phone) updates.customerPhone = phone;

  const [ticket] = await db
    .update(tickets)
    .set(updates)
    .where(eq(tickets.ticketId, ticketId))
    .returning();
  return ticket;
}
