import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      // intenta leer el json aunque no sea 200, para mostrar el mensaje del backend
      const data = await res.json().catch(() => ({}))

      if (!res.ok || data?.success === false) {
        setError(data?.message || 'Usuario o contraseña inválidos.')
        return
      }

      const role: string = data.role
      if (role === 'Agente Manual') {
        navigate('/registrosentrega', { replace: true })
      } else if (role === 'Cajero') {
        navigate('/analizarqr', { replace: true })
      } else {
        setError('Rol no reconocido.')
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo conectar al servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <header>
          <h1 className="login-title">Iniciar Sesión</h1>
        </header>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Usuario</label>
            <input
              type="text"
              className="input"
              placeholder="Escribe tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              placeholder="Escribe tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

        <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar'}
          </button>
        </form>
      </div>
    </div>
  )
}
