import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import AppShell from "@/components/AppShell"
import TaskDetails from "@/components/TaskDetails"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canAccessTask, canManageProject } from "@/lib/access"

export default async function TaskPage({
  params
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      project: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          members: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  if (!task || task.project.id !== id) {
    notFound()
  }

  if (!canAccessTask(session, task)) {
    redirect(`/projects/${id}`)
  }

  const canManage = canManageProject(session, task.project)
  const assigneeMap = new Map(
    [task.project.owner, ...task.project.members].map((member) => [
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
          <Link href={`/projects/${id}`} className="text-sm font-medium text-teal-700 hover:text-teal-800">
            Back to project
          </Link>
          <p className="section-label mb-3 mt-4">Task workspace</p>
          <h1 className="text-4xl font-semibold text-slate-900">{task.project.name}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Review task context, ownership, and current delivery status.
          </p>
        </div>

        <TaskDetails
          projectId={id}
          assignees={Array.from(assigneeMap.values())}
          initialTask={{
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            dueDate: task.dueDate,
            assignedToId: task.assignedToId,
            assignedTo: task.assignedTo,
            project: {
              id: task.project.id,
              name: task.project.name,
            },
          }}
          permissions={{
            canManage,
            canUpdateStatus: canManage || task.assignedToId === session.user.id,
          }}
        />
      </div>
    </AppShell>
  )
}
