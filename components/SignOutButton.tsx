"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
    >
      Sign Out
    </button>
  )
}