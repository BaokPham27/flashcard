import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const results = (await query("SELECT * FROM user_stats WHERE user_id = ?", [userId])) as any[]

    if (results.length === 0) {
      return NextResponse.json({
        xp_points: 0,
        cards_studied: 0,
        current_streak: 0,
        longest_streak: 0,
      })
    }

    return NextResponse.json(results[0])
  } catch (error) {
    console.error("[v0] Stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
