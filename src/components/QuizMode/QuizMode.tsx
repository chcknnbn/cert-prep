import { useState, useMemo } from 'react'
import type { Domain, Question, DomainFilter } from '../../types'
import MultipleChoice from './MultipleChoice'
import TrueFalse from './TrueFalse'
import ShortAnswer from './ShortAnswer'

interface Props {
  domains: Domain[]
  domainFilter: DomainFilter
  certId: string
}

type QuizState = 'setup' | 'running' | 'summary'

const QUESTION_COUNTS = [10, 20, 40] as const
type QuestionCount = typeof QUESTION_COUNTS[number]

type UserAnswer = number | boolean | string

function selectQuestions(domains: Domain[], count: number, filter: DomainFilter): Question[] {
  const allQ = domains.flatMap((d) => {
    if (filter === 'weighted') {
      const n = Math.max(1, Math.round(count * d.weight))
      return shuffle(d.questions).slice(0, n)
    }
    return d.questions
  })
  return shuffle(allQ).slice(0, count)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function isAnswerCorrect(q: Question, answer: UserAnswer | undefined): boolean {
  if (answer === undefined) return false
  if (q.type === 'multiple-choice') return answer === q.answer
  if (q.type === 'true-false') return answer === q.answer
  return q.acceptedAnswers.some(
    (a) => a.toLowerCase().trim() === String(answer).toLowerCase().trim()
  )
}


const TYPE_LABELS: Record<Question['type'], string> = {
  'multiple-choice': 'MULTIPLE CHOICE',
  'true-false': 'TRUE / FALSE',
  'short-answer': 'SHORT ANSWER',
}

const TYPE_COLORS: Record<Question['type'], string> = {
  'multiple-choice': '#60a5fa',
  'true-false': '#a78bfa',
  'short-answer': '#34d399',
}

export default function QuizMode({ domains, domainFilter, certId }: Props) {
  // certId is used in Task 3 & 4 for Supabase quiz_attempts logging
  void certId

  const [quizState, setQuizState] = useState<QuizState>('setup')
  const [questionCount, setQuestionCount] = useState<QuestionCount>(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [pendingAnswer, setPendingAnswer] = useState<UserAnswer | null>(null)
  const [forcedCorrect, setForcedCorrect] = useState<Record<string, boolean>>({})

  const score = useMemo(() => {
    return Object.entries(submitted)
      .filter(([, s]) => s)
      .filter(([id]) => {
        if (forcedCorrect[id]) return true
        const q = questions.find((q) => q.id === id)
        return q ? isAnswerCorrect(q, answers[id]) : false
      }).length
  }, [submitted, answers, questions, forcedCorrect])

  function startQuiz() {
    const selected = selectQuestions(domains, questionCount, domainFilter)
    setQuestions(selected)
    setCurrentIndex(0)
    setAnswers({})
    setSubmitted({})
    setPendingAnswer(null)
    setForcedCorrect({})
    setQuizState('running')
  }

  function handleSubmit() {
    const q = questions[currentIndex]
    if (!q) return

    const answer = pendingAnswer ?? answers[q.id]
    if (answer === null || answer === undefined) return

    setAnswers((prev) => ({ ...prev, [q.id]: answer }))
    setSubmitted((prev) => ({ ...prev, [q.id]: true }))
  }

  function handleNext() {
    setPendingAnswer(null)
    if (currentIndex + 1 >= questions.length) {
      setQuizState('summary')
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  function resetQuiz() {
    setQuizState('setup')
    setQuestions([])
    setCurrentIndex(0)
    setAnswers({})
    setSubmitted({})
    setPendingAnswer(null)
    setForcedCorrect({})
  }

  // ── SETUP ──
  if (quizState === 'setup') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="border border-space-600 rounded-2xl bg-space-800 p-5 sm:p-8">
          <div className="mono text-amber-500 text-xs tracking-widest mb-3">MISSION BRIEFING</div>
          <h2 className="display text-2xl font-bold text-space-50 mb-2">모의고사 시작</h2>
          <p className="text-space-300 text-sm mb-8">
            도메인 배점 비율에 맞춰 문제를 랜덤으로 출제합니다.
            각 답 제출 후 즉시 해설을 확인할 수 있습니다.
          </p>

          <div className="mb-8">
            <div className="mono text-space-400 text-[11px] tracking-widest mb-3">문제 수 선택</div>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className="py-4 rounded-xl border-2 transition-all duration-200"
                  style={{
                    borderColor: questionCount === n ? '#f59e0b' : 'rgb(var(--space-600))',
                    background: questionCount === n ? 'rgba(245,158,11,0.08)' : 'rgb(var(--space-800))',
                  }}
                >
                  <div
                    className="mono text-2xl font-bold mb-0.5"
                    style={{ color: questionCount === n ? '#f59e0b' : 'rgb(var(--space-300))' }}
                  >
                    {n}
                  </div>
                  <div className="mono text-[10px] text-space-500">문제</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-sm">⚠</span>
              <p className="mono text-[11px] text-amber-500/80 leading-relaxed">
                이 문제들은 실제 시험 형식과 다를 수 있습니다. 학습 목적으로만 활용하세요.
              </p>
            </div>
          </div>

          <div className="mb-6 p-3 rounded-lg bg-space-900 border border-space-700">
            <div className="mono text-[10px] text-space-400 tracking-widest mb-2">출제 도메인</div>
            <div className="flex flex-wrap gap-1.5">
              {domains.map((d) => (
                <span key={d.id} className="mono text-[10px] text-space-300 px-2 py-0.5 bg-space-800 rounded border border-space-600">
                  D{d.id} · {Math.round(d.weight * 100)}%
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-space-900 display font-bold text-sm tracking-wide transition-all duration-200 hover:shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}
          >
            미션 시작 →
          </button>
        </div>
      </div>
    )
  }

  // ── SUMMARY ──
  if (quizState === 'summary') {
    const total = questions.length
    const pct = Math.round((score / total) * 100)
    const passed = pct >= 75

    const domainStats = domains.map((d) => {
      const dqs = questions.filter((q) => q.id.startsWith(`d${d.id}-`))
      const correct = dqs.filter((q) => isAnswerCorrect(q, answers[q.id])).length
      return { domain: d, total: dqs.length, correct }
    }).filter((s) => s.total > 0)

    return (
      <div className="max-w-2xl mx-auto">
        <div className="border border-space-600 rounded-2xl bg-space-800 overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-6 border-b border-space-700"
            style={{
              background: passed
                ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 100%)',
            }}
          >
            <div className="mono text-xs tracking-widest mb-2" style={{ color: passed ? '#10b981' : '#ef4444' }}>
              {passed ? '✓ MISSION SUCCESS' : '✗ MISSION FAILED'}
            </div>
            <div className="flex items-end gap-4 mb-2">
              <div className="mono text-6xl font-bold" style={{ color: passed ? '#10b981' : '#ef4444' }}>
                {pct}
              </div>
              <div className="mono text-2xl text-space-400 pb-2">%</div>
            </div>
            <div className="mono text-space-400 text-sm">
              {score} / {total} 문제 정답 · {passed ? '합격 기준(75%) 통과' : '합격 기준(75%) 미달'}
            </div>
          </div>

          {/* Domain breakdown */}
          <div className="px-8 py-5">
            <div className="mono text-[10px] text-space-400 tracking-widest mb-4">도메인별 정답률</div>
            <div className="space-y-3">
              {domainStats.map(({ domain, total: dt, correct }) => {
                const dpct = dt > 0 ? Math.round((correct / dt) * 100) : 0
                return (
                  <div key={domain.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[10px] text-space-500">D{domain.id}</span>
                        <span className="text-xs text-space-300">{domain.name}</span>
                      </div>
                      <span className="mono text-xs text-space-200">{correct}/{dt}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill transition-all duration-700"
                        style={{
                          width: `${dpct}%`,
                          background: dpct >= 75 ? '#10b981' : dpct >= 50 ? '#f59e0b' : '#ef4444',
                          boxShadow: `0 0 8px ${dpct >= 75 ? '#10b981' : dpct >= 50 ? '#f59e0b' : '#ef4444'}60`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-6 flex gap-3">
            <button
              onClick={startQuiz}
              className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-space-900 display font-bold text-sm transition-all duration-200"
            >
              재도전
            </button>
            <button
              onClick={resetQuiz}
              className="flex-1 py-3 rounded-xl border border-space-600 text-space-300 hover:text-white hover:border-space-500 display font-semibold text-sm transition-all duration-200"
            >
              설정으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── RUNNING ──
  const currentQ = questions[currentIndex]
  const isSubmitted = submitted[currentQ.id] ?? false
  const correct = isSubmitted && (forcedCorrect[currentQ.id] || isAnswerCorrect(currentQ, answers[currentQ.id]))
  const progress = ((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Top HUD */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="mono text-sm font-bold text-space-200">
            <span className="text-amber-400">{currentIndex + 1}</span>
            <span className="text-space-500"> / {questions.length}</span>
          </div>
          <div className="progress-bar w-32">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="mono text-sm">
          <span className="text-emerald-400 font-bold">{score}</span>
          <span className="text-space-500"> 정답</span>
        </div>
      </div>

      {/* Warning banner */}
      <div className="mb-4 px-4 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
        <span className="text-amber-500 text-xs">⚠</span>
        <span className="mono text-[10px] text-amber-500/70">이 문제들은 실제 시험 형식과 다를 수 있습니다</span>
      </div>

      {/* Question card */}
      <div className="border border-space-600 rounded-2xl bg-space-800 overflow-hidden">
        {/* Question header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-space-700 flex items-center justify-between">
          <span
            className="mono text-[10px] font-bold tracking-widest px-2.5 py-1 rounded border"
            style={{
              color: TYPE_COLORS[currentQ.type],
              borderColor: `${TYPE_COLORS[currentQ.type]}30`,
              background: `${TYPE_COLORS[currentQ.type]}10`,
            }}
          >
            {TYPE_LABELS[currentQ.type]}
          </span>
          {isSubmitted && (
            <div
              className="mono text-xs font-bold tracking-widest"
              style={{ color: correct ? '#10b981' : '#ef4444' }}
            >
              {correct ? '✓ 정답' : '✗ 오답'}
            </div>
          )}
        </div>

        {/* Question text */}
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <p className="display text-base sm:text-lg font-semibold text-space-50 leading-relaxed mb-6">
            {currentQ.question}
          </p>

          {/* Answer area */}
          {currentQ.type === 'multiple-choice' && (
            <MultipleChoice
              question={currentQ}
              selected={typeof pendingAnswer === 'number' ? pendingAnswer : typeof answers[currentQ.id] === 'number' ? answers[currentQ.id] as number : null}
              submitted={isSubmitted}
              onSelect={(i) => setPendingAnswer(i)}
            />
          )}

          {currentQ.type === 'true-false' && (
            <TrueFalse
              question={currentQ}
              selected={pendingAnswer !== null ? pendingAnswer as boolean : typeof answers[currentQ.id] === 'boolean' ? answers[currentQ.id] as boolean : null}
              submitted={isSubmitted}
              onSelect={(v) => setPendingAnswer(v)}
            />
          )}

          {currentQ.type === 'short-answer' && (
            <ShortAnswer
              question={currentQ}
              submitted={isSubmitted}
              userAnswer={answers[currentQ.id] !== undefined ? String(answers[currentQ.id]) : null}
              onAnswer={(v) => setPendingAnswer(v)}
              onForceCorrect={() => setForcedCorrect((prev) => ({ ...prev, [currentQ.id]: true }))}
              isForced={forcedCorrect[currentQ.id] ?? false}
            />
          )}
        </div>

        {/* Explanation */}
        {isSubmitted && (
          <div
            className="mx-4 sm:mx-6 mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl border"
            style={{
              borderColor: correct ? '#10b98130' : '#ef444430',
              background: correct ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
            }}
          >
            <div className="mono text-[10px] tracking-widest mb-2" style={{ color: correct ? '#10b981' : '#ef4444' }}>
              EXPLANATION
            </div>
            <p className="text-space-300 text-sm leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={pendingAnswer === null}
              className="w-full py-3.5 rounded-xl display font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: pendingAnswer !== null ? '#f59e0b' : 'rgb(var(--space-600))',
                color: pendingAnswer !== null ? '#0a0d14' : 'rgb(var(--space-400))',
              }}
            >
              {pendingAnswer !== null ? '제출 →' : '답을 선택하세요'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl border border-space-500 text-space-200 hover:bg-space-700 hover:text-white display font-bold text-sm tracking-wide transition-all duration-200"
            >
              {currentIndex + 1 >= questions.length ? '결과 보기 →' : '다음 문제 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
