import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StreakBadge from '../components/User/StreakBadge'
import DayCounter from '../components/User/DayCounter'
import UserMenu from '../components/User/UserMenu'
import ThemeToggle from '../components/ThemeToggle'
import githubFoundations from '../data/certifications/github-foundations.json'
import type { Certification } from '../types'

interface DomainStat {
  domainId: number
  domainName: string
  correct: number
  total: number
}

interface Bookmark {
  id: string
  cert_id: string
  content_type: string
  content_id: string
  created_at: string
}

// `as Certification` required: TypeScript infers JSON string literals as `string`, not literal types
const ALL_CERTS: Certification[] = [githubFoundations as Certification]

function buildDomainNameMap(): Map<number, string> {
  const map = new Map<number, string>()
  for (const cert of ALL_CERTS) {
    for (const domain of cert.domains) {
      map.set(domain.id, domain.name)
    }
  }
  return map
}

const DOMAIN_NAME_MAP = buildDomainNameMap()

export default function DashboardPage() {
  const { user, profile, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [domainStats, setDomainStats] = useState<DomainStat[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [reviewCount, setReviewCount] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!user || !supabase) {
      setStatsLoading(false)
      return
    }

    Promise.all([
      supabase
        .from('quiz_attempts')
        .select('domain_id, is_correct, question_id')
        .eq('user_id', user.id),
      supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]).then(([attemptsRes, bookmarksRes]) => {
      if (attemptsRes.data) {
        const map = new Map<number, { correct: number; total: number; name: string }>()
        for (const row of attemptsRes.data) {
          if (row.domain_id === null) continue
          const existing = map.get(row.domain_id) ?? {
            correct: 0,
            total: 0,
            name: DOMAIN_NAME_MAP.get(row.domain_id) ?? `도메인 ${row.domain_id}`,
          }
          map.set(row.domain_id, {
            ...existing,
            correct: existing.correct + (row.is_correct ? 1 : 0),
            total: existing.total + 1,
          })
        }
        setDomainStats(
          Array.from(map.entries()).map(([domainId, s]) => ({ domainId, domainName: s.name, ...s }))
        )
        const wrongIds = new Set(
          attemptsRes.data.filter((r) => !r.is_correct).map((r) => r.question_id)
        )
        setReviewCount(wrongIds.size)
      }
      if (bookmarksRes.data) {
        setBookmarks(bookmarksRes.data as Bookmark[])
      }
      setStatsLoading(false)
    }).catch(() => {
      setStatsLoading(false)
    })
  }, [user])

  function getAccuracyColor(pct: number) {
    if (pct >= 75) return '#10b981'
    if (pct >= 50) return '#f59e0b'
    return '#ef4444'
  }

  if (!isConfigured || !user) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mono text-amber-500 text-xs tracking-widest mb-3">DASHBOARD</div>
          <div className="display text-2xl font-bold text-space-50 mb-3">
            {!isConfigured ? 'Supabase 미설정' : '로그인이 필요합니다'}
          </div>
          <p className="text-space-300 text-sm mb-6 leading-relaxed">
            {!isConfigured
              ? '.env에 Supabase 키를 추가하면 학습 통계, 오답 복습, 북마크 기능이 활성화됩니다.'
              : '대시보드를 보려면 로그인이 필요합니다.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mono text-space-300 text-sm hover:text-amber-400 transition-colors"
          >
            ← 홈으로
          </button>
        </div>
      </div>
    )
  }

  const totalAttempts = domainStats.reduce((s, d) => s + d.total, 0)
  const totalCorrect = domainStats.reduce((s, d) => s + d.correct, 0)
  const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-space-900/95 backdrop-blur border-b border-space-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="mono text-space-400 text-xs hover:text-amber-400 transition-colors"
            >
              ← BACK
            </button>
            <span className="text-space-700">|</span>
            <span className="mono text-amber-500 text-xs tracking-widest">DASHBOARD</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero row */}
        <div className="mb-8 animate-fade-up">
          <div className="mono text-space-400 text-xs tracking-widest mb-2">내 학습 현황</div>
          <h1 className="display text-2xl sm:text-3xl font-bold text-space-50 mb-4">
            {profile?.display_name ?? '학습자'}의 대시보드
          </h1>
          <div className="flex flex-wrap gap-3">
            <StreakBadge />
            <DayCounter />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left column: stats */}
          <div className="lg:col-span-2 space-y-4">
            {/* Overall score card */}
            <div className="border border-space-600 rounded-xl bg-space-800 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-space-400 text-[10px] tracking-widest">전체 정답률</div>
                <div className="mono text-xs text-space-400">{totalAttempts}문제 응시</div>
              </div>
              <div className="flex items-end gap-3 mb-4">
                <div
                  className="mono text-5xl font-bold leading-none"
                  style={{ color: getAccuracyColor(overallPct) }}
                >
                  {overallPct}
                </div>
                <div className="mono text-xl text-space-400 pb-1">%</div>
                {totalAttempts > 0 && (
                  <div
                    className="mono text-xs px-2 py-0.5 rounded border ml-1 pb-1"
                    style={{
                      color: overallPct >= 75 ? '#10b981' : '#f59e0b',
                      borderColor: overallPct >= 75 ? '#10b98130' : '#f59e0b30',
                      background: overallPct >= 75 ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                    }}
                  >
                    {overallPct >= 75 ? '합격권' : '더 연습 필요'}
                  </div>
                )}
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${overallPct}%`,
                    background: getAccuracyColor(overallPct),
                    boxShadow: `0 0 8px ${getAccuracyColor(overallPct)}60`,
                    transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
            </div>

            {/* Domain breakdown */}
            <div className="border border-space-600 rounded-xl bg-space-800 p-4 sm:p-5">
              <div className="mono text-space-400 text-[10px] tracking-widest mb-4">도메인별 정확도</div>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="shimmer h-8 rounded-lg" />
                  ))}
                </div>
              ) : domainStats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mono text-space-500 text-xs mb-2">아직 응시 기록이 없습니다</div>
                  <button
                    onClick={() => navigate('/')}
                    className="mono text-amber-400 text-xs hover:text-amber-300 transition-colors"
                  >
                    모의고사 시작하기 →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {domainStats
                    .sort((a, b) => a.domainId - b.domainId)
                    .map((stat) => {
                      const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
                      const color = getAccuracyColor(pct)
                      const isWeak = pct < 60 && stat.total > 0
                      return (
                        <div key={stat.domainId}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="mono text-[10px] text-space-500">D{stat.domainId}</span>
                              <span className="text-xs text-space-300">{stat.domainName}</span>
                              {isWeak && (
                                <span className="mono text-[9px] text-red-400 tracking-widest">← 약점</span>
                              )}
                            </div>
                            <span className="mono text-xs text-space-200">{stat.correct}/{stat.total}</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${pct}%`,
                                background: color,
                                boxShadow: `0 0 6px ${color}50`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Review queue */}
            {reviewCount > 0 && (
              <div
                className="border rounded-xl p-4 sm:p-5 flex items-center justify-between"
                style={{
                  borderColor: 'rgba(245,158,11,0.3)',
                  background: 'rgba(245,158,11,0.04)',
                }}
              >
                <div>
                  <div className="mono text-amber-400 text-[10px] tracking-widest mb-1">복습 큐</div>
                  <div className="display font-bold text-space-50 text-base">
                    {reviewCount}문제 대기
                  </div>
                  <div className="mono text-space-400 text-xs mt-0.5">틀린 문제 우선 출제</div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mono text-xs px-4 py-2.5 rounded-xl transition-all duration-200"
                  style={{
                    background: '#f59e0b',
                    color: '#0a0d14',
                    boxShadow: '0 0 20px rgba(245,158,11,0.2)',
                  }}
                >
                  복습 시작
                </button>
              </div>
            )}
          </div>

          {/* Right column: bookmarks */}
          <div className="space-y-4">
            <div className="border border-space-600 rounded-xl bg-space-800 p-4 sm:p-5">
              <div className="mono text-space-400 text-[10px] tracking-widest mb-4">북마크</div>
              {statsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="shimmer h-12 rounded-lg" />)}
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-6">
                  <div className="mono text-space-500 text-xs">북마크한 항목이 없습니다</div>
                  <div className="mono text-space-600 text-[10px] mt-1">문제나 카드에서 ☆ 버튼을 누르세요</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-space-700 hover:border-space-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/cert/${bm.cert_id}`)}
                    >
                      <span className="text-amber-400 text-xs">★</span>
                      <div className="min-w-0 flex-1">
                        <div className="mono text-[9px] text-space-500 uppercase tracking-widest">
                          {bm.content_type}
                        </div>
                        <div className="mono text-xs text-space-300 truncate">{bm.content_id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="border border-space-600 rounded-xl bg-space-800 p-4">
              <div className="mono text-space-400 text-[10px] tracking-widest mb-3">학습 요약</div>
              <div className="space-y-2">
                {[
                  { label: '총 응시', value: totalAttempts.toString(), unit: '회' },
                  { label: '정답', value: totalCorrect.toString(), unit: '개' },
                  { label: '북마크', value: bookmarks.length.toString(), unit: '개' },
                  { label: '연속 학습', value: (profile?.streak_count ?? 0).toString(), unit: '일' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="mono text-xs text-space-400">{s.label}</span>
                    <span className="mono text-xs text-space-100 font-bold">
                      {s.value}
                      <span className="text-space-500 font-normal ml-0.5">{s.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
