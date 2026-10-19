import { z } from "zod";

export const createTicketSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(200),
  customerPhone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
});

export const trackLookupSchema = z.object({
  ticketId: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(200),
});

export const replySchema = z.object({
  email: z.string().trim().email().max(200),
  noteText: z.string().trim().min(1).max(5000),
});

export const requestHumanSchema = z.object({
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const addNoteSchema = z.object({
  noteText: z.string().trim().min(1).max(5000),
});

export const updateStatusSchema = z.object({
  status: z.enum(["Open", "In Progress", "Closed"]),
});

// Helper: validates body, returns { data } on success or { errorResponse } to return directly
export function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      error: result.error.issues.map((i) => i.message).join(", "),
    };
  }
  return { data: result.data };
}
