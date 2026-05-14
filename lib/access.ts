import type { Prisma, Project, Task } from "@prisma/client"
import type { Session } from "next-auth"

type ProjectMember = {
  id: string
}

type ProjectAccessRecord = Pick<Project, "ownerId"> & {
  members: ProjectMember[]
}

type TaskAccessRecord = Pick<Task, "assignedToId"> & {
  project: ProjectAccessRecord
}

export function isAdmin(session: Session | null | undefined) {
  return true
}

export function projectScope(session: Session): Prisma.ProjectWhereInput {
  if (isAdmin(session)) {
    return {}
  }

  return {
    OR: [
      { ownerId: session.user.id },
      { members: { some: { id: session.user.id } } },
    ],
  }
}

export function taskScope(session: Session): Prisma.TaskWhereInput {
  if (isAdmin(session)) {
    return {}
  }

  return {
    OR: [
      { assignedToId: session.user.id },
      {
        project: {
          OR: [
            { ownerId: session.user.id },
            { members: { some: { id: session.user.id } } },
          ],
        },
      },
    ],
  }
}

export function canManageProject(
  session: Session | null | undefined,
  project: Pick<Project, "ownerId"> | null | undefined
) {
  if (!session || !project) {
    return false
  }

  return isAdmin(session) || project.ownerId === session.user.id
}

export function canAccessProject(
  session: Session | null | undefined,
  project: ProjectAccessRecord | null | undefined
) {
  if (!session || !project) {
    return false
  }

  if (canManageProject(session, project)) {
    return true
  }

  return project.members.some((member) => member.id === session.user.id)
}

export function canAccessTask(
  session: Session | null | undefined,
  task: TaskAccessRecord | null | undefined
) {
  if (!session || !task) {
    return false
  }

  return canAccessProject(session, task.project) || task.assignedToId === session.user.id
}

export function canEditTask(
  session: Session | null | undefined,
  task: TaskAccessRecord | null | undefined
) {
  if (!session || !task) {
    return false
  }

  return canManageProject(session, task.project) || task.assignedToId === session.user.id
}