"use client";

import { useState } from "react";

const STATUS_BADGE = {
  Open: "bg-blue-100 text-blue-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Closed: "bg-gray-200 text-gray-700",
};

export default function TrackPage() {
  const [lookup, setLookup] = useState({ ticketId: "", email: "" });
  const [ticket, setTicket] = useState(null);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replySaving, setReplySaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [humanRequested, setHumanRequested] = useState(false);
  const [humanSaving, setHumanSaving] = useState(false);

  async function handleLookup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTicket(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lookup),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTicket(data.ticket);
      setNotes(data.notes);
      setHumanRequested(data.ticket.needsHuman);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySaving(true);
    setError("");

    try {
      const res = await fetch(`/api/track/${ticket.ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lookup.email, noteText: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotes([data, ...notes]);
      setReplyText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setReplySaving(false);
    }
  }

  async function handleRequestHuman() {
    setHumanSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/track/${ticket.ticketId}/request-human`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lookup.email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTicket(data);
      setHumanRequested(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setHumanSaving(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-xl font-bold mb-1">Track your complaint</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your ticket ID and email to check the status or reply.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {!ticket && (
          <form
            onSubmit={handleLookup}
            className="bg-white rounded-xl border shadow-sm p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Ticket ID
              </label>
              <input
                value={lookup.ticketId}
                onChange={(e) =>
                  setLookup({ ...lookup, ticketId: e.target.value })
                }
                placeholder="TKT-001"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={lookup.email}
                onChange={(e) =>
                  setLookup({ ...lookup, email: e.target.value })
                }
                required
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Looking up..." : "Find my ticket"}
            </button>
          </form>
        )}

        {ticket && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{ticket.ticketId}</p>
                  <h2 className="text-lg font-bold">{ticket.subject}</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${STATUS_BADGE[ticket.status]}`}
                >
                  {ticket.status}
                </span>
              </div>
              {ticket.aiSuggestedResponse && (
                <div className="mt-4 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                  <p className="text-xs text-gray-500 mb-1">Our response</p>
                  <p className="text-sm">{ticket.aiSuggestedResponse}</p>
                </div>
              )}
            </div>

            {/* Request human */}
            {!humanRequested ? (
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <p className="text-sm font-medium mb-2">
                  Not satisfied with this answer?
                </p>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional, helps a human reach you faster)"
                  className={`${inputClass} mb-2`}
                />
                <button
                  onClick={handleRequestHuman}
                  disabled={humanSaving}
                  className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  {humanSaving ? "Requesting..." : "Talk to a human"}
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                A human agent has been notified and will follow up with you.
              </div>
            )}

            {/* Reply / conversation */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-sm font-semibold mb-3">Add more details</h2>
              <form onSubmit={handleReply} className="mb-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Add more information about your issue..."
                  className={`${inputClass} mb-2`}
                />
                <button
                  type="submit"
                  disabled={replySaving}
                  className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {replySaving ? "Sending..." : "Send"}
                </button>
              </form>

              <div className="space-y-2">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-lg p-3 text-sm border ${
                      n.authorType === "customer"
                        ? "bg-blue-50 border-blue-100"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{n.noteText}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {n.authorType === "customer"
                        ? "You"
                        : n.authorType === "ai"
                          ? "AI"
                          : "Support agent"}
                      {" · "}
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
