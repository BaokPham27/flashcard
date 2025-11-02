"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserStats {
  user_id: string
  total_cards_studied: number
  xp_points: number
  current_streak: number
  longest_streak: number
  last_study_date: string
  cards_studied?: number
}

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      // Lấy thông tin user
      const meRes = await fetch("/api/auth/me")
      if (!meRes.ok) {
        router.push("/auth/login")
        return
      }
      const userData = await meRes.json()
      setUser(userData.user)

      // Lấy stats
      const statsRes = await fetch("/api/stats")
      const statsData = await statsRes.json()
      const baseStats = statsData.stats || statsData

      // Giữ nguyên giá trị cards_studied từ API
      const updatedStats = {
        ...baseStats,
        cards_studied: baseStats.cards_studied || baseStats.total_cards_studied || 0,
        total_cards_studied: baseStats.total_cards_studied || baseStats.cards_studied || 0,
      }
      setStats(updatedStats)

      // Tính achievements dựa trên stats
      setAchievements(getAchievements(updatedStats))
      setLoading(false)
    } catch (error) {
      console.error("Error loading progress:", error)
      setLoading(false)
    }
  }

  const getAchievements = (stats: UserStats | null) => {
    const earned: { id: number; name: string; description: string; icon: string }[] = []
    if (!stats) return earned

    if (stats.total_cards_studied >= 10)
      earned.push({ id: 1, name: "First Steps", description: "Study 10 cards", icon: "🚀" })
    if (stats.total_cards_studied >= 50)
      earned.push({ id: 2, name: "Learning", description: "Study 50 cards", icon: "📚" })
    if (stats.total_cards_studied >= 100)
      earned.push({ id: 3, name: "Scholar", description: "Study 100 cards", icon: "🎓" })
    if (stats.total_cards_studied >= 500)
      earned.push({ id: 4, name: "Master", description: "Study 500 cards", icon: "👑" })
    if (stats.current_streak >= 3)
      earned.push({ id: 5, name: "On Fire", description: "3 day streak", icon: "🔥" })
    if (stats.current_streak >= 7)
      earned.push({ id: 6, name: "Unstoppable", description: "7 day streak", icon: "⚡" })
    if (stats.longest_streak >= 30)
      earned.push({ id: 7, name: "Champion", description: "30 day streak", icon: "🏆" })
    if (stats.xp_points >= 1000)
      earned.push({ id: 8, name: "XP Master", description: "Earn 1000 XP", icon: "✨" })

    return earned
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const xpLevel = stats ? Math.floor(stats.xp_points / 100) + 1 : 1
  const nextLevelXP = xpLevel * 100
  const currentLevelXP = (xpLevel - 1) * 100
  const xpProgress =
    stats && nextLevelXP - currentLevelXP > 0
      ? ((stats.xp_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
      : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
            <p className="text-muted-foreground mt-1">Track your learning journey</p>
          </div>
          <Link href="/dashboard" className="text-primary hover:underline">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* XP Level Card */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8 mb-8 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-muted-foreground mb-2">Your Level</p>
            <p className="text-6xl font-bold text-primary mb-4">{xpLevel}</p>
            <p className="text-muted-foreground mb-4">
              {stats?.xp_points || 0} / {nextLevelXP} XP
            </p>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-8xl">⭐</p>
            <p className="text-sm text-muted-foreground mt-2">Keep learning to level up!</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Cards Studied</p>
            <p className="text-3xl font-bold text-primary">{stats?.cards_studied || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">XP Points</p>
            <p className="text-4xl font-bold text-accent">{stats?.xp_points || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Current Streak</p>
            <p className="text-4xl font-bold text-primary">{stats?.current_streak || 0}</p>
            <p className="text-xs text-muted-foreground mt-2">days</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-2">Longest Streak</p>
            <p className="text-4xl font-bold text-accent">{stats?.longest_streak || 0}</p>
            <p className="text-xs text-muted-foreground mt-2">days</p>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Achievements</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {achievements.length === 0 ? (
              <p className="text-muted-foreground col-span-full">Keep studying to unlock achievements!</p>
            ) : (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-card border-2 border-accent/30 rounded-lg p-6 text-center hover:border-accent transition"
                >
                  <p className="text-4xl mb-2">{achievement.icon}</p>
                  <p className="font-semibold text-foreground mb-1">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
