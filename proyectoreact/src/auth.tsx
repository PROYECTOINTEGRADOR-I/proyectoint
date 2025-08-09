import React, { createContext, useContext, useEffect, useState } from 'react'

export type User = { userId: number; role: 'Agente Manual' | 'Cajero' }

type AuthState = { user: User | null; loading: boolean; refresh: () => Promise<void> }

const AuthCtx = createContext<AuthState>({ user: null, loading: true, refresh: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser({ userId: data.userId, role: data.role })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  return <AuthCtx.Provider value={{ user, loading, refresh }}>{children}</AuthCtx.Provider>
}

export function useAuth() { return useContext(AuthCtx) }
