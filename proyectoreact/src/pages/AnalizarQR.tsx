import { useState } from "react";
import "../styles/analizarqr.css";
import logoInolasa from "../assets/logo-inolasa.png";
import { useAuth } from "../auth";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

interface FacturaData {
  id_transaccion: number;
  fecha_hora: string;
  material: string;
  pesaje_kg: number;
  monto_total: number;
  nombre_usuario: string;
  qr_token: string;
}

export default function AnalizarQR() {
  const { user } = useAuth();
  const [facturaId, setFacturaId] = useState("");
  const [factura, setFactura] = useState<FacturaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const buscarFactura = async () => {
    if (!facturaId.trim()) {
      setError("Ingrese un ID de factura válido");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/factura/${facturaId}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Factura no encontrada");
        setFactura(null);
        return;
      }

      setFactura(data.factura);
    } catch {
      setError("Error al buscar la factura");
      setFactura(null);
    } finally {
      setLoading(false);
    }
  };

  const procesarPago = async () => {
    if (!factura || !user) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/procesar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          qr_token: factura.qr_token,
          id_cajero: user.userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al procesar el pago");
        return;
      }

      setSuccess("Pago procesado exitosamente");
      setFactura(null);
      setFacturaId("");
    } catch {
      setError("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <div className="analizarqr-container">
      <div className="analizarqr-header">
        <img src={logoInolasa} alt="INOLASA" className="header-logo" />
        <h1>Análisis de QR - Cajero</h1>
      </div>

      <div className="buscar-section">
        <div className="input-group">
          <input
            type="text"
            placeholder="Ingrese ID de factura"
            value={facturaId}
            onChange={(e) => setFacturaId(e.target.value)}
            className="factura-input"
            disabled={loading}
          />
          <button onClick={buscarFactura} disabled={loading} className="btn-buscar">
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}
      </div>

      {factura && (
        <div className="recibo-digital">
          <div className="recibo-header">
            <h2>Recibo Digital</h2>
          </div>

          <div className="recibo-content">
            <div className="recibo-row">
              <span className="label">ID</span>
              <span className="value">{factura.id_transaccion}</span>
            </div>
            <div className="recibo-row">
              <span className="label">Fecha</span>
              <span className="value">{formatFecha(factura.fecha_hora)}</span>
            </div>
            <div className="recibo-row">
              <span className="label">Peso</span>
              <span className="value">{factura.pesaje_kg}kg</span>
            </div>
            <div className="recibo-row">
              <span className="label">Material</span>
              <span className="value">{factura.material}</span>
            </div>
            <div className="recibo-row">
              <span className="label">Cliente</span>
              <span className="value">{factura.nombre_usuario}</span>
            </div>
            <div className="recibo-row total">
              <span className="label">Monto</span>
              <span className="value">{formatMonto(factura.monto_total)}</span>
            </div>
          </div>

          <div className="recibo-signature">
            <div className="signature-line">Firma digital</div>
            <p className="disclaimer">
              Este recibo es generado automáticamente y no puede ser modificado.
            </p>
          </div>

          <button onClick={procesarPago} disabled={loading} className="btn-procesar">
            {loading ? "Procesando..." : "Procesar Pago"}
          </button>
        </div>
      )}
    </div>
  );
}