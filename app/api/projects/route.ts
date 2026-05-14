import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isAdmin, projectScope } from "@/lib/access"
import { validateProjectCreateInput } from "@/lib/validation"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: projectScope(session),
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          select: {
            id: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Unable to load projects right now." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Only admins can create projects." }, { status: 403 })
    }

    const payload = validateProjectCreateInput(await request.json())

    if ("error" in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    const memberIds = payload.data.memberIds.filter((id) => id !== session.user.id)

    if (memberIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
      })

      if (users.length !== memberIds.length) {
        return NextResponse.json({ error: "One or more selected members do not exist." }, { status: 400 })
      }
    }

    const project = await prisma.project.create({
      data: {
        name: payload.data.name,
        description: payload.data.description,
        ownerId: session.user.id,
        members: {
          connect: memberIds.map((id) => ({ id })),
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Unable to create project right now." }, { status: 500 })
  }
}
