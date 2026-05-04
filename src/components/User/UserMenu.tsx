import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../Auth/AuthModal'

export default function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [examDateInput, setExamDateInput] = useState('')
  const [editingDate, setEditingDate] = useState(false)
  const { updateExamDate } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (profile?.exam_date) {
      setExamDateInput(profile.exam_date)
    }
  }, [profile?.exam_date])

  async function handleSaveDate() {
    if (!examDateInput) return
    await updateExamDate(examDateInput)
    setEditingDate(false)
  }

  async function handleSignOut() {
    setOpen(false)
    await signOut()
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthOpen(true)}
          className="mono text-xs px-3 py-1.5 rounded-lg border border-space-600 text-space-300 hover:border-amber-500/60 hover:text-amber-400 transition-all duration-200"
        >
          로그인
        </button>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    )
  }

  const avatarUrl = profile?.avatar_url ?? user.user_metadata?.['avatar_url'] as string | undefined
  const displayName = profile?.display_name ?? user.user_metadata?.['full_name'] as string | undefined ?? user.email?.split('@')[0]
  const initials = displayName?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 group"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full border border-amber-500/40 overflow-hidden flex items-center justify-center text-xs font-bold transition-all duration-200 group-hover:border-amber-400"
          style={{ background: avatarUrl ? 'transparent' : 'rgba(245,158,11,0.15)' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="mono text-amber-400 text-[10px]">{initials}</span>
          )}
        </div>
        <div
          className="mono text-space-400 text-xs transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 border border-space-600 rounded-xl bg-space-800 shadow-2xl overflow-hidden z-50"
          style={{ animation: 'fadeUp 0.15s ease-out forwards' }}
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-space-700">
            <div className="display font-semibold text-space-50 text-sm truncate">{displayName}</div>
            <div className="mono text-space-400 text-[11px] truncate">{user.email}</div>
          </div>

          {/* Streak + D-Day */}
          <div className="px-4 py-2.5 border-b border-space-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔥</span>
              <span className="mono text-space-200 text-xs">
                {profile?.streak_count ?? 0}일 연속
              </span>
            </div>
            <DayCounterInline examDate={profile?.exam_date ?? null} />
          </div>

          {/* D-Day setting */}
          <div className="px-4 py-2.5 border-b border-space-700">
            {editingDate ? (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={examDateInput}
                  onChange={(e) => setExamDateInput(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border border-space-600 bg-space-900 text-space-100 text-xs mono focus:outline-none focus:border-amber-500/60"
                />
                <button
                  onClick={handleSaveDate}
                  className="mono text-[10px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded border border-amber-500/30 hover:border-amber-500/60 transition-colors"
                >
                  저장
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingDate(true)}
                className="w-full text-left mono text-xs text-space-400 hover:text-amber-400 transition-colors flex items-center gap-2"
              >
                <span>📅</span>
                <span>{profile?.exam_date ? '시험일 변경' : '시험일 설정하기'}</span>
              </button>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); navigate('/dashboard') }}
              className="w-full text-left px-4 py-2.5 mono text-xs text-space-300 hover:text-white hover:bg-space-700 transition-all duration-150 flex items-center gap-2"
            >
              <span className="text-sm">◈</span>
              내 대시보드
            </button>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 mono text-xs text-space-400 hover:text-red-400 hover:bg-space-700 transition-all duration-150 flex items-center gap-2"
            >
              <span className="text-sm">←</span>
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DayCounterInline({ examDate }: { examDate: string | null }) {
  if (!examDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(examDate)
  exam.setHours(0, 0, 0, 0)
  const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return null
  if (diff === 0) return <span className="mono text-amber-400 text-xs font-bold">D-DAY!</span>
  return <span className="mono text-space-300 text-xs">D-{diff}</span>
}
