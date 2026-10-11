import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listTickets } from "@/db/queries";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tickets = await listTickets();

  return (
    <DashboardClient initialTickets={tickets} agentName={session.user.name} />
  );
}
