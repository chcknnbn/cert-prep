import { useAuth } from '../../context/AuthContext'

interface Props {
  compact?: boolean
}

export default function StreakBadge({ compact = false }: Props) {
  const { user, profile } = useAuth()
  if (!user || !profile) return null

  const count = profile.streak_count ?? 0
  if (count === 0) return null

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm">🔥</span>
        <span className="mono text-amber-400 text-xs font-bold">{count}</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
      style={{
        borderColor: 'rgba(245,158,11,0.3)',
        background: 'rgba(245,158,11,0.06)',
      }}
    >
      <span className="text-base">🔥</span>
      <div>
        <div className="mono text-amber-400 text-xs font-bold leading-tight">{count}일 연속</div>
        <div className="mono text-space-400 text-[9px] tracking-wide">STREAK</div>
      </div>
    </div>
  )
}
