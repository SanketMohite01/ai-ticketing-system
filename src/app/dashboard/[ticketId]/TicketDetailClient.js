"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_BADGE = {
  Open: "bg-blue-100 text-blue-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Closed: "bg-gray-200 text-gray-700",
};
const SENTIMENT_COLOR = {
  Positive: "text-green-600",
  Neutral: "text-gray-600",
  Frustrated: "text-amber-600",
  Angry: "text-red-600",
};

export default function TicketDetailClient({ initialTicket, initialNotes }) {
  const [ticket, setTicket] = useState(initialTicket);
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleStatusChange(newStatus) {
    setStatusSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticket.ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticket.ticketId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotes([data, ...notes]);
      setNoteText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setNoteSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <Link
          href="/dashboard"
          className="text-indigo-600 text-sm hover:underline"
        >
          &larr; Back to dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Ticket info */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <p className="text-sm text-gray-500">{ticket.ticketId}</p>
              <h1 className="text-xl font-bold">{ticket.subject}</h1>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm ${STATUS_BADGE[ticket.status]}`}
            >
              {ticket.status}
            </span>
          </div>
          <hr className="my-4" />
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">Customer</dt>
            <dd>{ticket.customerName}</dd>
            <dt className="text-gray-500">Email</dt>
            <dd>{ticket.customerEmail}</dd>
            <dt className="text-gray-500">Description</dt>
            <dd className="whitespace-pre-wrap">{ticket.description}</dd>
          </dl>
        </div>

        {/* AI analysis */}
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
          <h2 className="text-sm font-semibold text-indigo-700 mb-3">
            AI Analysis
          </h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-gray-500">Category</dt>
            <dd>{ticket.aiCategory || "Not analyzed"}</dd>
            <dt className="text-gray-500">Priority</dt>
            <dd>{ticket.priority}</dd>
            <dt className="text-gray-500">Sentiment</dt>
            <dd className={SENTIMENT_COLOR[ticket.aiSentiment] || ""}>
              {ticket.aiSentiment || "—"}
            </dd>
            <dt className="text-gray-500">Summary</dt>
            <dd>{ticket.aiSummary || "—"}</dd>
            <dt className="text-gray-500">Needs human?</dt>
            <dd>
              {ticket.needsHuman ? (
                <span className="text-red-600 font-medium">Yes</span>
              ) : (
                <span className="text-green-600">No — AI handled</span>
              )}
            </dd>
          </dl>
          {ticket.aiSuggestedResponse && (
            <div className="mt-4 bg-white rounded-lg p-3 border border-indigo-100">
              <p className="text-xs text-gray-500 mb-1">Suggested response</p>
              <p className="text-sm">{ticket.aiSuggestedResponse}</p>
            </div>
          )}
        </div>

        {/* Status update */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-3">Update status</h2>
          <div className="flex gap-2">
            {["Open", "In Progress", "Closed"].map((s) => (
              <button
                key={s}
                disabled={statusSaving || ticket.status === s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  ticket.status === s
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white hover:bg-gray-50 border-gray-300"
                } disabled:opacity-50`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-sm font-semibold mb-3">Notes</h2>
          <form onSubmit={handleAddNote} className="mb-4">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              placeholder="Add a note..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
            />
            <button
              type="submit"
              disabled={noteSaving}
              className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {noteSaving ? "Adding..." : "Add note"}
            </button>
          </form>

          <div className="space-y-2">
            {notes.length === 0 && (
              <p className="text-sm text-gray-400">No notes yet.</p>
            )}
            {notes.map((n) => (
              <div
                key={n.id}
                className={`border rounded-lg p-3 text-sm ${n.authorType === "customer" ? "bg-blue-50 border-blue-100" : "bg-gray-50"}`}
              >
                <p className="whitespace-pre-wrap">{n.noteText}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.authorType === "ai"
                    ? "AI"
                    : n.authorType === "customer"
                      ? "Customer"
                      : "Agent"}{" "}
                  &middot; {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
