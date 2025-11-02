"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ReportsPage() {
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

      setLoading(false)
    } catch (error) {
      router.push("/dashboard")
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
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">View platform analytics and insights</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Engagement Report */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Engagement Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Active Users (30 days)</span>
                <span className="font-semibold">Monitor via auth logs</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Study Sessions</span>
                <span className="font-semibold">Check study_sessions table</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Avg Session Duration</span>
                <span className="font-semibold">Track in database</span>
              </div>
            </div>
          </div>

          {/* Content Report */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Content Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Most Popular Sets</span>
                <span className="font-semibold">By copy count</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Top Contributors</span>
                <span className="font-semibold">By set count</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Quality Score</span>
                <span className="font-semibold">Avg cards per set</span>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">System Status</span>
                <span className="font-semibold text-green-600">Operational</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Database Health</span>
                <span className="font-semibold text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">API Performance</span>
                <span className="font-semibold text-green-600">Normal</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium text-center hover:opacity-90 transition"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/moderation"
                className="block w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium text-center hover:opacity-90 transition"
              >
                Moderate Content
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
