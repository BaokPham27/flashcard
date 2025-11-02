import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

// 🟢 GET: Lấy thông tin chi tiết 1 flashcard set
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const results = (await query(
      `SELECT s.id, s.title, s.description, s.subject, s.user_id, s.created_at, s.is_public, u.email AS user_email
       FROM flashcard_sets s 
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
    )) as any[];

    if (results.length === 0) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    return NextResponse.json(results[0]);
  } catch (error) {
    console.error("[GET /api/sets/:id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🟡 PUT: Cập nhật thông tin flashcard set
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const { title, description, subject, is_public } = await req.json();

    // Kiểm tra quyền sở hữu
    const setCheck = (await query("SELECT user_id FROM flashcard_sets WHERE id = ?", [id])) as any[];
    if (setCheck.length === 0) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }
    if (setCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Cập nhật dữ liệu
    await query(
      "UPDATE flashcard_sets SET title = ?, description = ?, subject = ?, is_public = ? WHERE id = ?",
      [title, description, subject, is_public, id]
    );

    const updated = (await query("SELECT * FROM flashcard_sets WHERE id = ?", [id])) as any[];
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("[PUT /api/sets/:id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔴 DELETE: Xóa 1 flashcard set
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getCurrentUser();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    // Kiểm tra quyền sở hữu
    const setCheck = (await query("SELECT user_id FROM flashcard_sets WHERE id = ?", [id])) as any[];
    if (setCheck.length === 0) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }
    if (setCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await query("DELETE FROM flashcard_sets WHERE id = ?", [id]);
    return NextResponse.json({ message: "Set deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/sets/:id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
