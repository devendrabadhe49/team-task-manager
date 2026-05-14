import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"

type AppShellProps = {
  children: React.ReactNode
  user: {
    name: string
    email: string
    role: string
  }
}

export default function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel mb-6 rounded-[2rem] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <Link href="/dashboard" className="text-2xl font-semibold text-slate-900">
                Team Task Manager
              </Link>

              <nav className="flex flex-wrap gap-2 text-sm text-slate-600">
                <Link
                  href="/dashboard"
                  className="rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-slate-900"
                >
                  Dashboard
                </Link>

                <Link
                  href="/projects"
                  className="rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-slate-900"
                >
                  Projects
                </Link>

                <Link
                  href="/tasks"
                  className="rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-slate-900"
                >
                  Tasks
                </Link>
              </nav>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{user.name}</span>
                {" · "}
                {user.role}
              </div>

              <SignOutButton />
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}