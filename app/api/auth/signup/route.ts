
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validateSignupInput } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationError = validateSignupInput(body)

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      )
    }

    const { name, email, password } = body

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const userCount = await prisma.user.count()

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userCount === 0 ? "ADMIN" : "MEMBER",
      },
    })

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating account:", error)

    return NextResponse.json(
      { error: "Unable to create account right now." },
      { status: 500 }
    )
  }
}