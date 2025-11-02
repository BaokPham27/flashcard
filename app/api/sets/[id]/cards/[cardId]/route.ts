import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string; cardId: string }> }) {
  try {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // ✅ await params trước khi dùng
    const { id, cardId } = await context.params

    const { front, back, romaji } = await req.json()

    const setCheck = (await query("SELECT user_id FROM flashcard_sets WHERE id = ?", [id])) as any[]
    if (setCheck.length === 0 || setCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await query("UPDATE flashcards SET front = ?, back = ?, romaji = ? WHERE id = ? AND set_id = ?", [
      front,
      back,
      romaji || null,
      cardId,
      id,
    ])

    const results = (await query("SELECT * FROM flashcards WHERE id = ?", [cardId])) as any[]
    return NextResponse.json(results[0])
  } catch (error) {
    console.error("[v0] Update card error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; cardId: string }> }) {
  try {
    const userId = await getCurrentUser()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // ✅ await params ở đây luôn
    const { id, cardId } = await context.params

    const setCheck = (await query("SELECT user_id FROM flashcard_sets WHERE id = ?", [id])) as any[]
    if (setCheck.length === 0 || setCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await query("DELETE FROM flashcards WHERE id = ? AND set_id = ?", [cardId, id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete card error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
