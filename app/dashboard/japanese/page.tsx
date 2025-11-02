"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface JapaneseSet {
  id: string
  name: string
  description: string
  level: "beginner" | "intermediate" | "advanced"
  type: "hiragana" | "katakana" | "kanji" | "vocabulary" | "grammar"
  card_count: number
}

export default function JapanesePage() {
  const [userSets, setUserSets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserJapaneseSets()
  }, [])

  const loadUserJapaneseSets = async () => {
    try {
      const res = await fetch("/api/sets?subject=Japanese")
      const data = await res.json()

      setUserSets(data.sets || [])
    } catch (error) {
      console.error("Error loading sets:", error)
    } finally {
      setLoading(false)
    }
  }

  const premadeSets: JapaneseSet[] = [
    {
      id: "hiragana-basic",
      name: "Hiragana Basics",
      description: "Learn the 46 basic hiragana characters with their romanization",
      level: "beginner",
      type: "hiragana",
      card_count: 46,
    },
    {
      id: "katakana-basic",
      name: "Katakana Basics",
      description: "Master the 46 basic katakana characters",
      level: "beginner",
      type: "katakana",
      card_count: 46,
    },
    {
      id: "kanji-n5",
      name: "JLPT N5 Kanji",
      description: "Essential kanji characters for JLPT N5 exam preparation",
      level: "beginner",
      type: "kanji",
      card_count: 100,
    },
    {
      id: "vocab-daily",
      name: "Daily Japanese Vocabulary",
      description: "Common everyday phrases and words for beginners",
      level: "beginner",
      type: "vocabulary",
      card_count: 100,
    },
    {
      id: "grammar-n5",
      name: "JLPT N5 Grammar",
      description: "Basic grammar patterns needed for N5 certification",
      level: "beginner",
      type: "grammar",
      card_count: 80,
    },
    {
      id: "kanji-n4",
      name: "JLPT N4 Kanji",
      description: "Intermediate kanji characters for JLPT N4",
      level: "intermediate",
      type: "kanji",
      card_count: 150,
    },
  ]

  const createFromTemplate = async (template: JapaneseSet) => {
    setCreating(template.id)
    try {
      const res = await fetch("/api/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.name,
          description: template.description,
          subject: "Japanese",
          is_public: false,
          cards: createJapaneseCards(template.type, template.level),
        }),
      })

      if (!res.ok) throw new Error("Failed to create set")

      const data = await res.json()
      router.push(`/dashboard/sets/${data.setId}`)
    } catch (error) {
      console.error("Error creating from template:", error)
      alert("Failed to create set from template")
    } finally {
      setCreating(null)
    }
  }

  const createJapaneseCards = (type: string, level: string): any[] => {
    const cards: any[] = []

    if (type === "hiragana") {
      const hiragana = [
        { char: "あ", romaji: "a" },
        { char: "い", romaji: "i" },
        { char: "う", romaji: "u" },
        { char: "え", romaji: "e" },
        { char: "お", romaji: "o" },
        { char: "か", romaji: "ka" },
        { char: "き", romaji: "ki" },
        { char: "く", romaji: "ku" },
        { char: "け", romaji: "ke" },
        { char: "こ", romaji: "ko" },
      ]

      return hiragana.map((h) => ({
        front: h.char,
        back: h.romaji,
        romaji: h.romaji,
      }))
    } else if (type === "katakana") {
      const katakana = [
        { char: "ア", romaji: "a" },
        { char: "イ", romaji: "i" },
        { char: "ウ", romaji: "u" },
        { char: "エ", romaji: "e" },
        { char: "オ", romaji: "o" },
        { char: "カ", romaji: "ka" },
        { char: "キ", romaji: "ki" },
        { char: "ク", romaji: "ku" },
        { char: "ケ", romaji: "ke" },
        { char: "コ", romaji: "ko" },
      ]

      return katakana.map((k) => ({
        front: k.char,
        back: k.romaji,
        romaji: k.romaji,
      }))
    } else if (type === "kanji" && level === "beginner") {
      const kanji = [
        { char: "一", meaning: "one", reading: "いち" },
        { char: "二", meaning: "two", reading: "に" },
        { char: "三", meaning: "three", reading: "さん" },
        { char: "日", meaning: "day/sun", reading: "ひ" },
        { char: "月", meaning: "month/moon", reading: "つき" },
        { char: "火", meaning: "fire", reading: "ひ" },
        { char: "水", meaning: "water", reading: "みず" },
        { char: "木", meaning: "tree", reading: "き" },
        { char: "金", meaning: "gold/money", reading: "きん" },
        { char: "土", meaning: "earth", reading: "つち" },
      ]

      return kanji.map((k) => ({
        front: k.char,
        back: `${k.meaning} (${k.reading})`,
        romaji: k.reading,
      }))
    } else if (type === "vocabulary") {
      const vocab = [
        { jp: "こんにちは", romaji: "konnichiwa", en: "hello" },
        { jp: "ありがとう", romaji: "arigatou", en: "thank you" },
        { jp: "はじめまして", romaji: "hajimemashite", en: "nice to meet you" },
        { jp: "さようなら", romaji: "sayounara", en: "goodbye" },
        { jp: "おはよう", romaji: "ohayou", en: "good morning" },
      ]

      return vocab.map((v) => ({
        front: v.jp,
        back: `${v.romaji} - ${v.en}`,
        romaji: v.romaji,
      }))
    } else if (type === "grammar") {
      const grammar = [
        { pattern: "～です", meaning: "to be (polite)", example: "私は学生です" },
        { pattern: "～ました", meaning: "past tense (polite)", example: "食べました" },
        { pattern: "～ません", meaning: "negative (polite)", example: "分かりません" },
        { pattern: "～から", meaning: "because", example: "疲れているから寝ます" },
        { pattern: "～けど", meaning: "but", example: "好きですけど、食べません" },
      ]

      return grammar.map((g) => ({
        front: g.pattern,
        back: `${g.meaning}\nExample: ${g.example}`,
        romaji: g.meaning,
      }))
    }

    return cards
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">日本語 Japanese Learning</h1>
              <p className="text-muted-foreground mt-1">Master Japanese with specialized learning tools</p>
            </div>
            <Link href="/dashboard" className="text-primary hover:underline">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* My Japanese Sets */}
        {userSets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">My Japanese Sets</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {userSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/dashboard/sets/${set.id}`}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
                >
                  <h3 className="text-lg font-semibold mb-2 hover:text-primary">{set.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{set.description}</p>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded">{set.card_count} cards</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pre-made Templates */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Learn Japanese with Pre-made Sets</h2>

          {/* Beginner Sets */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-primary">Beginner Level</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premadeSets
                .filter((s) => s.level === "beginner")
                .map((set) => (
                  <div
                    key={set.id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition flex flex-col"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {set.type === "hiragana"
                            ? "あ"
                            : set.type === "katakana"
                              ? "ア"
                              : set.type === "kanji"
                                ? "漢"
                                : set.type === "vocabulary"
                                  ? "🗣️"
                                  : "📝"}
                        </span>
                        <h3 className="text-lg font-semibold">{set.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{set.description}</p>
                      <div className="flex gap-2 mb-4">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {set.card_count} cards
                        </span>
                        <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                          Beginner
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => createFromTemplate(set)}
                      disabled={creating === set.id}
                      className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {creating === set.id ? "Creating..." : "Create from Template"}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Intermediate Sets */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-accent">Intermediate Level</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premadeSets
                .filter((s) => s.level === "intermediate")
                .map((set) => (
                  <div
                    key={set.id}
                    className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition flex flex-col"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">漢</span>
                        <h3 className="text-lg font-semibold">{set.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{set.description}</p>
                      <div className="flex gap-2 mb-4">
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                          {set.card_count} cards
                        </span>
                        <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                          Intermediate
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => createFromTemplate(set)}
                      disabled={creating === set.id}
                      className="w-full bg-accent text-accent-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
                    >
                      {creating === set.id ? "Creating..." : "Create from Template"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
