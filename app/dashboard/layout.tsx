import AppShell from "@/components/AppShell"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return <AppShell user={session.user}>{children}</AppShell>
}
