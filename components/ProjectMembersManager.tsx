"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type UserOption = {
  id: string
  name: string
  email: string
  role: string
}

type ProjectMembersManagerProps = {
  projectId: string
  users: UserOption[]
  initialMemberIds: string[]
}

export default function ProjectMembersManager({
  projectId,
  users,
  initialMemberIds,
}: ProjectMembersManagerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedMemberIds, setSelectedMemberIds] = useState(initialMemberIds)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    )
  }

  const handleSave = () => {
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberIds: selectedMemberIds }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Unable to update project members.")
          return
        }

        setSelectedMemberIds(data.members.map((member: UserOption) => member.id))
        setSuccess("Team members updated.")
        router.refresh()
      } catch (saveError) {
        console.error(saveError)
        setError("Something went wrong while updating the team.")
      }
    })
  }

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-label mb-2">Team management</p>
          <h2 className="text-2xl font-semibold text-slate-900">Project members</h2>
          <p className="mt-2 text-sm text-slate-600">
            Add or remove collaborators who can view tasks and receive assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save team"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
            No additional users are available yet.
          </div>
        ) : (
          users.map((user) => (
            <label
              key={user.id}
              className="flex cursor-pointer items-start gap-3 rounded-3xl border border-slate-200 bg-white/70 px-4 py-4 transition hover:border-teal-200"
            >
              <input
                type="checkbox"
                checked={selectedMemberIds.includes(user.id)}
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

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}
    </div>
  )
}
