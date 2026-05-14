import AppShell from "@/components/AppShell"
import ProjectCreateForm from "@/components/ProjectCreateForm"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function CreateProjectPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/projects")
  }

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: session.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: [
      { role: "asc" },
      { name: "asc" },
    ],
  })

  return (
    <AppShell user={session.user}>
      <div className="space-y-6">
        <div>
          <p className="section-label mb-3">New project</p>
          <h1 className="text-4xl font-semibold text-slate-900">Create a team workspace</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Define the project scope, add teammates, and start assigning tasks right away.
          </p>
        </div>

        <ProjectCreateForm users={users} />
      </div>
    </AppShell>
  )
}
