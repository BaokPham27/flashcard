"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Flashcard {
  id: string
  front: string
  back: string
  romaji?: string
}

interface FlashcardSet {
  id: string
  title: string
  description: string
  subject: string
  is_public: boolean
}

export default function SetDetailPage() {
  const params = useParams()
  const setId = params.id as string
  const [set, setSet] = useState<FlashcardSet | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCardForm, setShowNewCardForm] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [front, setFront] = useState("")
  const [back, setBack] = useState("")
  const [romaji, setRomaji] = useState("")
  const router = useRouter()

  useEffect(() => {
    loadSetDetails()
  }, [setId])

  const loadSetDetails = async () => {
    try {
      const [setResponse, cardsResponse] = await Promise.all([
        fetch(`/api/sets/${setId}`),
        fetch(`/api/sets/${setId}/cards`),
      ])

      if (!setResponse.ok) {
        router.push("/dashboard/sets")
        return
      }

      const setData = await setResponse.json()
      setSet(setData)

      if (cardsResponse.ok) {
        const cardsData = await cardsResponse.json()
        setCards(cardsData)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error loading set details:", error)
      router.push("/dashboard/sets")
    }
  }

  const startEditCard = (card: Flashcard) => {
    setEditingCardId(card.id)
    setFront(card.front)
    setBack(card.back)
    setRomaji(card.romaji || "")
    setShowNewCardForm(false)
  }

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCardId) {
        const response = await fetch(`/api/sets/${setId}/cards/${editingCardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back, romaji }),
        })

        if (response.ok) {
          setEditingCardId(null)
          setFront("")
          setBack("")
          setRomaji("")
          loadSetDetails()
        }
      } else {
        const response = await fetch(`/api/sets/${setId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back, romaji }),
        })

        if (response.ok) {
          setFront("")
          setBack("")
          setRomaji("")
          setShowNewCardForm(false)
          loadSetDetails()
        }
      }
    } catch (error) {
      console.error("Error saving card:", error)
    }
  }

  const cancelEdit = () => {
    setEditingCardId(null)
    setShowNewCardForm(false)
    setFront("")
    setBack("")
    setRomaji("")
  }

  const deleteCard = async (id: string) => {
    if (!confirm("Delete this card?")) return

    try {
      await fetch(`/api/sets/${setId}/cards/${id}`, { method: "DELETE" })
      setCards(cards.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting card:", error)
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/dashboard/sets" className="text-primary hover:underline mb-2 inline-block">
            ← Back to Sets
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{set?.title}</h1>
              {set?.description && <p className="text-sm text-muted-foreground mt-1">{set.description}</p>}
            </div>
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{cards.length} cards</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {/* Add/Edit Card Form */}
          {showNewCardForm || editingCardId ? (
            <form onSubmit={handleSaveCard} className="bg-card border-2 border-primary rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{editingCardId ? "Edit Card" : "Add New Card"}</h2>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Front (Question)</label>
                <textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="What should appear on the front?"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Back (Answer)</label>
                <textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="What should appear on the back?"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Romaji (Optional)</label>
                <input
                  type="text"
                  value={romaji}
                  onChange={(e) => setRomaji(e.target.value)}
                  placeholder="Romanized text (for Japanese learning)"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                  {editingCardId ? "Save Changes" : "Add Card"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-muted text-foreground py-2 rounded-lg font-medium hover:bg-muted/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewCardForm(true)}
              className="w-full bg-primary/10 border-2 border-dashed border-primary rounded-lg p-6 text-center hover:bg-primary/20 transition"
            >
              <span className="text-primary font-medium">+ Add New Card</span>
            </button>
          )}

          {/* Flashcards List */}
          <div className="space-y-3">
            {cards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No cards yet. Create one to get started!</p>
              </div>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">Front</p>
                      <p className="font-medium text-foreground">{card.front}</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">Back</p>
                      <p className="text-foreground">{card.back}</p>
                    </div>
                  </div>
                  {card.romaji && (
                    <div className="mb-4 p-3 bg-secondary rounded">
                      <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase">Romaji</p>
                      <p className="text-sm text-foreground">{card.romaji}</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => startEditCard(card)}
                      className="text-sm text-primary hover:text-primary/80 transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="text-sm text-destructive hover:text-destructive/80 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Study Button */}
          {cards.length > 0 && !showNewCardForm && !editingCardId && (
            <Link
              href={`/dashboard/study/${setId}`}
              className="block bg-accent text-accent-foreground py-3 rounded-lg font-medium text-center hover:opacity-90 transition"
            >
              Start Studying {cards.length} {cards.length === 1 ? "Card" : "Cards"}
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
