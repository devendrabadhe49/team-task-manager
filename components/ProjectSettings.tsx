"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type ProjectSettingsProps = {
  projectId: string
  initialName: string
  initialDescription: string | null
}

export default function ProjectSettings({
  projectId,
  initialName,
  initialDescription,
}: ProjectSettingsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription ?? "")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Unable to update project.")
          return
        }

        setName(data.name)
        setDescription(data.description ?? "")
        setSuccess("Project details updated.")
        router.refresh()
      } catch (updateError) {
        console.error(updateError)
        setError("Something went wrong while saving.")
      }
    })
  }

  const handleDelete = () => {
    setError("")
    setSuccess("")

    if (!window.confirm("Delete this project and all of its tasks?")) {
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Unable to delete project.")
          return
        }

        router.push("/projects")
        router.refresh()
      } catch (deleteError) {
        console.error(deleteError)
        setError("Something went wrong while deleting the project.")
      }
    })
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <p className="section-label mb-2">Project settings</p>
      <h2 className="text-2xl font-semibold text-slate-900">Manage project</h2>

      <form onSubmit={handleSave} className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Project name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
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
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full border border-rose-200 bg-white px-5 py-3 font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
          >
            Delete project
          </button>
        </div>
      </form>
    </div>
  )
}
