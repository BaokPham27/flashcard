import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

// helper type để unwrap params
interface Context {
  params: { id: string } | Promise<{ id: string }>;
}

// GET all cards
export async function GET(req: NextRequest, context: Context) {
  try {
    const params = await context.params; // unwrap params
    const setId = params.id;
    if (!setId) return NextResponse.json({ error: "Missing set ID" }, { status: 400 });

    const user: any = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = typeof user === "string" ? user : user.id;

    // kiểm tra quyền sở hữu set
    const setCheck = (await query("SELECT user_id FROM flashcard_sets WHERE id = ?", [setId])) as any[];
    if (setCheck.length === 0 || setCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = (await query(
      "SELECT * FROM flashcards WHERE set_id = ? ORDER BY created_at ASC",
      [setId]
    )) as any[];

    return NextResponse.json(results);
  } catch (error) {
    console.error("[GET /api/sets/:id/cards] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST add card
export async function POST(req: NextRequest, context: Context) {
  try {
    const params = await context.params; // unwrap params
    const setId = params.id;
    if (!setId) return NextResponse.json({ error: "Missing set ID" }, { status: 400 });

    const user: any = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = typeof user === "string" ? user : user.id;

    const { front, back, romaji } = await req.json();
    if (!front || !back) return NextResponse.json({ error: "Missing card fields" }, { status: 400 });

    // kiểm tra quyền sở hữu set
    const setCheck = (await query("SELECT user_id FROM flashcard_sets WHERE id = ?", [setId])) as any[];
    if (setCheck.length === 0 || setCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cardId = uuid();
    await query(
      "INSERT INTO flashcards (id, set_id, front, back, romaji) VALUES (?, ?, ?, ?, ?)",
      [cardId, setId, front, back, romaji || null]
    );

    const results = (await query("SELECT * FROM flashcards WHERE id = ?", [cardId])) as any[];
    return NextResponse.json(results[0], { status: 201 });
  } catch (error) {
    console.error("[POST /api/sets/:id/cards] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
