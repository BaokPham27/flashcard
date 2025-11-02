"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Flashcard {
  id: string
  front: string
  back: string
  romaji?: string
}

export default function StudyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const setId = params.id as string
  const mode = searchParams.get("mode") || "study"
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [studied, setStudied] = useState(new Set<string>())
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    loadCards()
  }, [setId])

  const loadCards = async () => {
    try {
      const response = await fetch(`/api/sets/${setId}/cards`)
      if (!response.ok) {
        router.push("/dashboard/sets")
        return
      }

      const data = await response.json()
      if (data && data.length > 0) {
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setCards(shuffled)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error loading cards:", error)
      router.push("/dashboard/sets")
    }
  }

  const markAsStudied = () => {
    setStudied(new Set([...studied, cards[currentIndex].id]))
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleTestAnswer = (answer: string) => {
    setTestAnswers({
      ...testAnswers,
      [cards[currentIndex].id]: answer,
    })
  }

  const submitTest = async () => {
    let correct = 0
    for (const card of cards) {
      const userAnswer = testAnswers[card.id]
      if (userAnswer && userAnswer.toLowerCase().trim() === card.back.toLowerCase().trim()) {
        correct++
      }
    }
    setCorrectCount(correct)
    setShowResults(true)

    const testScore = correct / cards.length
    try {
      await fetch("/api/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId,
          cardsStudied: cards.length,
          testScore: mode === "test" ? testScore : null,
        }),
      })
    } catch (error) {
      console.error("Failed to track session:", error)
    }
  }

  const handleStudyComplete = async () => {
    try {
      await fetch("/api/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId,
          cardsStudied: studied.size,
        }),
      })
    } catch (error) {
      console.error("Failed to track session:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No cards in this set</p>
          <Link href="/dashboard/sets" className="text-primary hover:underline">
            Back to Sets
          </Link>
        </div>
      </div>
    )
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Link href="/dashboard/sets" className="text-primary hover:underline mb-4 inline-block">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Choose Study Mode</h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href={`/dashboard/study/${setId}?mode=study`}
              className="bg-card border-2 border-primary/30 rounded-lg p-8 hover:border-primary transition cursor-pointer group"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">Study Mode</h2>
              <p className="text-muted-foreground">
                Flip through cards at your own pace. Mark cards as studied when you're confident.
              </p>
            </Link>

            <Link
              href={`/dashboard/study/${setId}?mode=test`}
              className="bg-card border-2 border-accent/30 rounded-lg p-8 hover:border-accent transition cursor-pointer group"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition">Test Mode</h2>
              <p className="text-muted-foreground">Answer questions and test your knowledge. Get scored at the end.</p>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return mode === "study" ? (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <header className="bg-card/50 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/dashboard/study/${setId}`} className="text-primary hover:underline">
              ← Change Mode
            </Link>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div onClick={() => setIsFlipped(!isFlipped)} className="w-full max-w-md h-80 cursor-pointer perspective mb-8">
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="absolute w-full h-full bg-card border-2 border-primary rounded-lg p-8 flex flex-col items-center justify-center text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-sm text-muted-foreground mb-4">Question</p>
              <p className="text-2xl font-bold text-foreground">{cards[currentIndex].front}</p>
              <p className="text-sm text-muted-foreground mt-8">Click to reveal answer</p>
            </div>

            <div
              className="absolute w-full h-full bg-accent border-2 border-accent rounded-lg p-8 flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-sm text-accent-foreground/70 mb-4">Answer</p>
              <p className="text-2xl font-bold text-accent-foreground">{cards[currentIndex].back}</p>
              {cards[currentIndex].romaji && (
                <p className="text-sm text-accent-foreground/70 mt-4">{cards[currentIndex].romaji}</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="flex gap-3">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="flex-1 bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <button
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
              className="flex-1 bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>

          <button
            onClick={() => {
              markAsStudied()
              nextCard()
            }}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            {studied.has(cards[currentIndex].id) ? "✓ Studied" : "Mark as Studied"}
          </button>

          {studied.size === cards.length && (
            <div className="text-center py-4 bg-primary/10 rounded-lg">
              <p className="text-primary font-medium mb-3">All cards studied! Great work!</p>
              <button
                onClick={() => {
                  handleStudyComplete()
                  setTimeout(() => router.push("/dashboard"), 500)
                }}
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <header className="bg-card/50 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <Link href={`/dashboard/study/${setId}`} className="text-primary hover:underline">
              ← Change Mode
            </Link>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {cards.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {showResults ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border-2 border-accent rounded-lg p-12 text-center">
              <div className="mb-6">
                <div className="text-6xl font-bold text-accent mb-2">
                  {correctCount}/{cards.length}
                </div>
                <p className="text-muted-foreground text-lg">
                  You got {Math.round((correctCount / cards.length) * 100)}% correct!
                </p>
              </div>

              <div className="mb-8">
                {correctCount === cards.length ? (
                  <p className="text-primary text-lg font-semibold">Perfect score! You're a master!</p>
                ) : correctCount >= cards.length * 0.8 ? (
                  <p className="text-accent text-lg font-semibold">Excellent work! Keep it up!</p>
                ) : correctCount >= cards.length * 0.6 ? (
                  <p className="text-muted-foreground text-lg">Good effort! Review and try again.</p>
                ) : (
                  <p className="text-muted-foreground text-lg">Keep practicing! You'll get it soon.</p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setCurrentIndex(0)
                    setTestAnswers({})
                    setShowResults(false)
                  }}
                  className="bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Try Again
                </button>
                <Link
                  href="/dashboard/sets"
                  className="bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 transition text-center"
                >
                  Back to Sets
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <p className="text-sm text-muted-foreground mb-4">Question {currentIndex + 1}</p>
              <h2 className="text-3xl font-bold text-foreground mb-8">{cards[currentIndex].front}</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={testAnswers[cards[currentIndex].id] || ""}
                  onChange={(e) => handleTestAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      if (currentIndex === cards.length - 1) {
                        submitTest()
                      } else {
                        nextCard()
                      }
                    }
                  }}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="flex-1 bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={() => {
                  if (currentIndex === cards.length - 1) {
                    submitTest()
                  } else {
                    nextCard()
                  }
                }}
                className="flex-1 bg-accent text-accent-foreground py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                {currentIndex === cards.length - 1 ? "Finish Test" : "Next →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
