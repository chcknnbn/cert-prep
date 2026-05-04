import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

interface Props {
  certId: string
  contentType: 'question' | 'flashcard' | 'summary'
  contentId: string
  onRequireAuth?: () => void
}

export default function BookmarkButton({ certId, contentType, contentId, onRequireAuth }: Props) {
  const { user } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || !supabase) return
    supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('cert_id', certId)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle()
      .then(({ data }) => setBookmarked(Boolean(data)))
  }, [user, certId, contentType, contentId])

  async function toggle() {
    if (!user) {
      onRequireAuth?.()
      return
    }
    if (!supabase) return
    setLoading(true)
    if (bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('cert_id', certId)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({
        user_id: user.id,
        cert_id: certId,
        content_type: contentType,
        content_id: contentId,
      })
      setBookmarked(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={bookmarked ? '북마크 해제' : '북마크 추가'}
      className="flex items-center gap-1 px-2 py-1 rounded transition-all duration-200 disabled:opacity-50"
      style={{
        color: bookmarked ? '#f59e0b' : 'rgb(var(--space-400))',
        background: bookmarked ? 'rgba(245,158,11,0.08)' : 'transparent',
      }}
    >
      <span className="text-sm">{bookmarked ? '★' : '☆'}</span>
    </button>
  )
}
