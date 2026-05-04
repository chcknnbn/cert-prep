import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

interface Props {
  certId: string
  domains: Array<{ id: number; name: string }>
  onClose: () => void
  onSuccess: () => void
}

export default function TipForm({ certId, domains, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [domainId, setDomainId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState(3)
  const [hoverDiff, setHoverDiff] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayDiff = hoverDiff ?? difficulty

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !supabase) return
    if (content.trim().length < 10) { setError('최소 10자 이상 입력해주세요.'); return }
    setError(null)
    setLoading(true)
    const { error: insertError } = await supabase.from('exam_tips').insert({
      user_id: user.id,
      cert_id: certId,
      domain_id: domainId,
      content: content.trim(),
      difficulty,
    })
    setLoading(false)
    if (insertError) { setError(insertError.message); return }
    onSuccess()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-md border border-space-600 rounded-2xl bg-space-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-space-700 flex items-center justify-between">
          <div>
            <div className="mono text-amber-500 text-[10px] tracking-widest mb-0.5">EXAM TIPS</div>
            <h2 className="display font-bold text-space-50 text-base">꿀팁 작성</h2>
          </div>
          <button
            onClick={onClose}
            className="mono text-space-400 hover:text-space-200 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Domain */}
          <div>
            <label className="mono text-[10px] text-space-400 tracking-widest block mb-2">연관 도메인</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDomainId(null)}
                className="mono text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-150"
                style={{
                  borderColor: domainId === null ? '#f59e0b' : 'rgb(var(--space-600))',
                  background: domainId === null ? 'rgba(245,158,11,0.08)' : 'transparent',
                  color: domainId === null ? '#f59e0b' : 'rgb(var(--space-400))',
                }}
              >
                전체
              </button>
              {domains.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDomainId(d.id)}
                  className="mono text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-150"
                  style={{
                    borderColor: domainId === d.id ? '#f59e0b' : 'rgb(var(--space-600))',
                    background: domainId === d.id ? 'rgba(245,158,11,0.08)' : 'transparent',
                    color: domainId === d.id ? '#f59e0b' : 'rgb(var(--space-400))',
                  }}
                >
                  D{d.id}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="mono text-[10px] text-space-400 tracking-widest block mb-2">
              체감 난이도
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverDiff(i + 1)}
                  onMouseLeave={() => setHoverDiff(null)}
                  onClick={() => setDifficulty(i + 1)}
                  className="text-xl transition-transform duration-100 hover:scale-110"
                  style={{ color: i < displayDiff ? '#f59e0b' : 'rgb(var(--space-600))' }}
                >
                  ★
                </button>
              ))}
              <span className="mono text-xs text-space-400 ml-2 self-center">
                {['', '아주 쉬움', '쉬움', '보통', '어려움', '아주 어려움'][displayDiff]}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="mono text-[10px] text-space-400 tracking-widest block mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="시험 준비에 도움이 됐던 팁을 공유해주세요. (최소 10자)"
              rows={4}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-space-600 bg-space-900 text-space-100 text-sm placeholder-space-500 focus:outline-none focus:border-amber-500/60 resize-none transition-all duration-200"
            />
            <div className="mono text-[10px] text-space-500 text-right mt-1">{content.length}자</div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/5">
              <p className="mono text-[11px] text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-space-600 text-space-300 hover:text-white hover:border-space-500 display font-semibold text-sm transition-all duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || content.trim().length < 10}
              className="flex-1 py-3 rounded-xl display font-bold text-sm text-space-900 transition-all duration-200 disabled:opacity-40"
              style={{ background: '#f59e0b', boxShadow: '0 0 20px rgba(245,158,11,0.2)' }}
            >
              {loading ? '저장 중...' : '작성 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
