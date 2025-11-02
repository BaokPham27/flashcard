"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="animate-pulse text-center">
        <h1 className="text-3xl font-bold text-primary">Flashcard Pro</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  )
}
