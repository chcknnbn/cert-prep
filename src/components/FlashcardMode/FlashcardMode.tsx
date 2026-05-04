import { useState, useMemo } from 'react'
import type { Domain, Flashcard } from '../../types'

interface Props {
  domains: Domain[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardMode({ domains }: Props) {
  const allCards = useMemo(
    () => shuffle(domains.flatMap((d) => d.flashcards)),
    [domains]
  )

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [unknown, setUnknown] = useState<Set<string>>(new Set())

  const card: Flashcard | undefined = allCards[index]

  function goNext() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.min(i + 1, allCards.length - 1)), 150)
  }

  function goPrev() {
    setFlipped(false)
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150)
  }

  function markKnown() {
    if (!card) return
    setKnown((prev) => new Set([...prev, card.id]))
    setUnknown((prev) => { const n = new Set(prev); n.delete(card.id); return n })
    goNext()
  }

  function markUnknown() {
    if (!card) return
    setUnknown((prev) => new Set([...prev, card.id]))
    setKnown((prev) => { const n = new Set(prev); n.delete(card.id); return n })
    goNext()
  }

  function restart() {
    setIndex(0)
    setFlipped(false)
    setKnown(new Set())
    setUnknown(new Set())
  }

  const isKnown = card ? known.has(card.id) : false
  const isUnknown = card ? unknown.has(card.id) : false

  if (!card) {
    return (
      <div className="text-center py-20 text-space-400 mono text-sm">
        카드가 없습니다.
      </div>
    )
  }

  const progress = ((index + 1) / allCards.length) * 100
  const knownCount = known.size
  const unknownCount = unknown.size

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="mono text-xs text-space-300">{knownCount} 알았다</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="mono text-xs text-space-300">{unknownCount} 다시 볼게</span>
          </div>
        </div>
        <div className="mono text-xs text-space-400">
          <span className="text-amber-400 font-bold">{index + 1}</span>
          <span className="text-space-600"> / {allCards.length}</span>장
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-6">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div
        className="flashcard-wrapper cursor-pointer mb-6 select-none"
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div
            className="flashcard-face border"
            style={{
              background: 'var(--card-front-bg)',
              borderColor: isKnown ? '#10b98140' : isUnknown ? '#ef444440' : 'rgb(var(--space-600))',
              boxShadow: isKnown
                ? '0 0 30px rgba(16,185,129,0.08), inset 0 0 60px rgba(16,185,129,0.03)'
                : isUnknown
                ? '0 0 30px rgba(239,68,68,0.08), inset 0 0 60px rgba(239,68,68,0.03)'
                : '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Status indicator */}
            {(isKnown || isUnknown) && (
              <div
                className="absolute top-4 right-4 mono text-[10px] tracking-widest px-2 py-1 rounded border"
                style={{
                  color: isKnown ? '#10b981' : '#ef4444',
                  borderColor: isKnown ? '#10b98130' : '#ef444430',
                  background: isKnown ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                }}
              >
                {isKnown ? '✓ 알았다' : '✗ 다시볼게'}
              </div>
            )}

            <div className="absolute top-4 left-4 mono text-[10px] text-space-600 tracking-widest">
              FRONT
            </div>

            <div className="text-center">
              <div className="mono text-[10px] text-space-500 tracking-widest mb-4">개념 / 용어</div>
              <div className="display text-2xl font-bold text-space-50 leading-tight">
                {card.front}
              </div>
            </div>

            <div className="absolute bottom-4 mono text-[10px] text-space-600">
              클릭하여 뒤집기
            </div>
          </div>

          {/* Back */}
          <div
            className="flashcard-face flashcard-back border"
            style={{
              background: 'var(--card-back-bg)',
              borderColor: '#f59e0b30',
              boxShadow: '0 0 40px rgba(245,158,11,0.06), inset 0 0 80px rgba(245,158,11,0.02)',
            }}
          >
            <div className="absolute top-4 left-4 mono text-[10px] text-amber-600 tracking-widest">
              BACK
            </div>
            <div className="absolute top-4 right-4 mono text-[10px] text-space-600">
              {index + 1} / {allCards.length}
            </div>

            <div className="text-center max-w-sm">
              <div className="mono text-[10px] text-amber-600/60 tracking-widest mb-4">정의 / 설명</div>
              <p className="text-space-200 text-sm leading-relaxed">
                {card.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Classification buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={(e) => { e.stopPropagation(); markUnknown() }}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
          style={{
            borderColor: '#ef444440',
            background: 'rgba(239,68,68,0.06)',
          }}
        >
          <span className="text-red-400 text-lg">✗</span>
          <span className="display font-semibold text-red-400 text-sm">다시 볼게</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); markKnown() }}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
          style={{
            borderColor: '#10b98140',
            background: 'rgba(16,185,129,0.06)',
          }}
        >
          <span className="text-emerald-400 text-lg">✓</span>
          <span className="display font-semibold text-emerald-400 text-sm">알았다</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="mono text-sm text-space-400 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg border border-space-700 hover:border-amber-500/40"
        >
          ← 이전
        </button>

        <button
          onClick={restart}
          className="mono text-[11px] text-space-500 hover:text-amber-400 transition-colors"
        >
          처음부터
        </button>

        <button
          onClick={goNext}
          disabled={index === allCards.length - 1}
          className="mono text-sm text-space-400 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg border border-space-700 hover:border-amber-500/40"
        >
          다음 →
        </button>
      </div>

      {/* End of deck indicator */}
      {index === allCards.length - 1 && (
        <div className="mt-6 text-center">
          <div className="mono text-[11px] text-space-500">
            마지막 카드입니다 ·{' '}
            <button onClick={restart} className="text-amber-400 hover:text-amber-300">
              처음부터 다시
            </button>
          </div>
          {(knownCount > 0 || unknownCount > 0) && (
            <div className="mt-3 flex justify-center gap-6">
              <div>
                <div className="mono text-xl font-bold text-emerald-400">{knownCount}</div>
                <div className="mono text-[10px] text-space-500">알았다</div>
              </div>
              <div>
                <div className="mono text-xl font-bold text-red-400">{unknownCount}</div>
                <div className="mono text-[10px] text-space-500">다시볼게</div>
              </div>
              <div>
                <div className="mono text-xl font-bold text-space-400">
                  {allCards.length - knownCount - unknownCount}
                </div>
                <div className="mono text-[10px] text-space-500">미분류</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
