import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'
import logoInolasa from "../assets/logo-inolasa.png";
import { FaFigma } from "react-icons/fa";
import { FaXTwitter, FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";

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
    <>
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <img
            src={logoInolasa}
            alt="Logo Inolasa"
            className="logo"
            loading="eager"
            decoding="sync"
          />
          <div className="header-right">
            <nav aria-label="Navegación principal">
              <ul>
                <li><a href="#empresa">Empresa</a></li>
                <li><a href="#servicios">Servicios</a></li>
                <li><a href="#faq">Preguntas Frecuentes</a></li>
                <li><a href="#contacto">Contacto</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Login */}
      <div className="login-page">
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
        {/* Footer */}
              <footer className="footer-verde">
                <div className="container footer-grid">
                  <div className="social" aria-label="Redes sociales">
                    <a href="https://www.figma.com/" target="_blank" rel="noopener noreferrer" aria-label="Figma">
                      <FaFigma size={20} />
                    </a>
                    <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                      <FaXTwitter size={18} />
                    </a>
                    <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <FaInstagram size={18} />
                    </a>
                    <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <FaYoutube size={18} />
                    </a>
                    <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <FaLinkedin size={18} />
                    </a>
                  </div>
        
                  <ul id="empresa">
                    <li>UI design</li>
                    <li>UX design</li>
                    <li>Wireframing</li>
                    <li>Diagramming</li>
                    <li>Brainstorming</li>
                    <li>Online whiteboard</li>
                    <li>Team collaboration</li>
                  </ul>
        
                  <ul id="servicios">
                    <li>Design</li>
                    <li>Prototyping</li>
                    <li>Development features</li>
                    <li>Design systems</li>
                    <li>Collaboration features</li>
                    <li>Design process</li>
                    <li>FigJam</li>
                  </ul>
        
                  <ul id="faq">
                    <li>Blog</li>
                    <li>Best practices</li>
                    <li>Colors</li>
                    <li>Color wheel</li>
                    <li>Support</li>
                    <li>Developers</li>
                    <li>Resource library</li>
                  </ul>
                </div>
        
                <div id="contacto" style={{ height: 1, width: 1, overflow: "hidden" }} />
              </footer>
      </div>
    </>
  )
}
