type PlainObject = Record<string, unknown>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TASK_STATUS_VALUES = ["TODO", "IN_PROGRESS", "DONE"]

function asObject(input: unknown): PlainObject | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null
  }

  return input as PlainObject
}

export function validateSignupInput(input: unknown) {
  const data = asObject(input)

  if (!data) {
    return "Invalid request body"
  }

  const name = String(data.name ?? "").trim()
  const email = String(data.email ?? "").trim()
  const password = String(data.password ?? "").trim()

  if (!name) {
    return "Name is required"
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Valid email is required"
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters"
  }

  return null
}

export function validateTaskInput(input: unknown) {
  const data = asObject(input)

  if (!data) {
    return "Invalid request body"
  }

  const title = String(data.title ?? "").trim()
  const status = String(data.status ?? "TODO")

  if (!title) {
    return "Task title is required"
  }

  if (!TASK_STATUS_VALUES.includes(status)) {
    return "Invalid task status"
  }

  return null
}

export function validateProjectCreateInput(input: unknown) {
  const data = asObject(input)

  if (!data) {
    return { error: "Invalid request body" }
  }

  const name = String(data.name ?? "").trim()
  const description = String(data.description ?? "").trim()

  const memberIds = Array.isArray(data.memberIds)
    ? data.memberIds.map(String)
    : []

  if (!name) {
    return { error: "Project name is required" }
  }

  return {
    data: {
      name,
      description,
      memberIds,
    },
  }
}

export function validateProjectMembersInput(input: unknown) {
  const data = asObject(input)

  if (!data) {
    return { error: "Invalid request body" }
  }

  const memberIds = Array.isArray(data.memberIds)
    ? data.memberIds.map(String)
    : []

  return {
    data: {
      memberIds,
    },
  }
}

export function validateTaskCreateInput(input: unknown) {
  const data = asObject(input)

  if (!data) {
    return { error: "Invalid request body" }
  }

  const title = String(data.title ?? "").trim()

  if (!title) {
    return { error: "Task title is required" }
  }

  return {
    data: {
      title,
      description: String(data.description ?? ""),
      status: String(data.status ?? "TODO"),
      assignedToId: data.assignedToId
        ? String(data.assignedToId)
        : null,
      projectId: String(data.projectId ?? ""),
    },
  }
}

export function validateTaskUpdateInput(input: unknown) {
  const data = asObject(input)

  if (!data) {
    return { error: "Invalid request body" }
  }

  return {
    data: {
      title: data.title
        ? String(data.title)
        : undefined,

      description: data.description
        ? String(data.description)
        : undefined,

      status: data.status
        ? String(data.status)
        : undefined,

      assignedToId: data.assignedToId
        ? String(data.assignedToId)
        : undefined,
    },
  }
}

export function validateTaskStatusUpdateInput(
  input: unknown
) {
  const data = asObject(input)

  if (!data) {
    return { error: "Invalid request body" }
  }

  const status = String(data.status ?? "")

  if (!TASK_STATUS_VALUES.includes(status)) {
    return { error: "Invalid task status" }
  }

  return {
    data: {
      status,
    },
  }
}

export function validateProjectUpdateInput(
  input: unknown
) {
  const data = asObject(input)

  if (!data) {
    return { error: "Invalid request body" }
  }

  return {
    data: {
      name: data.name
        ? String(data.name)
        : undefined,

      description: data.description
        ? String(data.description)
        : undefined,
    },
  }
}