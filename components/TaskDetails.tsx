"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type AssigneeOption = {
  id: string
  name: string
  email: string
}

type TaskRecord = {
  id: string
  title: string
  description: string | null
  status: string
  dueDate: string | Date | null
  assignedToId?: string | null
  assignedTo: AssigneeOption | null
  project: {
    id: string
    name: string
  }
}

type TaskDetailsProps = {
  projectId: string
  assignees: AssigneeOption[]
  initialTask: TaskRecord
  permissions: {
    canManage: boolean
    canUpdateStatus: boolean
  }
}

function toDateInput(value: string | Date | null | undefined) {
  if (!value) {
    return ""
  }

  return new Date(value).toISOString().split("T")[0]
}

function toDisplayDate(value: string | Date | null | undefined) {
  if (!value) {
    return "No due date"
  }

  return new Date(value).toLocaleDateString()
}

export default function TaskDetails({
  projectId,
  assignees,
  initialTask,
  permissions,
}: TaskDetailsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [task, setTask] = useState(initialTask)
  const [formData, setFormData] = useState({
    title: initialTask.title,
    description: initialTask.description ?? "",
    status: initialTask.status,
    dueDate: toDateInput(initialTask.dueDate),
    assignedToId: initialTask.assignedTo?.id ?? "",
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    startTransition(async () => {
      try {
        const payload = permissions.canManage
          ? {
              ...formData,
              assignedToId: formData.assignedToId || null,
              dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            }
          : {
              status: formData.status,
            }

        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Unable to update task.")
          return
        }

        setTask(data)
        setFormData({
          title: data.title,
          description: data.description ?? "",
          status: data.status,
          dueDate: toDateInput(data.dueDate),
          assignedToId: data.assignedTo?.id ?? "",
        })
        setEditing(false)
        router.refresh()
      } catch (saveError) {
        console.error(saveError)
        setError("Something went wrong while updating the task.")
      }
    })
  }

  const handleDelete = () => {
    setError("")

    if (!window.confirm("Delete this task?")) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Unable to delete task.")
          return
        }

        router.push(`/projects/${projectId}`)
        router.refresh()
      } catch (deleteError) {
        console.error(deleteError)
        setError("Something went wrong while deleting the task.")
      }
    })
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      {!editing ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="section-label mb-3">Task details</p>
              <h2 className="text-3xl font-semibold text-slate-900">{task.title}</h2>
              <p className="mt-3 max-w-3xl text-slate-600">
                {task.description || "No task description provided yet."}
              </p>
            </div>

            {permissions.canUpdateStatus ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-teal-700 px-5 py-3 font-medium text-white transition hover:bg-teal-800"
                >
                  {permissions.canManage ? "Edit task" : "Update status"}
                </button>
                {permissions.canManage ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="rounded-full border border-rose-200 bg-white px-5 py-3 font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                  >
                    Delete task
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {task.status.replace("_", " ")}
              </p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Due date</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {toDisplayDate(task.dueDate)}
              </p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Assigned to</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {task.assignedTo?.name || "Unassigned"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Project</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{task.project.name}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <p className="section-label">Update task</p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {permissions.canManage ? "Edit task details" : "Change task status"}
            </h2>
            {!permissions.canManage ? (
              <p className="text-sm text-slate-600">
                Members can update only the status of tasks assigned to them.
              </p>
            ) : null}
          </div>

          {permissions.canManage ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Task title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, title: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, description: event.target.value }))
                  }
                  className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
                />
              </div>
            </>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, status: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

          </div>

          {permissions.canManage ? (
            <div className="grid gap-4 md:grid-cols-2">
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
                <label className="mb-2 block text-sm font-medium text-slate-700">Due date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
                />
              </div>
            </div>
          ) : null}

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
              {isPending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setError("")
                setFormData({
                  title: task.title,
                  description: task.description ?? "",
                  status: task.status,
                  dueDate: toDateInput(task.dueDate),
                  assignedToId: task.assignedTo?.id ?? "",
                })
              }}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
