import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuid } from "uuid"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const results = (await query("SELECT * FROM flashcard_sets WHERE user_id = ? ORDER BY created_at DESC", [
      userId,
    ])) as any[]

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { title, description, subject, is_public } = await req.json()
    const id = uuid()

    await query(
      "INSERT INTO flashcard_sets (id, user_id, title, description, subject, is_public) VALUES (?, ?, ?, ?, ?, ?)",
      [id, userId, title, description, subject, is_public || false],
    )

    const results = (await query("SELECT * FROM flashcard_sets WHERE id = ?", [id])) as any[]
    return NextResponse.json(results[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
