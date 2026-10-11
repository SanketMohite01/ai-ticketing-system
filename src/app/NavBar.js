"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between text-sm">
      <Link href="/" className="font-bold text-indigo-600">
        AI Ticketing
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/complaint" className="text-gray-600 hover:text-indigo-600">
          Submit a complaint
        </Link>
        <Link href="/track" className="text-gray-600 hover:text-indigo-600">
          Track my ticket
        </Link>

        {status === "authenticated" ? (
          <>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-indigo-600"
            >
              Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">Hi, {session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-500 hover:text-red-600"
            >
              Log out
            </button>
          </>
        ) : (
          <Link href="/login" className="text-gray-600 hover:text-indigo-600">
            Agent login
          </Link>
        )}
      </div>
    </nav>
  );
}
