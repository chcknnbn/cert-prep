import { useNavigate } from 'react-router-dom'
import type { Certification } from '../types'
import githubFoundations from '../data/certifications/github-foundations.json'
import ThemeToggle from '../components/ThemeToggle'
import UserMenu from '../components/User/UserMenu'

const certifications: Certification[] = [githubFoundations as Certification]

function getTotalQuestions(cert: Certification): number {
  return cert.domains.reduce((sum, d) => sum + d.questions.length, 0)
}

function getTotalFlashcards(cert: Certification): number {
  return cert.domains.reduce((sum, d) => sum + d.flashcards.length, 0)
}

const CERT_METADATA: Record<string, { icon: string; color: string; badge: string }> = {
  'github-foundations': {
    icon: '⬡',
    color: '#f59e0b',
    badge: 'FOUNDATIONS',
  },
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-space-900 grid-bg relative overflow-hidden">
      {/* ambient glow top left */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
      />
      {/* ambient glow bottom right */}
      <div
        className="pointer-events-none absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-space-600 px-4 sm:px-8 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="mono text-amber-500 text-xs tracking-widest opacity-60">●</div>
            <span className="display font-bold text-space-50 tracking-tight text-lg">CertPrep</span>
            <span className="mono text-space-400 text-xs ml-1">v0.1</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden sm:block mono text-space-400 text-xs tracking-widest">SYSTEM READY</div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Hero */}
        <div className="mb-10 sm:mb-16 animate-fade-up">
          <div className="mono text-amber-500 text-xs tracking-[0.3em] mb-4 opacity-70">
            // CERTIFICATION DATABASE
          </div>
          <h1 className="display text-3xl sm:text-5xl font-extrabold text-space-50 leading-tight mb-4">
            시험 대비,<br />
            <span
              className="relative"
              style={{
                WebkitTextStroke: '1px #f59e0b',
                color: 'transparent',
              }}
            >
              미션처럼 준비하라
            </span>
          </h1>
          <p className="text-space-300 text-sm sm:text-base max-w-xl leading-relaxed">
            개념 정리, 모의고사, 플래시카드로 자격증 시험을 체계적으로 준비합니다.
            도메인별 배점을 반영한 스마트 문제 추출로 효율을 극대화합니다.
          </p>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-10 sm:mb-12 animate-fade-up"
          style={{ animationDelay: '0.1s', opacity: 0 }}
        >
          {[
            { label: '자격증', value: certifications.length.toString().padStart(2, '0') },
            { label: '총 문제', value: getTotalQuestions(certifications[0]).toString() },
            { label: '플래시카드', value: getTotalFlashcards(certifications[0]).toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-space-600 rounded-lg px-3 sm:px-5 py-3 sm:py-4 bg-space-800"
            >
              <div className="mono text-2xl sm:text-3xl font-bold text-amber-400 mb-1">{stat.value}</div>
              <div className="text-space-400 text-xs tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Cert list title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="mono text-space-400 text-xs tracking-widest whitespace-nowrap">AVAILABLE MISSIONS</div>
          <div className="flex-1 h-px bg-space-700" />
        </div>

        {/* Cert cards */}
        <div className="grid gap-4">
          {certifications.map((cert, i) => {
            const meta = CERT_METADATA[cert.id] ?? { icon: '◈', color: '#f59e0b', badge: 'CERT' }
            const totalQ = getTotalQuestions(cert)
            const totalFC = getTotalFlashcards(cert)

            return (
              <button
                key={cert.id}
                onClick={() => navigate(`/cert/${cert.id}`)}
                className="bracket-card w-full text-left border border-space-600 rounded-xl bg-space-800 p-4 sm:p-6 hover:border-amber-500/60 hover:bg-space-750 transition-all duration-300 group"
                style={{
                  animationDelay: `${0.15 + i * 0.08}s`,
                  opacity: 0,
                  animation: `fadeUp 0.5s ease-out ${0.15 + i * 0.08}s forwards`,
                }}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-6">
                  <div className="flex items-start gap-3 sm:gap-5 flex-1 min-w-0">
                    {/* Icon */}
                    <div
                      className="mono text-2xl sm:text-3xl mt-0.5 transition-transform duration-300 group-hover:scale-110 select-none flex-shrink-0"
                      style={{ color: meta.color }}
                    >
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Badge + name */}
                      <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                        <span
                          className="mono text-[10px] tracking-widest px-2 py-0.5 rounded border font-bold"
                          style={{
                            color: meta.color,
                            borderColor: `${meta.color}40`,
                            background: `${meta.color}10`,
                          }}
                        >
                          {meta.badge}
                        </span>
                        <span className="text-space-400 text-xs mono">GitHub</span>
                      </div>
                      <h2 className="display font-bold text-base sm:text-xl text-space-50 group-hover:text-amber-300 transition-colors mb-2">
                        {cert.name}
                      </h2>
                      <p className="text-space-300 text-xs sm:text-sm leading-relaxed">
                        {cert.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: stats + arrow */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-3">
                    <div className="text-space-300 mono text-xs group-hover:text-amber-400 transition-colors">
                      →
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 text-right mt-auto">
                      {[
                        { label: '도메인', value: cert.domains.length },
                        { label: '문제', value: totalQ },
                        { label: '카드', value: totalFC },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="mono text-sm sm:text-base font-bold text-space-100">{s.value}</div>
                          <div className="mono text-[9px] sm:text-[10px] text-space-400 tracking-wide">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Domain weight mini bars */}
                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-space-700 flex gap-1 sm:gap-1.5">
                  {cert.domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex-1 group/bar relative"
                      title={`${domain.name} (${Math.round(domain.weight * 100)}%)`}
                    >
                      <div className="h-1 rounded-full bg-space-700 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${domain.weight * 100}%`,
                            background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
                          }}
                        />
                      </div>
                      <div className="mono text-[8px] sm:text-[9px] text-space-500 mt-1 text-center">
                        {Math.round(domain.weight * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* Coming soon */}
        <div className="mt-4 border border-dashed border-space-700 rounded-xl p-4 sm:p-6 text-center opacity-40">
          <div className="mono text-space-400 text-xs tracking-widest mb-1">COMING SOON</div>
          <div className="display text-space-300 font-semibold text-sm sm:text-base">Azure Fundamentals (AZ-900)</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-space-700 px-4 sm:px-8 py-4 mt-8 sm:mt-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <div className="mono text-space-500 text-xs text-center sm:text-left">
            세션 내 진행상태만 유지 · 새로고침 시 초기화
          </div>
          <div className="mono text-space-600 text-xs">
            © 2026 CertPrep
          </div>
        </div>
      </footer>
    </div>
  )
}
