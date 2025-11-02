import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuid } from "uuid"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/hash"
import { createToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password, username } = await req.json()

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Email, password, and username required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const existingUser = (await query("SELECT id FROM users WHERE email = ? OR username = ?", [
      email,
      username,
    ])) as any[]

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 400 })
    }

    const userId = uuid()
    const passwordHash = hashPassword(password)

    await query("INSERT INTO users (id, email, password_hash, username, role) VALUES (?, ?, ?, ?, ?)", [
      userId,
      email,
      passwordHash,
      username,
      "student",
    ])

    await query("INSERT INTO user_stats (id, user_id) VALUES (?, ?)", [uuid(), userId])

    const token = await createToken(userId)

    const response = NextResponse.json({ success: true, userId })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("[v0] Sign up error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
