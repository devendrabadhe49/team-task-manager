import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { projectScope } from "@/lib/access"
import AppShell from "@/components/AppShell"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const projects = await prisma.project.findMany({
    where: projectScope(session),
    include: {
      owner: { select: { id: true, name: true } },
      tasks: true,
      members: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <AppShell user={session.user}>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-label mb-3">Projects</p>
            <h1 className="text-4xl font-semibold text-slate-900">Team workspaces</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Browse project progress, collaborators, and active task load.
            </p>
          </div>

          {session.user.role === "ADMIN" ? (
            <Link
              href="/projects/create"
              className="rounded-full bg-teal-700 px-5 py-3 font-medium text-white transition hover:bg-teal-800"
            >
              Create project
            </Link>
          ) : (
            <div className="soft-panel rounded-full px-5 py-3 text-sm text-slate-600">
              Members can view shared projects and update their assigned tasks.
            </div>
          )}
        </section>

        {projects.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">No projects yet</h2>
            <p className="mt-3 text-slate-600">
              {session.user.role === "ADMIN"
                ? "Create your first project to start assigning work."
                : "You will see projects here once an admin adds you to a team."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => {
              const completed = project.tasks.filter((task) => task.status === "DONE").length
              const progress =
                project.tasks.length === 0
                  ? 0
                  : Math.round((completed / project.tasks.length) * 100)

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Owned by {project.owner.name}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-900">{project.name}</h2>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      {progress}% done
                    </span>
                  </div>

                  <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
                    {project.description || "No project description yet."}
                  </p>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                    <span>{project.tasks.length} tasks</span>
                    <span>{project.members.length + 1} collaborators</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
