import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegistrosEntrega from "./pages/RegistrosEntrega";
import AnalizarQR from "./pages/AnalizarQR";

export default function App() {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Home />} />

      {/* Páginas secundarias */}
      <Route path="/login" element={<Login />} />
      <Route path="/registrosentrega" element={<RegistrosEntrega />} />
      <Route path="/analizarqr" element={<AnalizarQR />} />

      {/* Si la ruta no existe → manda al Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
