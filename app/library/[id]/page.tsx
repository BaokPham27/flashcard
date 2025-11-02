"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Flashcard {
  id: string
  front: string
  back: string
  romaji?: string
}

interface PublicSet {
  id: string
  title: string
  description: string
  subject: string
  user_email?: string
}

export default function PublicSetDetailPage() {
  const params = useParams()
  const setId = params.id
  const [set, setSet] = useState<PublicSet | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSet = async () => {
      try {
        const res = await fetch(`/api/library/${setId}`, { cache: "no-store" })
        const data = await res.json()
        console.log("Fetched set:", data)
        if (res.ok) {
          setSet(data.set)
          setCards(data.cards || [])
        }
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSet()
  }, [setId])

  if (loading) return <p>Loading...</p>
  if (!set) return <p>Set not found or not public</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>{set.title}</h1>
      <p>{set.description}</p>
      <p>By: {set.user_email || "Anon"} • Subject: {set.subject}</p>
      <Link href="/dashboard/library">← Back to Library</Link>

      <h2>Flashcards ({cards.length})</h2>
      <ul>
        {cards.map((card) => (
          <li key={card.id}>
            <strong>{card.front}</strong> → {card.back} {card.romaji && `(${card.romaji})`}
          </li>
        ))}
      </ul>
    </div>
  )
}
