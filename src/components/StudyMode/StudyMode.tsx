import { useState, useRef, useLayoutEffect } from 'react'
import ReactMarkdown from 'react-markdown'
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

interface AccordionContentProps {
  isOpen: boolean
  children: React.ReactNode
}

function AccordionContent({ isOpen, children }: AccordionContentProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : '0'
  }, [isOpen])

  // Re-measure on content changes (images/fonts loading)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !isOpen) return
    const ro = new ResizeObserver(() => {
      el.style.maxHeight = `${el.scrollHeight}px`
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [isOpen])

  return (
    <div
      ref={ref}
      style={{ maxHeight: 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {children}
    </div>
  )
}

interface MarkdownContentProps {
  content: string
  accentColor: string
}

function MarkdownContent({ content, accentColor }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="display font-bold text-base text-space-50 mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="display font-semibold text-sm text-space-100 mt-3 mb-1.5">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="display font-semibold text-sm mt-3 mb-1.5" style={{ color: accentColor }}>{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-space-300 text-sm leading-relaxed mb-2">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1 mb-2 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1 mb-2 pl-1 list-decimal list-inside">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-space-300 text-sm leading-relaxed flex gap-2">
            <span style={{ color: accentColor }} className="flex-shrink-0 mt-1">▸</span>
            <span>{children}</span>
          </li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold" style={{ color: accentColor }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-space-200">{children}</em>
        ),
        code: ({ children }) => (
          <code className="mono bg-space-800 border border-space-600 px-1.5 py-0.5 rounded text-xs text-amber-300">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="mono bg-space-900 border border-space-700 rounded-lg p-3 text-xs text-space-200 overflow-x-auto mb-3">{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className="pl-3 py-1 my-2 text-space-300 text-sm"
            style={{ borderLeft: `2px solid ${accentColor}50` }}
          >
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-space-700 my-3" />,
      }}
    >
      {content}
    </ReactMarkdown>
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
              className="border rounded-xl overflow-hidden transition-colors duration-300"
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

              {/* Accordion content — dynamic height via ResizeObserver */}
              <AccordionContent isOpen={isOpen}>
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
                        <MarkdownContent content={section.content} accentColor={ws.color} />
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
              </AccordionContent>
            </div>
          )
        })}
      </div>
    </div>
  )
}
