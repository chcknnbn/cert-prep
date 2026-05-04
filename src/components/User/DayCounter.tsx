import { useAuth } from '../../context/AuthContext'

interface Props {
  compact?: boolean
}

export default function DayCounter({ compact = false }: Props) {
  const { user, profile } = useAuth()
  if (!user || !profile?.exam_date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(profile.exam_date)
  exam.setHours(0, 0, 0, 0)
  const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return null

  const label = diff === 0 ? 'D-DAY!' : `D-${diff}`
  const isUrgent = diff <= 7

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm">📅</span>
        <span
          className="mono text-xs font-bold"
          style={{ color: isUrgent ? '#f59e0b' : 'rgb(var(--space-300))' }}
        >
          {label}
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
      style={{
        borderColor: isUrgent ? 'rgba(245,158,11,0.4)' : 'rgba(96,165,250,0.3)',
        background: isUrgent ? 'rgba(245,158,11,0.06)' : 'rgba(96,165,250,0.04)',
      }}
    >
      <span className="text-base">📅</span>
      <div>
        <div
          className="mono text-xs font-bold leading-tight"
          style={{ color: isUrgent ? '#f59e0b' : '#60a5fa' }}
        >
          {label}
        </div>
        <div className="mono text-space-400 text-[9px] tracking-wide">
          {diff === 0 ? '오늘이 시험일!' : '시험까지'}
        </div>
      </div>
    </div>
  )
}
