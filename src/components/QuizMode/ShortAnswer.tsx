import { useState } from 'react'
import type { ShortAnswerQuestion } from '../../types'

interface Props {
  question: ShortAnswerQuestion
  submitted: boolean
  onAnswer: (value: string) => void
  userAnswer: string | null
  onForceCorrect?: () => void
  isForced?: boolean
}

export default function ShortAnswer({ question, submitted, onAnswer, userAnswer, onForceCorrect, isForced = false }: Props) {
  const [input, setInput] = useState(userAnswer ?? '')

  const isCorrect = submitted &&
    (isForced || question.acceptedAnswers.some(
      (a) => a.toLowerCase().trim() === (userAnswer ?? '').toLowerCase().trim()
    ))
  const isWrong = submitted && !isCorrect

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (!submitted) onAnswer(e.target.value)
          }}
          disabled={submitted}
          placeholder="답을 입력하세요..."
          className="w-full px-4 py-3 rounded-lg border bg-space-800 text-space-100 mono text-sm outline-none transition-all duration-200 placeholder:text-space-600"
          style={{
            borderColor: submitted
              ? isCorrect
                ? '#10b981'
                : '#ef4444'
              : input
              ? '#f59e0b60'
              : 'rgb(var(--space-600))',
            boxShadow: submitted
              ? isCorrect
                ? '0 0 12px rgba(16,185,129,0.15)'
                : '0 0 12px rgba(239,68,68,0.15)'
              : 'none',
          }}
          onKeyDown={(e) => e.key === 'Enter' && !submitted && input && onAnswer(input)}
        />
        {!submitted && input && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[10px] text-space-500">
            Enter로 제출
          </div>
        )}
      </div>

      {submitted && (
        <div
          className="flex items-start gap-3 p-3 rounded-lg border"
          style={{
            borderColor: isCorrect ? '#10b981' : '#ef4444',
            background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
          }}
        >
          <span className="mono text-sm font-bold" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
            {isCorrect ? '✓' : '✗'}
          </span>
          <div className="flex-1">
            {isWrong && (
              <div className="mb-1">
                <span className="mono text-[10px] text-space-400 tracking-widest">정답: </span>
                <span className="mono text-sm text-emerald-400">{question.answer}</span>
              </div>
            )}
            <div className="mono text-[10px] text-space-400 tracking-widest">
              {isCorrect ? '정답입니다!' : `허용 답안: ${question.acceptedAnswers.join(', ')}`}
            </div>
            {isWrong && onForceCorrect && (
              <button
                onClick={onForceCorrect}
                className="mt-2 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 mono text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200"
              >
                ✓ 정답으로 처리
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
