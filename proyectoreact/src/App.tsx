import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegistrosEntrega from "./pages/RegistrosEntrega";
import AnalizarQR from "./pages/AnalizarQR";

// nuevas páginas
import Empresa from "./pages/Empresa";
import Servicios from "./pages/Servicios";
import Preguntas from "./pages/Preguntas";
import Contacto from "./pages/Contacto";

export default function App() {
  return (
    <div className="app-wrapper">
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Home />} />

        {/* Nuevas secciones */}
        <Route path="/empresa" element={<Empresa />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/preguntas" element={<Preguntas />} />
        <Route path="/contacto" element={<Contacto />} />

        {/* Rutas existentes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrosentrega" element={<RegistrosEntrega />} />
        <Route path="/analizarqr" element={<AnalizarQR />} />

        {/* Cualquier otra ruta -> Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
