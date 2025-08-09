import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegistrosEntrega from "./pages/RegistrosEntrega";
import AnalizarQR from "./pages/AnalizarQR";

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<Home />} />

      {/* Rutas existentes */}
      <Route path="/login" element={<Login />} />
      <Route path="/registrosentrega" element={<RegistrosEntrega />} />
      <Route path="/analizarqr" element={<AnalizarQR />} />

      {/* Cualquier otra ruta -> Home (o cambia a /login si prefieres) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
