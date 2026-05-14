import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { projectScope, taskScope } from "@/lib/access"

export default async function Dashboard() {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: projectScope(session),
      include: {
        owner: { select: { id: true, name: true } },
        members: { select: { id: true } },
        tasks: {
          select: {
            id: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.task.findMany({
      where: taskScope(session),
      include: {
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [
        { dueDate: "asc" },
        { updatedAt: "desc" },
      ],
    }),
  ])

  const todoTasks = tasks.filter((task) => task.status === "TODO")
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS")
  const doneTasks = tasks.filter((task) => task.status === "DONE")
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE"
  )
  const managedProjects = projects.filter((project) => project.owner.id === session.user.id)
  const recentProjects = projects.slice(0, 3)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-label mb-3">Workspace overview</p>
          <h1 className="text-4xl font-semibold text-slate-900">Delivery dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Stay on top of team workload, overdue tasks, and project health from one place.
          </p>
        </div>

        <div className="soft-panel rounded-3xl px-5 py-4 text-sm text-slate-600">
          Signed in as <span className="font-semibold text-slate-900">{session.user.name}</span>
          {" · "}
          {session.user.role}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="glass-panel rounded-[1.75rem] p-5">
          <p className="text-sm font-medium text-slate-500">Projects</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{projects.length}</p>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-5">
          <p className="text-sm font-medium text-slate-500">To do</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{todoTasks.length}</p>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-5">
          <p className="text-sm font-medium text-slate-500">In progress</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{inProgressTasks.length}</p>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-5">
          <p className="text-sm font-medium text-slate-500">Completed</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{doneTasks.length}</p>
        </div>
        <div className="glass-panel rounded-[1.75rem] p-5">
          <p className="text-sm font-medium text-slate-500">Overdue</p>
          <p className="mt-3 text-3xl font-semibold text-rose-700">{overdueTasks.length}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="section-label mb-2">Task pipeline</p>
              <h2 className="text-2xl font-semibold text-slate-900">Open work</h2>
            </div>
            <Link
              href="/projects"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
            >
              View projects
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="soft-panel rounded-3xl p-6 text-slate-600">
                No tasks yet. Create a project and start assigning work.
              </div>
            ) : (
              tasks.slice(0, 8).map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${task.project.id}/tasks/${task.id}`}
                  className="soft-panel block rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {task.project.name}
                        {task.assignedTo ? ` · ${task.assignedTo.name}` : " · Unassigned"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {task.dueDate
                      ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                      : "No due date"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-[2rem] p-6">
            <p className="section-label mb-2">Attention needed</p>
            <h2 className="text-2xl font-semibold text-slate-900">Overdue tasks</h2>
            <div className="mt-5 space-y-3">
              {overdueTasks.length === 0 ? (
                <div className="soft-panel rounded-3xl p-5 text-sm text-slate-600">
                  Nice work. Nothing is overdue right now.
                </div>
              ) : (
                overdueTasks.slice(0, 5).map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project.id}/tasks/${task.id}`}
                    className="soft-panel block rounded-3xl p-4 text-sm transition hover:border-rose-300"
                  >
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-slate-600">{task.project.name}</p>
                    <p className="mt-3 text-rose-700">
                      Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "soon"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <p className="section-label mb-2">Project pulse</p>
            <h2 className="text-2xl font-semibold text-slate-900">Recent projects</h2>
            <div className="mt-5 space-y-3">
              {recentProjects.length === 0 ? (
                <div className="soft-panel rounded-3xl p-5 text-sm text-slate-600">
                  No projects are available yet.
                </div>
              ) : (
                recentProjects.map((project) => {
                  const completed = project.tasks.filter((task) => task.status === "DONE").length
                  const progress =
                    project.tasks.length === 0
                      ? 0
                      : Math.round((completed / project.tasks.length) * 100)

                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="soft-panel block rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{project.name}</p>
                        <span className="text-sm text-slate-500">{progress}% done</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-teal-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {project.tasks.length} tasks · {project.members.length + 1} collaborators
                      </p>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <p className="section-label mb-2">Your lane</p>
            <h2 className="text-2xl font-semibold text-slate-900">Managed projects</h2>
            <p className="mt-3 text-sm text-slate-600">
              You currently own {managedProjects.length} project{managedProjects.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
