import { notFound, redirect } from "next/navigation"
import AppShell from "@/components/AppShell"
import TaskCreateForm from "@/components/TaskCreateForm"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageProject } from "@/lib/access"

export default async function CreateTaskPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true } },
    },
  })

  if (!project) {
    notFound()
  }

  if (!canManageProject(session, project)) {
    redirect(`/projects/${id}`)
  }

  const assigneeMap = new Map(
    [project.owner, ...project.members].map((member) => [
      member.id,
      {
        id: member.id,
        name: member.name,
        email: member.email,
      },
    ])
  )

  return (
    <AppShell user={session.user}>
      <div className="space-y-6">
        <div>
          <p className="section-label mb-3">New task</p>
          <h1 className="text-4xl font-semibold text-slate-900">Create a task for {project.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Assign ownership, set a due date, and decide where the work starts in the pipeline.
          </p>
        </div>

        <TaskCreateForm projectId={project.id} assignees={Array.from(assigneeMap.values())} />
      </div>
    </AppShell>
  )
}
