import { useState } from 'react'
import type { Domain } from '../../types'

interface Props {
  domains: Domain[]
}

const WEIGHT_COLORS = [
  { min: 0.20, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  { min: 0.15, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' },
  { min: 0.10, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
  { min: 0,    color: '#6b7fa3', bg: 'rgba(107,127,163,0.1)', border: 'rgba(107,127,163,0.3)' },
]

function getWeightStyle(weight: number) {
  return WEIGHT_COLORS.find((c) => weight >= c.min) ?? WEIGHT_COLORS[3]
}

// 긴 텍스트를 가독성 있게 포맷팅
// "용어: 정의" 패턴이 있으면 항목 앞에 단락 구분자 추가
function formatContent(text: string): string {
  return (
    text
      // "영문 용어(한글): " 패턴 앞에 단락 구분
      .replace(/\.\s+([A-Z][A-Za-z\s()·.-]{1,35}:\s)/g, '.\n\n$1')
      // "한글 용어: " 패턴 앞에 단락 구분
      .replace(/\.\s+([가-힣][가-힣\w\s()·]{1,20}:\s)/g, '.\n\n$1')
      // 나머지 문장 구분 (마침표 뒤 한글/영문 대문자)
      .replace(/\.\s+([가-힣A-Z])/g, '.\n$1')
  )
}

interface ContentRendererProps {
  content: string
  accentColor: string
}

function ContentRenderer({ content, accentColor }: ContentRendererProps) {
  const formatted = formatContent(content)
  // 단락으로 분리 (빈 줄 기준)
  const paragraphs = formatted.split('\n\n').filter(Boolean)

  if (paragraphs.length <= 1) {
    // 단락 구분이 없으면 줄바꿈만 적용
    const lines = formatted.split('\n').filter(Boolean)
    return (
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <p key={i} className="text-space-300 text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n').filter(Boolean)
        // 첫 줄이 "용어: " 패턴이면 강조 스타일 적용
        const firstLine = lines[0] ?? ''
        const termMatch = firstLine.match(/^([A-Za-z가-힣][\w\s()·.-]{1,40}?):\s+(.*)$/)

        if (termMatch) {
          const [, term, rest] = termMatch
          const bodyLines = rest ? [rest, ...lines.slice(1)] : lines.slice(1)
          return (
            <div
              key={i}
              className="rounded-lg px-3 py-2.5"
              style={{
                background: `${accentColor}08`,
                borderLeft: `2px solid ${accentColor}35`,
              }}
            >
              <span
                className="mono text-xs font-bold tracking-wide"
                style={{ color: accentColor }}
              >
                {term}
              </span>
              {bodyLines.length > 0 && (
                <div className="mt-1 space-y-1">
                  {bodyLines.map((line, j) => (
                    <p key={j} className="text-space-200 text-sm leading-relaxed">{line}</p>
                  ))}
                </div>
              )}
            </div>
          )
        }

        // 일반 단락
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => (
              <p key={j} className="text-space-300 text-sm leading-relaxed">{line}</p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default function StudyMode({ domains }: Props) {
  const [openDomains, setOpenDomains] = useState<Set<number>>(new Set([domains[0]?.id]))

  function toggle(id: number) {
    setOpenDomains((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function expandAll() {
    setOpenDomains(new Set(domains.map((d) => d.id)))
  }

  function collapseAll() {
    setOpenDomains(new Set())
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="mono text-space-400 text-xs tracking-widest">
          {domains.length}개 도메인 표시
        </div>
        <div className="flex gap-3">
          <button
            onClick={expandAll}
            className="mono text-[11px] text-space-400 hover:text-amber-400 transition-colors"
          >
            모두 펼치기
          </button>
          <span className="text-space-700">|</span>
          <button
            onClick={collapseAll}
            className="mono text-[11px] text-space-400 hover:text-amber-400 transition-colors"
          >
            모두 접기
          </button>
        </div>
      </div>

      {/* Domain accordions */}
      <div className="space-y-3">
        {domains.map((domain, idx) => {
          const isOpen = openDomains.has(domain.id)
          const ws = getWeightStyle(domain.weight)
          const pct = Math.round(domain.weight * 100)

          return (
            <div
              key={domain.id}
              className="border rounded-xl overflow-hidden transition-all duration-300"
              style={{
                borderColor: isOpen ? ws.border : 'rgb(var(--space-600))',
                background: isOpen ? ws.bg : 'rgb(var(--space-800))',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              {/* Accordion header */}
              <button
                onClick={() => toggle(domain.id)}
                className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <span className="mono text-space-500 text-sm font-bold flex-shrink-0">
                    {String(domain.id).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-0.5 flex-wrap">
                      <span
                        className="mono text-[10px] px-2 py-0.5 rounded font-bold tracking-widest border flex-shrink-0"
                        style={{ color: ws.color, background: ws.bg, borderColor: ws.border }}
                      >
                        {pct}%
                      </span>
                      {pct >= 20 && (
                        <span className="mono text-[9px] text-amber-500 tracking-widest opacity-70">HIGH WEIGHT</span>
                      )}
                    </div>
                    <span className="display font-semibold text-sm sm:text-base text-space-100 group-hover:text-white transition-colors block truncate">
                      {domain.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <div className="hidden sm:flex gap-4">
                    <div className="text-right">
                      <div className="mono text-xs font-bold text-space-200">{domain.summary.length}</div>
                      <div className="mono text-[9px] text-space-500">섹션</div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-xs font-bold text-space-200">{domain.questions.length}</div>
                      <div className="mono text-[9px] text-space-500">문제</div>
                    </div>
                  </div>
                  <div
                    className="mono text-space-400 text-lg transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  >
                    ›
                  </div>
                </div>
              </button>

              {/* Accordion content */}
              <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  {/* Weight progress bar */}
                  <div className="mb-4 sm:mb-5 flex items-center gap-3">
                    <div className="flex-1 progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${pct}%`, background: ws.color, boxShadow: `0 0 8px ${ws.color}60` }}
                      />
                    </div>
                    <span className="mono text-[10px] text-space-400">배점 {pct}%</span>
                  </div>

                  {/* Summary sections */}
                  <div className="space-y-3 sm:space-y-4">
                    {domain.summary.map((section, i) => (
                      <div
                        key={i}
                        className="border border-space-700 rounded-lg p-3 sm:p-4 bg-space-900/50"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ws.color }} />
                          <h3 className="display font-semibold text-sm text-space-100">
                            {section.title}
                          </h3>
                        </div>
                        <ContentRenderer content={section.content} accentColor={ws.color} />
                      </div>
                    ))}
                  </div>

                  {/* Flashcard preview teaser */}
                  <div className="mt-4 flex items-center gap-2 text-space-500">
                    <span className="mono text-[10px]">◇</span>
                    <span className="mono text-[10px] tracking-wide">
                      이 도메인의 플래시카드 {domain.flashcards.length}장 →{' '}
                      <span className="text-space-400">플래시카드 탭에서 학습</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
