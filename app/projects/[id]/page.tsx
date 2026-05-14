import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import AppShell from "@/components/AppShell"
import ProjectMembersManager from "@/components/ProjectMembersManager"
import ProjectSettings from "@/components/ProjectSettings"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canAccessProject, canManageProject } from "@/lib/access"

export const dynamic = "force-dynamic"

export default async function ProjectDetailPage({
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
      owner: { select: { id: true, name: true, email: true, role: true } },
      members: { select: { id: true, name: true, email: true, role: true } },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: [
          { status: "asc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
      },
    },
  })

  if (!project) {
    notFound()
  }

  if (!canAccessProject(session, project)) {
    redirect("/projects")
  }

  const canManage = canManageProject(session, project)
  const availableUsers = canManage
    ? await prisma.user.findMany({
        where: {
          id: {
            not: project.ownerId,
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
    : []

  const todoTasks = project.tasks.filter((task) => task.status === "TODO")
  const inProgressTasks = project.tasks.filter((task) => task.status === "IN_PROGRESS")
  const doneTasks = project.tasks.filter((task) => task.status === "DONE")
  const completedTasks = doneTasks.length
  const progress =
    project.tasks.length === 0 ? 0 : Math.round((completedTasks / project.tasks.length) * 100)

  const columns = [
    {
      title: "To do",
      tasks: todoTasks,
      accent: "border-slate-200",
      chip: "bg-slate-900 text-white",
    },
    {
      title: "In progress",
      tasks: inProgressTasks,
      accent: "border-amber-200",
      chip: "bg-amber-100 text-amber-800",
    },
    {
      title: "Done",
      tasks: doneTasks,
      accent: "border-emerald-200",
      chip: "bg-emerald-100 text-emerald-800",
    },
  ]

  return (
    <AppShell user={session.user}>
      <div className="space-y-6">
        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link href="/projects" className="text-sm font-medium text-teal-700 hover:text-teal-800">
                Back to projects
              </Link>
              <p className="section-label mb-3 mt-4">Project overview</p>
              <h1 className="text-4xl font-semibold text-slate-900">{project.name}</h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                {project.description || "No project description added yet."}
              </p>
            </div>

            {canManage ? (
              <Link
                href={`/projects/${project.id}/tasks/create`}
                className="rounded-full bg-teal-700 px-5 py-3 font-medium text-white transition hover:bg-teal-800"
              >
                Create task
              </Link>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Owner</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{project.owner.name}</p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Collaborators</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {project.members.length + 1}
              </p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Progress</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{progress}% complete</p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Owner · {project.owner.name}
            </span>
            {project.members.map((member) => (
              <span
                key={member.id}
                className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700"
              >
                {member.name}
              </span>
            ))}
          </div>
        </section>

        {canManage ? (
          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <ProjectSettings
              projectId={project.id}
              initialName={project.name}
              initialDescription={project.description}
            />
            <ProjectMembersManager
              projectId={project.id}
              users={availableUsers}
              initialMemberIds={project.members.map((member) => member.id)}
            />
          </section>
        ) : null}

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-label mb-2">Task board</p>
              <h2 className="text-3xl font-semibold text-slate-900">
                Tasks ({project.tasks.length})
              </h2>
            </div>
          </div>

          {project.tasks.length === 0 ? (
            <div className="glass-panel rounded-[2rem] p-10 text-center text-slate-600">
              No tasks yet. {canManage ? "Create the first task to kick off the project." : "The team will add tasks here."}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-3">
              {columns.map((column) => (
                <div key={column.title} className="glass-panel rounded-[2rem] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {column.title} ({column.tasks.length})
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {column.tasks.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">
                        No tasks in this column.
                      </div>
                    ) : (
                      column.tasks.map((task) => (
                        <Link
                          key={task.id}
                          href={`/projects/${project.id}/tasks/${task.id}`}
                          className={`soft-panel block rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${column.accent}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{task.title}</p>
                              <p className="mt-2 text-sm text-slate-600">
                                {task.description || "No description"}
                              </p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${column.chip}`}>
                              {task.status.replace("_", " ")}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                            <span>{task.assignedTo?.name || "Unassigned"}</span>
                            <span>
                              {task.dueDate
                                ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                                : "No due date"}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
