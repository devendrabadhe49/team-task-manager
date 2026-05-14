"use client"

import { useEffect, useState } from "react"

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
    projectId: "",
    status: "TODO",
  })

  async function fetchData() {
    try {
      const tasksRes = await fetch("/api/tasks")
      const tasksData = await tasksRes.json()

      if (Array.isArray(tasksData)) {
        setTasks(tasksData)
      } else {
        setTasks([])
      }

      const usersRes = await fetch("/api/users")
      const usersData = await usersRes.json()

      if (Array.isArray(usersData)) {
        setUsers(usersData)
      } else {
        setUsers([])
      }

      const projectsRes = await fetch("/api/projects")
      const projectsData = await projectsRes.json()

      if (Array.isArray(projectsData)) {
        setProjects(projectsData)
      } else {
        setProjects([])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function createTask(e: any) {
    e.preventDefault()

    await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    })

    setForm({
      title: "",
      description: "",
      assignedToId: "",
      projectId: "",
      status: "TODO",
    })

    fetchData()
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    fetchData()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Tasks
      </h1>

      <form
        onSubmit={createTask}
        className="bg-white p-4 rounded shadow mb-6"
      >
        <input
          className="border p-2 w-full mb-3"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <select
          className="border p-2 w-full mb-3"
          value={form.assignedToId}
          onChange={(e) =>
            setForm({
              ...form,
              assignedToId: e.target.value,
            })
          }
        >
          <option value="">
            Assign User
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 w-full mb-3"
          value={form.projectId}
          onChange={(e) =>
            setForm({
              ...form,
              projectId: e.target.value,
            })
          }
        >
          <option value="">
            Select Project
          </option>

          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
            >
              {project.name}
            </option>
          ))}
        </select>

        <button className="bg-black text-white px-4 py-2 rounded">
          Create Task
        </button>
      </form>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-4 rounded shadow"
          >
            <h2 className="text-xl font-bold">
              {task.title}
            </h2>

            <p>{task.description}</p>

            <select
              value={task.status || "TODO"}
              onChange={(e) =>
                updateStatus(
                  task.id,
                  e.target.value
                )
              }
              className="border p-2 mt-3"
            >
              <option value="TODO">
                TODO
              </option>

              <option value="IN_PROGRESS">
                IN PROGRESS
              </option>

              <option value="DONE">
                DONE
              </option>
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}