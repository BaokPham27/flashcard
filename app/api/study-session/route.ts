import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuid } from "uuid"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { setId, cardsStudied, testScore } = await req.json()

    // Calculate XP earned
    let xpEarned = cardsStudied * 10
    if (testScore) {
      xpEarned += Math.round(testScore * 50)
    }

    // Create study session record
    const sessionId = uuid()
    await query(
      "INSERT INTO study_sessions (id, user_id, set_id, cards_studied, correct_answers, xp_earned, mode) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        sessionId,
        userId,
        setId,
        cardsStudied,
        testScore ? Math.round(testScore * cardsStudied) : 0,
        xpEarned,
        testScore ? "test" : "study",
      ],
    )

    // Get existing user stats
    const statsResults = (await query("SELECT * FROM user_stats WHERE user_id = ?", [userId])) as any[]
    const existingStats = statsResults.length > 0 ? statsResults[0] : null

    const today = new Date().toISOString().split("T")[0]
    const lastStudyDate = existingStats?.last_studied_at
      ? new Date(existingStats.last_studied_at).toISOString().split("T")[0]
      : null

    let streakUpdate = existingStats?.current_streak || 0

    // Update streak logic
    if (lastStudyDate === today) {
      streakUpdate = existingStats?.current_streak || 1
    } else if (lastStudyDate) {
      const lastDate = new Date(lastStudyDate)
      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)

      if (lastDate.toISOString().split("T")[0] === yesterdayDate.toISOString().split("T")[0]) {
        streakUpdate = (existingStats?.current_streak || 0) + 1
      } else {
        streakUpdate = 1
      }
    } else {
      streakUpdate = 1
    }

    const longestStreak = Math.max(streakUpdate, existingStats?.longest_streak || 1)

    if (existingStats) {
      // Update existing stats
      await query(
        "UPDATE user_stats SET cards_studied = ?, xp_points = ?, current_streak = ?, longest_streak = ?, last_studied_at = NOW() WHERE user_id = ?",
        [
          (existingStats.cards_studied || 0) + cardsStudied,
          (existingStats.xp_points || 0) + xpEarned,
          streakUpdate,
          longestStreak,
          userId,
        ],
      )
    } else {
      // Create new stats
      const statsId = uuid()
      await query(
        "INSERT INTO user_stats (id, user_id, cards_studied, xp_points, current_streak, longest_streak, last_studied_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [statsId, userId, cardsStudied, xpEarned, 1, 1],
      )
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      streak: streakUpdate,
      sessionId,
    })
  } catch (error) {
    console.error("[v0] Study session error:", error)
    return NextResponse.json({ error: "Failed to track session" }, { status: 500 })
  }
}
