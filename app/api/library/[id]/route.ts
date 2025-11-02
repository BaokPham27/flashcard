import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const params = await context.params;
    const setId = params.id;
    if (!setId) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

    // Lấy set public + email tác giả
    const results = (await query(
      `SELECT s.id, s.title, s.description, s.subject, s.user_id, s.created_at, s.is_public,
              u.email AS user_email
       FROM flashcard_sets s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? AND s.is_public = 1`,
      [setId]
    )) as any[];

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }
    const set = results[0];

    // Lấy tất cả flashcards của set
    const cards = (await query(
      "SELECT id, front, back, romaji FROM flashcards WHERE set_id = ?",
      [setId]
    )) as any[];

    return NextResponse.json({ set, cards });
  } catch (error) {
    console.error("[GET /api/library/:id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
