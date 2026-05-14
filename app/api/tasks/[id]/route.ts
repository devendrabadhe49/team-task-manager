import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { canAccessTask, canManageProject } from "@/lib/access"
import { validateTaskStatusUpdateInput, validateTaskUpdateInput } from "@/lib/validation"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            members: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (!canAccessTask(session, task)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      ...task,
      permissions: {
        canManage: canManageProject(session, task.project),
      },
    })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: { select: { id: true } },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const canManage = canManageProject(session, task.project)
    const isAssignee = task.assignedToId === session.user.id

    if (!canManage && !isAssignee) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const requestBody = await request.json()

    if (!canManage) {
      const memberPayload = validateTaskStatusUpdateInput(requestBody)
      if ("error" in memberPayload) {
        return NextResponse.json({ error: memberPayload.error }, { status: 400 })
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          status: memberPayload.data.status,
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
      })

      return NextResponse.json(updatedTask)
    }

    const body = validateTaskUpdateInput(requestBody)
    if ("error" in body) {
      return NextResponse.json({ error: body.error }, { status: 400 })
    }

    if (body.data.assignedToId) {
      const allowedAssigneeIds = new Set([
        task.project.ownerId,
        ...task.project.members.map((member) => member.id),
      ])

      if (!allowedAssigneeIds.has(body.data.assignedToId)) {
        return NextResponse.json(
          { error: "Tasks can only be assigned to the project owner or team members." },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: body.data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (!canManageProject(session, task.project)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
