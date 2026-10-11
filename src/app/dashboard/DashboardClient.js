"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const STATUS_BADGE = {
  Open: "bg-blue-100 text-blue-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Closed: "bg-gray-200 text-gray-700",
};
const PRIORITY_BADGE = {
  Low: "border-gray-300 text-gray-600",
  Medium: "border-blue-300 text-blue-700",
  High: "border-amber-400 text-amber-700",
  Urgent: "border-red-400 text-red-700",
};

export default function DashboardClient({ initialTickets, agentName }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const res = await fetch(`/api/tickets?${params}`);
      const data = await res.json();
      setTickets(data);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-indigo-600">
          AI Ticketing — Dashboard
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">Hi, {agentName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-500 hover:text-red-600"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-2">
          {loading
            ? "Loading..."
            : `${tickets.length} ticket${tickets.length === 1 ? "" : "s"}`}
        </p>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Subject</th>
                <th className="px-4 py-2">AI Category</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Needs Human</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/${t.ticketId}`)}
                >
                  <td className="px-4 py-2 font-medium">{t.ticketId}</td>
                  <td className="px-4 py-2">{t.customerName}</td>
                  <td className="px-4 py-2">{t.subject}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {t.aiCategory || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`border rounded-full px-2 py-0.5 text-xs ${PRIORITY_BADGE[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_BADGE[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {t.needsHuman ? (
                      <span className="text-red-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-green-600">AI handled</span>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
