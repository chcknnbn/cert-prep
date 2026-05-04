import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface SharedScore {
  id: string
  cert_id: string
  score: number
  total: number
  domain_breakdown: Record<string, { correct: number; total: number }>
  created_at: string
  profiles?: { display_name: string | null }
}

function getAccuracyColor(pct: number) {
  if (pct >= 75) return '#10b981'
  if (pct >= 50) return '#f59e0b'
  return '#ef4444'
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<SharedScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token || !supabase) {
      setLoading(false)
      setNotFound(true)
      return
    }

    supabase
      .from('shared_scores')
      .select('*, profiles(display_name)')
      .eq('share_token', token)
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          setNotFound(true)
        } else {
          setData(row as SharedScore)
        }
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg flex items-center justify-center">
        <div className="mono text-space-400 text-xs tracking-widest animate-pulse">LOADING...</div>
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-space-900 grid-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mono text-red-400 text-xs tracking-widest mb-2">NOT FOUND</div>
          <div className="display text-2xl font-bold text-space-50 mb-4">점수를 찾을 수 없습니다</div>
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

  const pct = Math.round((data.score / data.total) * 100)
  const passed = pct >= 75
  const authorName = data.profiles?.display_name ?? '익명'
  const breakdown = data.domain_breakdown ?? {}

  return (
    <div className="min-h-screen bg-space-900 grid-bg">
      {/* Ambient */}
      <div
        className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${passed ? '#10b981' : '#ef4444'} 0%, transparent 70%)` }}
      />

      <div className="relative max-w-lg mx-auto px-4 py-12 sm:py-16">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="mono text-space-400 text-xs hover:text-amber-400 transition-colors mb-8 block"
        >
          ← CertPrep으로
        </button>

        {/* Share card */}
        <div
          className="border rounded-2xl overflow-hidden shadow-2xl"
          style={{
            borderColor: passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
          }}
        >
          {/* Header gradient */}
          <div
            className="px-6 py-8 text-center"
            style={{
              background: passed
                ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(8,12,20,0) 100%)'
                : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(8,12,20,0) 100%)',
              borderBottom: '1px solid rgb(var(--space-700))',
            }}
          >
            <div className="mono text-[10px] tracking-[0.3em] mb-3 opacity-60"
              style={{ color: passed ? '#10b981' : '#ef4444' }}>
              {passed ? '✓ PASSED' : '✗ FAILED'} · CERT PREP
            </div>

            <div className="mono font-bold mb-1"
              style={{
                fontSize: 'clamp(4rem, 20vw, 7rem)',
                lineHeight: 1,
                color: passed ? '#10b981' : '#ef4444',
              }}
            >
              {pct}
            </div>
            <div className="mono text-space-400 text-2xl mb-4">%</div>

            <div className="display text-space-100 font-semibold text-base mb-1">
              {data.score} / {data.total} 문제 정답
            </div>
            <div className="mono text-space-400 text-xs">
              {authorName}님의 {data.cert_id} 모의고사 결과
            </div>
          </div>

          {/* Domain breakdown */}
          {Object.keys(breakdown).length > 0 && (
            <div className="px-6 py-5 bg-space-800">
              <div className="mono text-[10px] text-space-400 tracking-widest mb-4">도메인별 정답률</div>
              <div className="space-y-3">
                {Object.entries(breakdown).map(([domainKey, stat]) => {
                  const dpct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
                  const color = getAccuracyColor(dpct)
                  return (
                    <div key={domainKey}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="mono text-xs text-space-300">{domainKey}</span>
                        <span className="mono text-xs text-space-200">{stat.correct}/{stat.total}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${dpct}%`, background: color, boxShadow: `0 0 6px ${color}50` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="px-6 py-5 bg-space-800 border-t border-space-700 flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl display font-bold text-sm text-space-900 transition-all duration-200"
              style={{ background: '#f59e0b', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}
            >
              나도 준비하기 →
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-4 py-3 rounded-xl border border-space-600 text-space-300 hover:text-white hover:border-space-500 mono text-xs transition-all duration-200"
            >
              URL 복사
            </button>
          </div>
        </div>

        {/* Date */}
        <div className="text-center mt-4 mono text-[11px] text-space-600">
          {new Date(data.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 기록
        </div>
      </div>
    </div>
  )
}
