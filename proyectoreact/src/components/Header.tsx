import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logoInolasa from "../assets/logo-inolasa.png";
import { useAuth } from "../auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

const Header: React.FC = () => {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
      await refresh();
      navigate("/");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Logo que redirige a / */}
        <Link to="/">
          <img
            src={logoInolasa}
            alt="Logo Inolasa"
            className="logo"
            loading="eager"
            decoding="sync"
          />
        </Link>

        <div className="header-right">
          <nav aria-label="Navegación principal">
            <ul>
              <li><Link to="/empresa">Empresa</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/preguntas">Preguntas Frecuentes</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </nav>

          {user ? (
            <button onClick={handleLogout} className="btn-verde">
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" className="btn-verde">
              Inicio de sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
