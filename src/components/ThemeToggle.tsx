import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      className="flex items-center gap-1.5 mono text-[11px] text-space-400 hover:text-amber-400 transition-colors px-2.5 py-1 rounded border border-space-700 hover:border-amber-500/40"
    >
      <span>{isDark ? '☀' : '☾'}</span>
      <span className="tracking-widest">{isDark ? 'LIGHT' : 'DARK'}</span>
    </button>
  )
}
