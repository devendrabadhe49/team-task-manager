import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { canManageProject, taskScope } from "@/lib/access"
import { validateTaskCreateInput } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = request.nextUrl.searchParams.get("projectId")
    const filters: Prisma.TaskWhereInput[] = [taskScope(session)]

    if (projectId) {
      filters.push({ projectId })
    }

    const tasks = await prisma.task.findMany({
      where: {
        AND: filters,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [
        { dueDate: "asc" },
        { updatedAt: "desc" },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Unable to load tasks right now." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = validateTaskCreateInput(await request.json())
    if ("error" in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: payload.data.projectId },
      include: {
        members: { select: { id: true } },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (!canManageProject(session, project)) {
      return NextResponse.json({ error: "Only project managers can create tasks." }, { status: 403 })
    }

    if (payload.data.assignedToId) {
      const allowedAssigneeIds = new Set([
        project.ownerId,
        ...project.members.map((member) => member.id),
      ])

      if (!allowedAssigneeIds.has(payload.data.assignedToId)) {
        return NextResponse.json(
          { error: "Tasks can only be assigned to the project owner or team members." },
          { status: 400 }
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        title: payload.data.title,
        description: payload.data.description,
        status: payload.data.status,
        assignedToId: payload.data.assignedToId,
        projectId: payload.data.projectId,
        dueDate: payload.data.dueDate,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Unable to create task right now." }, { status: 500 })
  }
}
