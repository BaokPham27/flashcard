"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AdminStats {
  total_users: number
  total_sets: number
  total_cards: number
  public_sets: number
  avg_xp_per_user: number
}

interface RecentSet {
  id: string
  title: string
  user_email: string
  created_at: string
  is_public: boolean
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentSets, setRecentSets] = useState<RecentSet[]>([])
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

      setIsAdmin(true)
      await loadAdminStats()
    } catch (error) {
      console.error("Error checking admin access:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      const data = await res.json()

      setStats(data.stats)
      setRecentSets(data.recentSets || [])
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-primary hover:underline">
              Back to App
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-muted hover:bg-accent text-foreground rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Admin Navigation */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <Link href="/admin">
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 cursor-pointer hover:bg-primary/20 transition text-center">
              <p className="font-semibold text-primary">Dashboard</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition text-center">
              <p className="font-semibold">User Management</p>
            </div>
          </Link>
          <Link href="/admin/moderation">
            <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition text-center">
              <p className="font-semibold">Moderation</p>
            </div>
          </Link>
          <Link href="/admin/reports">
            <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition text-center">
              <p className="font-semibold">Reports</p>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-primary">{stats?.total_users || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Flashcard Sets</p>
            <p className="text-3xl font-bold text-accent">{stats?.total_sets || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Cards</p>
            <p className="text-3xl font-bold text-primary">{stats?.total_cards || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Public Sets</p>
            <p className="text-3xl font-bold text-accent">{stats?.public_sets || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Avg User XP</p>
            <p className="text-3xl font-bold text-primary">{stats?.avg_xp_per_user || 0}</p>
          </div>
        </div>

        {/* Recent Sets */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Flashcard Sets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Title</th>
                  <th className="text-left py-3 px-4 font-semibold">Creator</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentSets.map((set) => (
                  <tr key={set.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="py-3 px-4">{set.title}</td>
                    <td className="py-3 px-4 text-muted-foreground">{set.user_email?.split("@")[0]}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          set.is_public ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {set.is_public ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(set.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
