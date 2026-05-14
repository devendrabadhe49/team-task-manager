"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push("/dashboard")
    } else {
      setError("Invalid email or password.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel hidden rounded-[2rem] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="section-label mb-4">Team Task Manager</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-900">
              Run projects, assign work, and keep delivery visible.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Admins manage projects and team access. Members update their work, track deadlines,
              and stay aligned from one dashboard.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Role based</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Admin / Member</p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Task flow</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">To do to done</p>
            </div>
            <div className="soft-panel rounded-3xl p-5">
              <p className="text-sm font-medium text-slate-500">Deployment</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Railway ready</p>
            </div>
          </div>
        </section>

        <section className="glass-panel flex items-center rounded-[2rem] p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="w-full">
            <p className="section-label mb-3">Welcome back</p>
            <h2 className="text-3xl font-semibold text-slate-900">Sign in to your workspace</h2>
            <p className="mt-3 text-slate-600">
              Use your email and password to open the dashboard.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-8 space-y-4">
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
                  placeholder="Enter your password"
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
              {loading ? "Signing in..." : "Login"}
            </button>

            <p className="mt-5 text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-teal-700 hover:text-teal-800">
                Create one
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
