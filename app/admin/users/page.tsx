"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface User {
  id: string
  email: string
  created_at: string
  stats?: {
    total_cards_studied: number
    xp_points: number
    current_streak: number
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadUsers()
    }
  }, [search])

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

      await loadUsers()
    } catch (error) {
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const query = new URLSearchParams()
      if (search) query.append("search", search)

      const res = await fetch(`/api/admin/users?${query}`)
      const data = await res.json()

      setUsers(data.users || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const deactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user? This action cannot be undone.")) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to deactivate user")

      setUsers(users.filter((u) => u.id !== userId))
      alert("User deactivated successfully")
    } catch (error) {
      console.error("Error deactivating user:", error)
      alert("Failed to deactivate user")
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
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by email..."
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold">Email</th>
                  <th className="text-left py-4 px-6 font-semibold">Cards Studied</th>
                  <th className="text-left py-4 px-6 font-semibold">XP Points</th>
                  <th className="text-left py-4 px-6 font-semibold">Streak</th>
                  <th className="text-left py-4 px-6 font-semibold">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">{user.stats?.total_cards_studied || 0}</td>
                    <td className="py-4 px-6">{user.stats?.xp_points || 0}</td>
                    <td className="py-4 px-6">{user.stats?.current_streak || 0} days</td>
                    <td className="py-4 px-6 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => deactivateUser(user.id)}
                        className="text-xs text-destructive hover:text-destructive/80 font-medium transition"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </main>
    </div>
  )
}
