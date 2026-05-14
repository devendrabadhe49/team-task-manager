"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type AssigneeOption = {
  id: string
  name: string
  email: string
}

type TaskCreateFormProps = {
  projectId: string
  assignees: AssigneeOption[]
}

export default function TaskCreateForm({ projectId, assignees }: TaskCreateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    dueDate: "",
    assignedToId: "",
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    startTransition(async () => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            projectId,
            assignedToId: formData.assignedToId || null,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Unable to create task.")
          return
        }

        router.push(`/projects/${projectId}/tasks/${data.id}`)
        router.refresh()
      } catch (submitError) {
        console.error(submitError)
        setError("Something went wrong while creating the task.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel grid gap-6 rounded-[2rem] p-6 lg:grid-cols-[1fr_0.9fr] lg:p-8">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Task title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            placeholder="Finalize onboarding checklist"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            placeholder="Add details, blockers, or implementation notes."
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
            className="rounded-full bg-teal-700 px-5 py-3 font-medium text-white transition hover:bg-teal-800 disabled:opacity-60"
          >
            {isPending ? "Creating..." : "Create task"}
          </button>
          <Link
            href={`/projects/${projectId}`}
            className="rounded-full border border-slate-200 bg-white/85 px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300"
          >
            Back to project
          </Link>
        </div>
      </div>

      <div className="soft-panel rounded-[1.75rem] p-5">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Assign to</label>
            <select
              value={formData.assignedToId}
              onChange={(event) =>
                setFormData((current) => ({ ...current, assignedToId: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            >
              <option value="">Unassigned</option>
              {assignees.map((assignee) => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={formData.status}
              onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Due date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(event) => setFormData((current) => ({ ...current, dueDate: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
