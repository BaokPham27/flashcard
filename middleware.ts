export const runtime = "nodejs"; // ⚡ Chạy middleware bằng Node.js runtime

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const pathname = request.nextUrl.pathname

  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/sign-up") ||
    pathname === "/"

  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  // 1️⃣ Nếu là trang dashboard nhưng không có token → chuyển hướng login
  if (isDashboard && !token) {
    console.warn("Không có token → redirect login")
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // 2️⃣ Nếu có token → kiểm tra token hợp lệ
  if (token) {
    const cleanToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token
    let decoded = null

    try {
      decoded = await verifyToken(cleanToken)
    } catch (err) {
      console.error("JWT verify failed:", err)
    }

    // Nếu token sai hoặc hết hạn → redirect về login
    if (!decoded && isDashboard) {
      console.warn("Token invalid hoặc expired → redirect login")
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Nếu đã login mà cố vào trang auth → chuyển qua dashboard
    if (decoded && isAuthPage) {
      console.log("Đã login, chuyển hướng sang dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // 3️⃣ Cho phép đi tiếp
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
