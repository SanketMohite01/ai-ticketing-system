import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-indigo-600 mb-2">
          AI Ticketing System
        </h1>
        <p className="text-gray-600 mb-6">
          Submit a support complaint and get an instant AI-reviewed response,
          with a real human stepping in whenever it's needed.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/complaint"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            Submit a complaint
          </Link>
          <Link
            href="/track"
            className="bg-white border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50"
          >
            Track my ticket
          </Link>
        </div>
      </div>
    </main>
  );
}
