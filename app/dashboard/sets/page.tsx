"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface FlashcardSet {
  id: string
  title: string
  description: string
  subject: string
  is_public: boolean
  created_at: string
  card_count?: number
}

export default function SetsPage() {
  const [sets, setSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadSets()
  }, [])

  const loadSets = async () => {
    try {
      const response = await fetch("/api/sets")
      if (!response.ok) {
        router.push("/auth/login")
        return
      }

      const data = await response.json()
      setSets(data)
      setLoading(false)
    } catch (error) {
      console.error("Error loading sets:", error)
    }
  }

  const togglePublic = async (set: FlashcardSet) => {
    try {
      const response = await fetch(`/api/sets/${set.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...set, is_public: !set.is_public }),
      })

      if (response.ok) {
        setSets(sets.map((s) => (s.id === set.id ? { ...s, is_public: !s.is_public } : s)))
      }
    } catch (error) {
      console.error("Error toggling public:", error)
    }
  }

  const copyShareLink = (set: FlashcardSet) => {
    const link = `${window.location.origin}/library/${set.id}`
    navigator.clipboard.writeText(link)
    alert("Share link copied to clipboard!")
  }

  const deleteSet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this set?")) return

    try {
      await fetch(`/api/sets/${id}`, { method: "DELETE" })
      setSets(sets.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Error deleting set:", error)
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
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard" className="text-primary hover:underline mb-2 inline-block">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground">My Flashcard Sets</h1>
          </div>
          <Link
            href="/dashboard/sets/create"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
          >
            New Set
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {sets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No flashcard sets yet</p>
            <Link
              href="/dashboard/sets/create"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              Create Your First Set
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => (
              <div
                key={set.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition group"
              >
                <Link href={`/dashboard/sets/${set.id}`} className="block">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition">{set.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{set.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>{set.subject || "General"}</span>
                    <span>{set.card_count || 0} cards</span>
                  </div>
                </Link>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    {set.is_public ? (
                      <button
                        onClick={() => togglePublic(set)}
                        className="flex-1 text-xs bg-primary/20 text-primary px-3 py-1 rounded hover:bg-primary/30 transition"
                      >
                        Public
                      </button>
                    ) : (
                      <button
                        onClick={() => togglePublic(set)}
                        className="flex-1 text-xs bg-muted text-muted-foreground px-3 py-1 rounded hover:bg-muted/80 transition"
                      >
                        Private
                      </button>
                    )}

                    {set.is_public && (
                      <button
                        onClick={() => copyShareLink(set)}
                        className="flex-1 text-xs bg-accent/20 text-accent px-3 py-1 rounded hover:bg-accent/30 transition"
                      >
                        Share
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => deleteSet(set.id)}
                    className="w-full text-xs text-destructive hover:text-destructive/80 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
