import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getNotifications } from "@/lib/data/repository";
import { UpdatesScreen } from "@/components/updates/UpdatesScreen";

export const metadata = { title: "Updates — Learnix" };

export default async function UpdatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getNotifications(session.user.id);
  const serialized = notifications.map((n) => ({ ...n, occursAt: n.occursAt?.toISOString() ?? null }));

  return <UpdatesScreen notifications={serialized} />;
}
