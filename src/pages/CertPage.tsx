import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Certification, DomainFilter } from '../types'
import githubFoundations from '../data/certifications/github-foundations.json'
import StudyMode from '../components/StudyMode/StudyMode'
import QuizMode from '../components/QuizMode/QuizMode'
import FlashcardMode from '../components/FlashcardMode/FlashcardMode'
import ThemeToggle from '../components/ThemeToggle'

const certMap: Record<string, Certification> = {
  'github-foundations': githubFoundations as Certification,
}

type Tab = 'study' | 'quiz' | 'flashcard'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'study', label: '개념 정리', icon: '◎' },
  { id: 'quiz', label: '모의고사', icon: '◈' },
  { id: 'flashcard', label: '플래시카드', icon: '◇' },
]

export default function CertPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const cert = id ? certMap[id] : undefined

  const [activeTab, setActiveTab] = useState<Tab>('study')
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all')
  const [selectedDomains, setSelectedDomains] = useState<Set<number>>(
    new Set(cert?.domains.map((d) => d.id) ?? [])
  )

  if (!cert) {
    return (
      <div className="min-h-screen bg-space-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mono text-amber-500 text-xs tracking-widest mb-2">ERROR</div>
          <div className="display text-space-50 text-2xl font-bold mb-4">자격증을 찾을 수 없습니다</div>
          <button onClick={() => navigate('/')} className="mono text-space-300 text-sm hover:text-amber-400 transition-colors">
            ← 홈으로
          </button>
        </div>
      </div>
    )
  }

  const filteredDomains = (() => {
    if (domainFilter === 'all') return cert.domains
    if (domainFilter === 'weighted') return [...cert.domains].sort((a, b) => b.weight - a.weight)
    return cert.domains.filter((d) => selectedDomains.has(d.id))
  })()

  function toggleDomain(id: number) {
    setSelectedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-space-900/95 backdrop-blur border-b border-space-600">
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb + title row */}
          <div className="flex items-center justify-between py-3 border-b border-space-700">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="mono text-space-400 text-xs hover:text-amber-400 transition-colors"
              >
                ← BACK
              </button>
              <span className="text-space-700">|</span>
              <div>
                <span className="mono text-amber-500 text-xs tracking-widest mr-2">MISSION</span>
                <span className="display font-bold text-space-100 text-sm">{cert.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="mono text-space-400 text-xs">IN PROGRESS</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-space-400 hover:text-space-200'
                }`}
              >
                <span className="mono text-base">{tab.icon}</span>
                <span className="display font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Domain filter */}
        <div className="mb-6 p-4 border border-space-600 rounded-xl bg-space-800">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="flex-shrink-0">
              <div className="mono text-space-400 text-[10px] tracking-widest mb-2">도메인 필터</div>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'all', label: '전체 균등' },
                    { id: 'weighted', label: '배점 순' },
                    { id: 'custom', label: '직접 선택' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDomainFilter(f.id)}
                    className={`mono text-[11px] px-3 py-1.5 rounded border transition-all duration-200 ${
                      domainFilter === f.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-space-600 text-space-400 hover:border-space-500 hover:text-space-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {domainFilter === 'custom' && (
              <div className="flex flex-wrap gap-2">
                {cert.domains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => toggleDomain(d.id)}
                    className={`mono text-[10px] px-2.5 py-1 rounded border transition-all duration-200 ${
                      selectedDomains.has(d.id)
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                        : 'border-space-600 text-space-500 hover:border-space-500'
                    }`}
                  >
                    D{d.id} · {Math.round(d.weight * 100)}%
                  </button>
                ))}
              </div>
            )}

            {/* Domain weight bars */}
            {domainFilter !== 'custom' && (
              <div className="flex-1 min-w-48">
                <div className="flex gap-1 h-2 items-end">
                  {cert.domains.map((d) => (
                    <div
                      key={d.id}
                      className="flex-1 rounded-sm transition-all duration-500"
                      style={{
                        height: `${Math.round(d.weight * 100) * 3}px`,
                        background:
                          domainFilter === 'weighted'
                            ? `hsl(${38 - d.weight * 100 * 0.5}, 90%, 60%)`
                            : 'rgb(var(--space-500))',
                      }}
                      title={`D${d.id}: ${d.name} (${Math.round(d.weight * 100)}%)`}
                    />
                  ))}
                </div>
                <div className="mono text-[9px] text-space-500 mt-1">
                  {domainFilter === 'weighted' ? '배점 높은 도메인 우선' : '7개 도메인 균등 출제'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mode content */}
        {activeTab === 'study' && <StudyMode domains={filteredDomains} />}
        {activeTab === 'quiz' && <QuizMode domains={filteredDomains} domainFilter={domainFilter} />}
        {activeTab === 'flashcard' && <FlashcardMode domains={filteredDomains} />}
      </div>
    </div>
  )
}
