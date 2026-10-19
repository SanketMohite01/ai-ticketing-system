"use client";

import { useState } from "react";

export default function ComplaintPage() {
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    subject: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setResult(data);
      setForm({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        subject: "",
        description: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-lg">
        <h1 className="text-xl font-bold mb-1">Submit a complaint</h1>
        <p className="text-sm text-gray-500 mb-6">
          Our AI will review it right away, and a human will step in if needed.
        </p>

        {result && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="font-semibold text-green-800">
              Ticket {result.ticketId} created
            </p>
            {result.aiSuggestedResponse && (
              <p className="text-sm text-green-800 mt-2">
                {result.aiSuggestedResponse}
              </p>
            )}
            {result.needsHuman && (
              <p className="text-sm text-green-700 mt-2 italic">
                A member of our team will follow up with you shortly.
              </p>
            )}
            <a
              href={`/track?ticketId=${encodeURIComponent(result.ticketId)}&email=${encodeURIComponent(result.customerEmail)}`}
              className="inline-block mt-3 text-sm text-indigo-600 hover:underline font-medium"
            >
              Reply or check status &rarr;
            </a>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your name</label>
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Describe your issue
            </label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Submit complaint"}
          </button>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Already submitted a complaint?{" "}
            <a href="/track" className="text-indigo-600 hover:underline">
              Track it here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
