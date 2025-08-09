import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegistrosEntrega from "./pages/RegistrosEntrega";
import AnalizarQR from "./pages/AnalizarQR";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registrosentrega" element={<RegistrosEntrega />} />
      <Route path="/analizarqr" element={<AnalizarQR />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
