import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Lấy tất cả flashcard_sets kèm email tác giả
    const sql = `
      SELECT s.id, s.title, s.description, s.subject, s.user_id, s.created_at, s.is_public,
             u.email AS user_email
      FROM flashcard_sets s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `;

    const sets = (await query(sql)) as any[];

    console.log("[GET /api/library] sets from DB:", sets);

    return NextResponse.json(sets);
  } catch (error) {
    console.error("[GET /api/library] error:", error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
