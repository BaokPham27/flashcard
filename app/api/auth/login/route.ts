import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyPassword } from "@/lib/hash"
import { createToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const results = (await query("SELECT * FROM users WHERE email = ?", [email])) as any[]

    if (results.length === 0 || !verifyPassword(password, results[0].password_hash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const user = results[0]
    const token = await createToken(user.id)

    const response = NextResponse.json({ success: true, userId: user.id })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
