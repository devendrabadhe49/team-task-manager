import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canManageProject } from "@/lib/access"
import { validateProjectMembersInput } from "@/lib/validation"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: { select: { id: true } },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (!canManageProject(session, project)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const payload = validateProjectMembersInput(await request.json())
    if ("error" in payload) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    const memberIds = payload.data.memberIds.filter((memberId) => memberId !== project.ownerId)

    if (memberIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
      })

      if (users.length !== memberIds.length) {
        return NextResponse.json({ error: "One or more selected members do not exist." }, { status: 400 })
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        members: {
          set: memberIds.map((memberId) => ({ id: memberId })),
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error("Error updating project members:", error)
    return NextResponse.json({ error: "Unable to update the project team right now." }, { status: 500 })
  }
}
