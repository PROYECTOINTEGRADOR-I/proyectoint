// Factura.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";

interface Transaccion {
  id_transaccion: number;
  id_factura: number;
  fecha_hora: string;
  pesaje_kg: number;
  material: string;
  monto_total: number;
  qr_token: string;
}

export default function Factura() {
  const { qr_token } = useParams<{ qr_token: string }>();
  const [transaccion, setTransaccion] = useState<Transaccion | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchTransaccion = async () => {
      try {
        const res = await fetch(`/api/transacciones/qr/${qr_token}`);
        const data = await res.json();
        if (res.ok) {
          setTransaccion(data.transaccion);
        } else {
          setMensaje(data.message || "No se encontró la factura");
        }
      } catch (error) {
        console.error(error);
        setMensaje("Error al obtener la factura");
      }
    };

    if (qr_token) fetchTransaccion();
  }, [qr_token]);

  if (mensaje) return <p>{mensaje}</p>;
  if (!transaccion) return <p>Cargando factura...</p>;

  const fechaObj = new Date(transaccion.fecha_hora);

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Factura Digital</h2>
      <p><strong>ID Transacción:</strong> {transaccion.id_transaccion}</p>
      <p><strong>ID Factura:</strong> {transaccion.id_factura}</p>
      <p><strong>Fecha:</strong> {fechaObj.toLocaleDateString()}</p>
      <p><strong>Hora:</strong> {fechaObj.toLocaleTimeString()}</p>
      <p><strong>Peso:</strong> {transaccion.pesaje_kg} kg</p>
      <p><strong>Material:</strong> {transaccion.material}</p>
      <p><strong>Monto:</strong> ₡ {transaccion.monto_total.toFixed(2)}</p>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <QRCode value={window.location.href} size={180} />
      </div>
    </div>
  );
}
