import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

type Mode = 'login' | 'signup'

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: Props) {
  const { signInWithGitHub, signInWithGoogle, signInWithEmail, signUpWithEmail, isConfigured } = useAuth()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  async function handleOAuth(provider: 'github' | 'google') {
    setError(null)
    setLoading(true)
    try {
      if (provider === 'github') await signInWithGitHub()
      else await signInWithGoogle()
    } catch {
      setError('OAuth 로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
        onClose()
      } else {
        await signUpWithEmail(email, password, name)
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm border border-space-600 rounded-2xl bg-space-800 shadow-2xl overflow-hidden">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-space-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 mono text-space-400 hover:text-space-200 transition-colors text-lg leading-none"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="mono text-amber-500 text-xs">●</div>
            <span className="display font-bold text-space-50 text-sm tracking-tight">CERT PREP</span>
          </div>
          {!isConfigured ? (
            <p className="text-space-300 text-xs leading-relaxed">
              인증 기능을 사용하려면 <code className="mono bg-space-900 px-1 rounded text-amber-400 text-[10px]">.env</code>에
              Supabase 키를 설정하세요.
            </p>
          ) : success ? (
            <div>
              <div className="mono text-emerald-400 text-xs tracking-widest mb-1">✓ 이메일 발송됨</div>
              <p className="text-space-300 text-xs leading-relaxed">
                인증 링크를 이메일로 보냈습니다. 확인 후 로그인하세요.
              </p>
            </div>
          ) : (
            <p className="text-space-300 text-xs">
              {mode === 'login' ? '계속하려면 로그인하세요' : '새 계정을 만드세요'}
            </p>
          )}
        </div>

        {/* Body */}
        {isConfigured && !success && (
          <div className="relative px-6 py-5 space-y-4">
            {/* OAuth buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleOAuth('github')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-space-600 bg-space-700 hover:border-space-500 hover:bg-space-650 transition-all duration-200 disabled:opacity-50 group"
              >
                <svg className="w-4 h-4 text-space-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="display font-semibold text-space-100 text-sm group-hover:text-white transition-colors">
                  GitHub으로 계속하기
                </span>
              </button>

              <button
                onClick={() => handleOAuth('google')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-space-600 bg-space-700 hover:border-space-500 hover:bg-space-650 transition-all duration-200 disabled:opacity-50 group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="display font-semibold text-space-100 text-sm group-hover:text-white transition-colors">
                  Google로 계속하기
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-space-700" />
              <span className="mono text-space-500 text-[10px] tracking-widest">또는</span>
              <div className="flex-1 h-px bg-space-700" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="mono text-[10px] text-space-400 tracking-widest block mb-1.5">
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-space-600 bg-space-900 text-space-100 text-sm placeholder-space-500 focus:outline-none focus:border-amber-500/60 focus:bg-space-850 transition-all duration-200"
                  />
                </div>
              )}

              <div>
                <label className="mono text-[10px] text-space-400 tracking-widest block mb-1.5">
                  이메일
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-space-600 bg-space-900 text-space-100 text-sm placeholder-space-500 focus:outline-none focus:border-amber-500/60 focus:bg-space-850 transition-all duration-200"
                />
              </div>

              <div>
                <label className="mono text-[10px] text-space-400 tracking-widest block mb-1.5">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 rounded-lg border border-space-600 bg-space-900 text-space-100 text-sm placeholder-space-500 focus:outline-none focus:border-amber-500/60 focus:bg-space-850 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/5">
                  <p className="mono text-[11px] text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl display font-bold text-sm text-space-900 transition-all duration-200 disabled:opacity-50"
                style={{ background: '#f59e0b', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}
              >
                {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
              </button>
            </form>

            {/* Mode switch */}
            <p className="text-center mono text-[11px] text-space-400">
              {mode === 'login' ? (
                <>
                  계정이 없으신가요?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(null) }}
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    회원가입
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(null) }}
                    className="text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    로그인
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {/* Not configured state */}
        {!isConfigured && (
          <div className="relative px-6 py-5">
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 mb-4">
              <p className="mono text-[11px] text-amber-400/80 leading-relaxed">
                VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY 환경변수를 설정하면 인증 기능이 활성화됩니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-space-600 text-space-300 hover:text-white hover:border-space-500 display font-semibold text-sm transition-all duration-200"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
