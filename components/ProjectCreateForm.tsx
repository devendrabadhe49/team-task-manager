"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type UserOption = {
  id: string
  name: string
  email: string
  role: string
}

type ProjectCreateFormProps = {
  users: UserOption[]
}

export default function ProjectCreateForm({ users }: ProjectCreateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [] as string[],
  })

  const toggleMember = (memberId: string) => {
    setFormData((current) => ({
      ...current,
      memberIds: current.memberIds.includes(memberId)
        ? current.memberIds.filter((id) => id !== memberId)
        : [...current.memberIds, memberId],
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    startTransition(async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Unable to create project.")
          return
        }

        router.push(`/projects/${data.id}`)
        router.refresh()
      } catch (submitError) {
        console.error(submitError)
        setError("Something went wrong while creating the project.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel grid gap-6 rounded-[2rem] p-6 lg:grid-cols-[1fr_0.95fr] lg:p-8">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Project name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            placeholder="Launch mobile onboarding"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            placeholder="Outline the scope, deliverables, and what success looks like."
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-teal-700 px-5 py-3 font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create project"}
          </button>
          <Link
            href="/projects"
            className="rounded-full border border-slate-200 bg-white/85 px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300"
          >
            Back to projects
          </Link>
        </div>
      </div>

      <div className="soft-panel rounded-[1.75rem] p-5">
        <div className="mb-4">
          <p className="section-label mb-2">Team setup</p>
          <h2 className="text-2xl font-semibold text-slate-900">Add collaborators</h2>
          <p className="mt-2 text-sm text-slate-600">
            The project creator becomes the owner automatically.
          </p>
        </div>

        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
              No other users are available yet. You can add members later from the project page.
            </div>
          ) : (
            users.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-200 bg-white/70 px-4 py-4 transition hover:border-teal-200"
              >
                <input
                  type="checkbox"
                  checked={formData.memberIds.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {user.role}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
    </form>
  )
}
