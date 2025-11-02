"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PublicSet {
  id: string
  title: string
  description: string
  user_email: string
  created_at: string
  is_public: boolean
}

export default function ModerationPage() {
  const [publicSets, setPublicSets] = useState<PublicSet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const meRes = await fetch("/api/auth/me")
      if (!meRes.ok) {
        router.push("/auth/login")
        return
      }

      const adminRes = await fetch("/api/admin/check")
      if (!adminRes.ok) {
        router.push("/dashboard")
        return
      }

      await loadPublicSets()
    } catch (error) {
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadPublicSets = async () => {
    try {
      const res = await fetch("/api/admin/moderation")
      const data = await res.json()

      setPublicSets(data.sets || [])
    } catch (error) {
      console.error("Error loading sets:", error)
    }
  }

  const removeFromPublic = async (setId: string) => {
    if (!confirm("Remove this set from public library?")) return

    try {
      const res = await fetch(`/api/admin/moderation/${setId}/unpublish`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to remove set")

      setPublicSets(publicSets.filter((s) => s.id !== setId))
      alert("Set removed from public library")
    } catch (error) {
      console.error("Error removing set:", error)
      alert("Failed to remove set")
    }
  }

  const deleteSet = async (setId: string) => {
    if (!confirm("Permanently delete this set and all its cards?")) return

    try {
      const res = await fetch(`/api/admin/moderation/${setId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete set")

      setPublicSets(publicSets.filter((s) => s.id !== setId))
      alert("Set deleted permanently")
    } catch (error) {
      console.error("Error deleting set:", error)
      alert("Failed to delete set")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/admin" className="text-primary hover:underline mb-2 inline-block">
              ← Admin Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Moderation</h1>
            <p className="text-muted-foreground mt-1">Review and manage public content</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-secondary/30 border border-secondary/20 rounded-lg p-4 mb-8">
          <p className="text-sm">
            <span className="font-semibold">Total Public Sets:</span> {publicSets.length}
          </p>
        </div>

        <div className="space-y-4">
          {publicSets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No public sets to moderate</p>
            </div>
          ) : (
            publicSets.map((set) => (
              <div
                key={set.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{set.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{set.description}</p>
                    <p className="text-xs text-muted-foreground">
                      By {set.user_email?.split("@")[0]} • Created {new Date(set.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => removeFromPublic(set.id)}
                    className="text-sm text-accent hover:text-accent/80 font-medium transition"
                  >
                    Remove from Public
                  </button>
                  <button
                    onClick={() => deleteSet(set.id)}
                    className="text-sm text-destructive hover:text-destructive/80 font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
