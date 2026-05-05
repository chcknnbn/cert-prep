import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export interface Tip {
  id: string
  user_id: string
  cert_id: string
  domain_id: number | null
  content: string
  difficulty: number
  created_at: string
  like_count?: number
  is_liked?: boolean
  author_name?: string
}

interface Props {
  tip: Tip
  domains: Array<{ id: number; name: string }>
  onDomainClick?: (domainId: number) => void
  onRequireAuth?: () => void
  onDelete?: (tipId: string) => void
  isAdmin?: boolean
}

function DifficultyStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="text-[11px]"
          style={{ color: i < value ? '#f59e0b' : 'rgb(var(--space-600))' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  return `${Math.floor(days / 30)}달 전`
}

export default function TipCard({ tip, domains, onDomainClick, onRequireAuth, onDelete, isAdmin = false }: Props) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(tip.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(tip.like_count ?? 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const canDelete = isAdmin || user?.id === tip.user_id

  async function handleDelete() {
    if (!supabase || !canDelete) return
    setDeleteLoading(true)
    const { error } = await supabase.from('exam_tips').delete().eq('id', tip.id)
    setDeleteLoading(false)
    if (!error) onDelete?.(tip.id)
  }

  const domain = domains.find((d) => d.id === tip.domain_id)

  async function toggleLike() {
    if (!user) { onRequireAuth?.(); return }
    if (!supabase) return
    setLikeLoading(true)
    if (liked) {
      await supabase.from('tip_likes').delete()
        .eq('tip_id', tip.id).eq('user_id', user.id)
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
    } else {
      await supabase.from('tip_likes').insert({ tip_id: tip.id, user_id: user.id })
      setLiked(true)
      setLikeCount((c) => c + 1)
    }
    setLikeLoading(false)
  }

  return (
    <div className="border border-space-600 rounded-xl bg-space-800 p-4 hover:border-space-500 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-space-700 border border-space-600 flex items-center justify-center">
            <span className="mono text-[9px] text-space-400">U</span>
          </div>
          <span className="mono text-xs text-space-300">
            {tip.author_name ?? 'anonymous'}
          </span>
          {isAdmin && <span className="mono text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-500 bg-amber-500/05">ADMIN</span>}
        </div>
        <div className="flex items-center gap-2">
          <DifficultyStars value={tip.difficulty} />
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              title="삭제"
              className="mono text-[11px] text-space-500 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {deleteLoading ? '…' : '✕'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-space-200 text-sm leading-relaxed mb-3">{tip.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Domain tag */}
          {domain && (
            <button
              onClick={() => onDomainClick?.(domain.id)}
              className="mono text-[10px] px-2 py-0.5 rounded border transition-colors duration-150 hover:border-amber-500/40 hover:text-amber-400"
              style={{
                color: 'rgb(var(--space-400))',
                borderColor: 'rgb(var(--space-600))',
              }}
            >
              🏷 D{domain.id} {domain.name}
            </button>
          )}
          <span className="mono text-[10px] text-space-500">{timeAgo(tip.created_at)}</span>
        </div>

        {/* Like button */}
        <button
          onClick={toggleLike}
          disabled={likeLoading}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-150 disabled:opacity-50"
          style={{
            color: liked ? '#ef4444' : 'rgb(var(--space-400))',
            background: liked ? 'rgba(239,68,68,0.06)' : 'transparent',
          }}
        >
          <span className="text-sm">{liked ? '♥' : '♡'}</span>
          <span className="mono text-[11px]">{likeCount}</span>
        </button>
      </div>
    </div>
  )
}
