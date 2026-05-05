import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import TipCard from './TipCard'
import TipForm from './TipForm'
import type { Tip } from './TipCard'

interface Props {
  certId: string
  domains: Array<{ id: number; name: string }>
  onRequireAuth?: () => void
}

type SortOrder = 'latest' | 'likes'

export default function ExamTips({ certId, domains, onRequireAuth }: Props) {
  const { user, isConfigured, isAdmin } = useAuth()
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDomain, setFilterDomain] = useState<number | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [showForm, setShowForm] = useState(false)

  async function fetchTips() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    const q = supabase
      .from('exam_tips')
      .select('*, tip_likes(count), profiles(display_name)')
      .eq('cert_id', certId)

    if (filterDomain !== 'all') q.eq('domain_id', filterDomain)
    if (sortOrder === 'latest') q.order('created_at', { ascending: false })

    const { data } = await q.limit(50)
    if (!data) { setLoading(false); return }

    const enriched = await Promise.all(
      data.map(async (tip) => {
        let isLiked = false
        if (user && supabase) {
          const { data: likeRow } = await supabase
            .from('tip_likes')
            .select('tip_id')
            .eq('tip_id', tip.id)
            .eq('user_id', user.id)
            .maybeSingle()
          isLiked = Boolean(likeRow)
        }
        return {
          ...tip,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          like_count: (tip.tip_likes as any)?.[0]?.count ?? 0,
          is_liked: isLiked,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          author_name: (tip.profiles as any)?.display_name ?? 'anonymous',
        } as Tip
      })
    )

    const sorted =
      sortOrder === 'likes'
        ? enriched.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
        : enriched

    setTips(sorted)
    setLoading(false)
  }

  useEffect(() => { fetchTips() }, [certId, filterDomain, sortOrder, user])  // eslint-disable-line

  if (!isConfigured) {
    return (
      <div className="text-center py-12">
        <div className="mono text-space-500 text-xs mb-2">Supabase 미설정</div>
        <p className="text-space-400 text-sm">인증 기능을 활성화하면 꿀팁을 공유할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {/* Domain filter */}
          <button
            onClick={() => setFilterDomain('all')}
            className="mono text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-150"
            style={{
              borderColor: filterDomain === 'all' ? '#f59e0b' : 'rgb(var(--space-600))',
              background: filterDomain === 'all' ? 'rgba(245,158,11,0.08)' : 'transparent',
              color: filterDomain === 'all' ? '#f59e0b' : 'rgb(var(--space-400))',
            }}
          >
            전체
          </button>
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setFilterDomain(d.id)}
              className="mono text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-150"
              style={{
                borderColor: filterDomain === d.id ? '#f59e0b' : 'rgb(var(--space-600))',
                background: filterDomain === d.id ? 'rgba(245,158,11,0.08)' : 'transparent',
                color: filterDomain === d.id ? '#f59e0b' : 'rgb(var(--space-400))',
              }}
            >
              D{d.id}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex gap-1 p-0.5 rounded-lg border border-space-600 bg-space-900">
            {([['latest', '최신순'], ['likes', '좋아요순']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortOrder(val)}
                className="mono text-[10px] px-3 py-1.5 rounded transition-all duration-150"
                style={{
                  background: sortOrder === val ? 'rgb(var(--space-700))' : 'transparent',
                  color: sortOrder === val ? 'rgb(var(--space-100))' : 'rgb(var(--space-400))',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => user ? setShowForm(true) : onRequireAuth?.()}
            className="mono text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              background: '#f59e0b',
              color: '#0a0d14',
            }}
          >
            + 꿀팁 작성
          </button>
        </div>
      </div>

      {/* Tips list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-28 rounded-xl" />
          ))}
        </div>
      ) : tips.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-space-700 rounded-xl">
          <div className="mono text-space-500 text-xs mb-2">아직 꿀팁이 없습니다</div>
          <p className="text-space-400 text-sm mb-4">첫 번째 꿀팁을 공유해보세요!</p>
          <button
            onClick={() => user ? setShowForm(true) : onRequireAuth?.()}
            className="mono text-amber-400 text-xs hover:text-amber-300 transition-colors"
          >
            꿀팁 작성하기 →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              domains={domains}
              onRequireAuth={onRequireAuth}
              isAdmin={isAdmin}
              onDelete={(id) => setTips((prev) => prev.filter((t) => t.id !== id))}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TipForm
          certId={certId}
          domains={domains}
          onClose={() => setShowForm(false)}
          onSuccess={fetchTips}
        />
      )}
    </div>
  )
}
