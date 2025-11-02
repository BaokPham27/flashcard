"use client"

import { useState } from "react"
import Link from "next/link"

export default function JapaneseConverterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")

  const romajiChart: Record<string, string> = {
    あ: "a",
    い: "i",
    う: "u",
    え: "e",
    お: "o",
    か: "ka",
    き: "ki",
    く: "ku",
    け: "ke",
    こ: "ko",
    が: "ga",
    ぎ: "gi",
    ぐ: "gu",
    げ: "ge",
    ご: "go",
    さ: "sa",
    し: "shi",
    す: "su",
    せ: "se",
    そ: "so",
    ざ: "za",
    じ: "ji",
    ず: "zu",
    ぜ: "ze",
    ぞ: "zo",
    た: "ta",
    ち: "chi",
    つ: "tsu",
    て: "te",
    と: "to",
    だ: "da",
    ぢ: "di",
    づ: "du",
    で: "de",
    ど: "do",
    な: "na",
    に: "ni",
    ぬ: "nu",
    ね: "ne",
    の: "no",
    は: "ha",
    ひ: "hi",
    ふ: "fu",
    へ: "he",
    ほ: "ho",
    ば: "ba",
    び: "bi",
    ぶ: "bu",
    べ: "be",
    ぼ: "bo",
    ぱ: "pa",
    ぴ: "pi",
    ぷ: "pu",
    ぺ: "pe",
    ぽ: "po",
    ま: "ma",
    み: "mi",
    む: "mu",
    め: "me",
    も: "mo",
    や: "ya",
    ゆ: "yu",
    よ: "yo",
    ら: "ra",
    り: "ri",
    る: "ru",
    れ: "re",
    ろ: "ro",
    わ: "wa",
    を: "wo",
    ん: "n",
    ア: "a",
    イ: "i",
    ウ: "u",
    エ: "e",
    オ: "o",
    カ: "ka",
    キ: "ki",
    ク: "ku",
    ケ: "ke",
    コ: "ko",
    ガ: "ga",
    ギ: "gi",
    グ: "gu",
    ゲ: "ge",
    ゴ: "go",
    サ: "sa",
    シ: "shi",
    ス: "su",
    セ: "se",
    ソ: "so",
    ザ: "za",
    ジ: "ji",
    ズ: "zu",
    ゼ: "ze",
    ゾ: "zo",
    タ: "ta",
    チ: "chi",
    ツ: "tsu",
    テ: "te",
    ト: "to",
    ダ: "da",
    ヂ: "di",
    ヅ: "du",
    デ: "de",
    ド: "do",
    ナ: "na",
    ニ: "ni",
    ヌ: "nu",
    ネ: "ne",
    ノ: "no",
    ハ: "ha",
    ヒ: "hi",
    フ: "fu",
    ヘ: "he",
    ホ: "ho",
    バ: "ba",
    ビ: "bi",
    ブ: "bu",
    ベ: "be",
    ボ: "bo",
    パ: "pa",
    ピ: "pi",
    プ: "pu",
    ペ: "pe",
    ポ: "po",
    マ: "ma",
    ミ: "mi",
    ム: "mu",
    メ: "me",
    モ: "mo",
    ヤ: "ya",
    ユ: "yu",
    ヨ: "yo",
    ラ: "ra",
    リ: "ri",
    ル: "ru",
    レ: "re",
    ロ: "ro",
    ワ: "wa",
    ヲ: "wo",
    ン: "n",
  }

  const convertToRomaji = (text: string) => {
    let result = ""
    for (const char of text) {
      result += romajiChart[char] || char
    }
    setOutput(result)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/dashboard/japanese" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Japanese
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Japanese Romanizer</h1>
          <p className="text-muted-foreground mt-1">Convert hiragana and katakana to romaji</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Japanese Text (Hiragana/Katakana)</label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                convertToRomaji(e.target.value)
              }}
              placeholder="Enter hiragana or katakana text here..."
              rows={6}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg resize-none"
            />
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Romaji Output:</p>
            <div className="bg-background border border-border rounded p-4 min-h-20 font-mono text-foreground break-words">
              {output || "Enter text above..."}
            </div>
          </div>

          <div className="bg-secondary/50 border border-secondary/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Quick Reference:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div>
                <p className="font-medium text-primary mb-1">Hiragana</p>
                <p>あいうえお (a i u e o)</p>
              </div>
              <div>
                <p className="font-medium text-accent mb-1">Katakana</p>
                <p>アイウエオ (a i u e o)</p>
              </div>
              <div>
                <p className="font-medium text-primary mb-1">Consonants</p>
                <p>かきくけこ (ka ki ku ke ko)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
