import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: Context) {
  try {
    const params = await context.params;
    const setId = params.id;
    if (!setId) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

    const user: any = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = typeof user === "string" ? user : user.id;

    // Lấy set gốc
    const results = (await query(
      "SELECT * FROM flashcard_sets WHERE id = ?",
      [setId]
    )) as any[];
    if (!results || results.length === 0)
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    const set = results[0];

    // Copy set vào DB (bỏ user_email, set mới là private)
    const insertSet: any = await query(
      "INSERT INTO flashcard_sets (title, description, subject, user_id, is_public, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
      [set.title, set.description, set.subject, userId]
    );
    const newSetId = insertSet.insertId;

    // Copy flashcards
    const cards = (await query("SELECT * FROM flashcards WHERE set_id = ?", [setId])) as any[];
    for (const card of cards) {
      await query(
        "INSERT INTO flashcards (set_id, front, back, romaji) VALUES (?, ?, ?, ?)",
        [newSetId, card.front, card.back, card.romaji]
      );
    }

    return NextResponse.json({ newSetId });
  } catch (error) {
    console.error("[POST /api/library/:id/copy] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
