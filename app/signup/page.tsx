"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    if (response.ok) {
      await signIn("credentials", { email, password, redirect: false })
      router.push("/dashboard")
    } else {
      const data = await response.json()
      setError(data.error || "Unable to create account.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <p className="section-label mb-3">Get started</p>
          <h1 className="text-4xl font-semibold text-slate-900">Create your workspace account</h1>
          <p className="mt-4 max-w-xl text-slate-600">
            The first account created becomes the admin. Every account after that joins as a member.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Admin abilities</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Create projects, manage teams, assign work
              </p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Member abilities</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Track assigned tasks and update status
              </p>
            </div>
          </div>
        </section>

        <section className="glass-panel flex items-center rounded-[2rem] p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="w-full">
            <p className="section-label mb-3">Account details</p>
            <h2 className="text-3xl font-semibold text-slate-900">Sign up</h2>
            <p className="mt-3 text-slate-600">
              We&apos;ll sign you in right away after your account is created.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  placeholder="Jane Cooper"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  placeholder="jane@teamflow.dev"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 outline-none transition focus:border-teal-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-teal-700 px-4 py-3 font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="mt-5 text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-teal-700 hover:text-teal-800">
                Log in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
