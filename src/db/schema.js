import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["agent", "admin"]);
export const statusEnum = pgEnum("status", ["Open", "In Progress", "Closed"]);
export const priorityEnum = pgEnum("priority", [
  "Low",
  "Medium",
  "High",
  "Urgent",
]);
export const authorTypeEnum = pgEnum("author_type", [
  "agent",
  "ai",
  "customer",
]);

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: roleEnum("role").notNull().default("agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: text("ticket_id").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: statusEnum("status").notNull().default("Open"),
  priority: priorityEnum("priority").notNull().default("Medium"),
  aiCategory: text("ai_category"),
  aiSentiment: text("ai_sentiment"),
  aiSummary: text("ai_summary"),
  aiSuggestedResponse: text("ai_suggested_response"),
  needsHuman: boolean("needs_human").default(true),
  assignedTo: uuid("assigned_to").references(() => agents.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  noteText: text("note_text").notNull(),
  authorType: authorTypeEnum("author_type").notNull().default("agent"),
  authorId: uuid("author_id").references(() => agents.id),
  createdAt: timestamp("created_at").defaultNow(),
});
