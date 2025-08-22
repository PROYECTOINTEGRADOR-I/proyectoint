import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth'

export function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireRole({ roles }: { roles: Array<'Agente Manual' | 'Cajero'> }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />
  return <Outlet />
}
