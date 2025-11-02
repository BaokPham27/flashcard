import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUser()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results = (await query("SELECT id, email, username, role FROM users WHERE id = ?", [userId])) as any[]

    if (results.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("[v0] Auth me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
