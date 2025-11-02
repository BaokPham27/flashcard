"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PublicSet {
  id: string
  title: string
  description: string
  subject: string
  user_id: string
  user_email?: string
  created_at: string
  is_public: boolean
  card_count?: number
}

export default function LibraryPage() {
  const [sets, setSets] = useState<PublicSet[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [copying, setCopying] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadPublicSets()
  }, [filter, search])

  const loadPublicSets = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (filter !== "all") query.append("subject", filter)
      if (search) query.append("search", search)

      const res = await fetch(`/api/library?${query}`)
      const data = await res.json()

      setSets(data.sets || [])
    } catch (error) {
      console.error("Error loading library:", error)
    } finally {
      setLoading(false)
    }
  }

  const copySetToLibrary = async (set: PublicSet) => {
    setCopying(set.id)
    try {
      const res = await fetch(`/api/library/${set.id}/copy`, { method: "POST" })

      if (!res.ok) {
        throw new Error("Failed to copy set")
      }

      const data = await res.json()
      router.push(`/dashboard/sets/${data.newSetId}`)
    } catch (error) {
      console.error("Error copying set:", error)
      alert("Failed to copy set. Please try again.")
    } finally {
      setCopying(null)
    }
  }

  const subjects = ["all", "Languages", "Science", "History", "Math", "General"]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Public Library</h1>
              <p className="text-muted-foreground mt-1">Browse and copy flashcard sets from the community</p>
            </div>
            <Link href="/dashboard" className="text-primary hover:underline">
              ← Dashboard
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="space-y-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sets by title or description..."
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setFilter(subject)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    filter === subject
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No sets found matching your search</p>
            <button
              onClick={() => {
                setSearch("")
                setFilter("all")
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sets.map((set) => (
              <div
                key={set.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition flex flex-col"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{set.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{set.description}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="bg-secondary px-2 py-1 rounded">{set.subject || "General"}</span>
                    <span>{set.card_count} cards</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    By {set.user_email?.split("@")[0] || "Anonymous"}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <button
                    onClick={() => copySetToLibrary(set)}
                    disabled={copying === set.id}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {copying === set.id ? "Copying..." : "Copy to My Sets"}
                  </button>

                  <Link
                    href={`/library/${set.id}`}
                    className="block text-center text-sm text-primary hover:underline py-1"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
