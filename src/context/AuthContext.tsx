import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  exam_date: string | null
  streak_count: number
  last_study_date: string | null
}

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  isConfigured: boolean
  signInWithGitHub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateExamDate: (date: string) => Promise<void>
  updateStreak: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: false,
  isConfigured: false,
  signInWithGitHub: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  updateExamDate: async () => {},
  updateStreak: async () => {},
  refreshProfile: async () => {},
})

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data as Profile | null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const p = await fetchProfile(user.id)
    setProfile(p)
  }, [user])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfile(user.id).then(setProfile)
    } else {
      setProfile(null)
    }
  }, [user])

  async function signInWithGitHub() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signInWithGoogle() {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  async function signInWithEmail(email: string, password: string) {
    if (!supabase) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    if (!supabase) return
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function updateExamDate(date: string) {
    if (!supabase || !user) return
    await supabase
      .from('profiles')
      .update({ exam_date: date })
      .eq('id', user.id)
    await refreshProfile()
  }

  async function updateStreak() {
    if (!supabase || !user) return

    const todayStr = new Date().toLocaleDateString('en-CA')

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('en-CA')

    const lastDate = profile?.last_study_date ?? null
    const currentStreak = profile?.streak_count ?? 0

    if (lastDate === todayStr) return

    const newStreak = lastDate === yesterdayStr ? currentStreak + 1 : 1

    const { error } = await supabase
      .from('profiles')
      .update({ streak_count: newStreak, last_study_date: todayStr })
      .eq('id', user.id)

    if (error) throw new Error(`streak 업데이트 실패: ${error.message}`)

    await refreshProfile()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithGitHub,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateExamDate,
        updateStreak,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
